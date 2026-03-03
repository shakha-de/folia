package com.folia.server.tree;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.folia.server.user.User;
import com.folia.server.user.UserRole;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import com.folia.server.common.messages.MessageKey;
import com.folia.server.common.messages.MessageService;
import com.folia.server.exceptions.ApiExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.mockito.Mockito;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@SpringBootTest(classes = TreeControllerTest.TestApp.class, webEnvironment = SpringBootTest.WebEnvironment.MOCK)
class TreeControllerTest {

    private static final GeometryFactory GEOMETRY_FACTORY =
        new GeometryFactory(new PrecisionModel(), 4326);


    @Autowired
    WebApplicationContext webApplicationContext;

    MockMvc mockMvc;

    @Autowired
    TreeService treeService;

    @Autowired
    MessageService messageService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        Mockito.reset(treeService, messageService);
        when(messageService.get(eq(MessageKey.TREES_NEARBY_RETRIEVED_SUCCESSFULLY), any(Locale.class), any(Object[].class)))
                .thenReturn("Nearby trees retrieved successfully");
        when(messageService.get(eq(MessageKey.TREES_NEARBY_RETRIEVED_SUCCESSFULLY), isNull(), any(Object[].class)))
                .thenReturn("Nearby trees retrieved successfully");
    }

    @Test
    void nearby_validParams_returns200AndJson() throws Exception {
        Tree tree = Tree.builder()
                .publicId(UUID.fromString("00000000-0000-0000-0000-000000000001"))
                .species("Acer platanoides")
                .build();

        when(treeService.findTreesNearby(52.52, 13.405, 250)).thenReturn(List.of(tree));

        mockMvc.perform(get("/api/trees/nearby")
                        .param("lat", "52.52")
                        .param("lng", "13.405")
                        .param("radiusMeters", "250"))
                .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Nearby trees retrieved successfully"))
            .andExpect(jsonPath("$.data[0].publicId").value("00000000-0000-0000-0000-000000000001"))
            .andExpect(jsonPath("$.data[0].species").value("Acer platanoides"));

        verify(treeService).findTreesNearby(52.52, 13.405, 250);
    }

    @Test
    void nearby_invalidRadius_returns400() throws Exception {
        mockMvc.perform(get("/api/trees/nearby")
                        .param("lat", "52.52")
                        .param("lng", "13.405")
                        .param("radiusMeters", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void nearby_invalidLat_returns400() throws Exception {
        mockMvc.perform(get("/api/trees/nearby")
                        .param("lat", "-91")
                        .param("lng", "13.405")
                        .param("radiusMeters", "250"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void nearby_invalidLng_returns400() throws Exception {
        mockMvc.perform(get("/api/trees/nearby")
                        .param("lat", "52.52")
                        .param("lng", "181")
                        .param("radiusMeters", "250"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void adoptTree_validRequest_returns200AndJson() throws Exception {
        UUID userUuid = UUID.randomUUID();
        UUID treePublicId = UUID.fromString("00000000-0000-0000-0000-000000000002");

        User user = User.builder()
            .uuid(userUuid)
            .username("alice")
            .email("alice@example.com")
            .passwordHash("x")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build();

        Tree tree = Tree.builder()
                .id(1L)
                .publicId(treePublicId)
                .species("Quercus robur")
                .location(point(13.0050,52.8200))
                .commonName("shaptoli")
                .soilMoistureLevel(SoilMoistureLevel.DRY)
                .healthStatus(TreeHealthStatus.HEALTHY)
                .registeredBy(user)
                .build();
        log.info("Test tree: {}", tree);


        when(treeService.adoptTree(eq(treePublicId), nullable(User.class)))
            .thenReturn(tree);
        when(messageService.get(eq(MessageKey.TREE_ADOPTED_SUCCESSFULLY), any(Locale.class), any(Object[].class)))
                .thenReturn("Tree adopted successfully");

        mockMvc.perform(post("/api/trees/00000000-0000-0000-0000-000000000002/adopt")
                        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Tree adopted successfully"))
                .andExpect(jsonPath("$.data.publicId").value("00000000-0000-0000-0000-000000000002"))
                .andExpect(jsonPath("$.data.species").value("Quercus robur"));

        verify(treeService).adoptTree(eq(treePublicId), nullable(User.class));
    }

    @Test
    void registerTree_validRequest_returns201AndJson() throws Exception {
        UUID userUuid = UUID.randomUUID();
        UUID treePublicId = UUID.fromString("00000000-0000-0000-0000-000000000002");

        CreateTreeRequest req = new
            CreateTreeRequest(
            "Quercus robur",
            "shaptoli",
            13.4050,52.5200,
            SoilMoistureLevel.DRY,
            TreeHealthStatus.HEALTHY,
            null
        );

        User user = User.builder()
            .uuid(userUuid)
            .username("alice")
            .email("alice@example.com")
            .passwordHash("x")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build();

        Tree tree = Tree.builder()
            .id(1L)
            .publicId(treePublicId)
            .species("Quercus robur")
            .location(point(15.4050,52.2200))
            .commonName("shaptoli")
            .soilMoistureLevel(SoilMoistureLevel.DRY)
            .healthStatus(TreeHealthStatus.HEALTHY)
            .registeredBy(user)
            .build();
        when(treeService.createTree(any(CreateTreeRequest.class), nullable(User.class))).thenReturn(tree);
        when(messageService.get(eq(MessageKey.TREE_CREATED_SUCCESSFULLY), any(Locale.class), any(Object[].class)))
                .thenReturn("Tree created successfully");
        when(messageService.get(eq(MessageKey.TREE_CREATED_SUCCESSFULLY), isNull(), any(Object[].class)))
            .thenReturn("Tree created successfully");

        mockMvc.perform(post("/api/trees")
            .contentType(MediaType.APPLICATION_JSON)
            .content(new ObjectMapper().writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Tree created successfully"))
            .andExpect(jsonPath("$.data.publicId").value("00000000-0000-0000-0000-000000000002"))
            .andExpect(jsonPath("$.data.species").value("Quercus robur"));

        verify(treeService).createTree(any(CreateTreeRequest.class), nullable(User.class));

    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class
    })
        @Import({TreeController.class, ApiExceptionHandler.class, MockConfig.class})
    static class TestApp {
    }

    @TestConfiguration
    static class MockConfig {
        @Bean
        @Primary
        TreeService treeService() {
            return Mockito.mock(TreeService.class);
        }

        @Bean
        @Primary
        MessageService messageService() {
            return Mockito.mock(MessageService.class);
        }
    }
    private static Point point(double lng, double lat) {
        return GEOMETRY_FACTORY.createPoint(new Coordinate(lng, lat));
    }
}
