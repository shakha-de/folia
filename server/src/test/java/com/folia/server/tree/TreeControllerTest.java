package com.folia.server.tree;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import com.folia.server.ApiExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.mockito.Mockito;

import java.util.List;
import java.util.UUID;

@SpringBootTest(classes = TreeControllerTest.TestApp.class, webEnvironment = SpringBootTest.WebEnvironment.MOCK)
class TreeControllerTest {

    @Autowired
    WebApplicationContext webApplicationContext;

    MockMvc mockMvc;

    @Autowired
    TreeService treeService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
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
                .andExpect(jsonPath("$[0].publicId").value("00000000-0000-0000-0000-000000000001"))
                .andExpect(jsonPath("$[0].species").value("Acer platanoides"));

        verify(treeService).findTreesNearby(eq(52.52), eq(13.405), eq(250));
    }

    @Test
    void nearby_invalidRadius_returns400() throws Exception {
        mockMvc.perform(get("/api/trees/nearby")
                        .param("lat", "52.52")
                        .param("lng", "13.405")
                        .param("radiusMeters", "0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void nearby_invalidLat_returns400() throws Exception {
        mockMvc.perform(get("/api/trees/nearby")
                        .param("lat", "-91")
                        .param("lng", "13.405")
                        .param("radiusMeters", "250"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void nearby_invalidLng_returns400() throws Exception {
        mockMvc.perform(get("/api/trees/nearby")
                        .param("lat", "52.52")
                        .param("lng", "181")
                        .param("radiusMeters", "250"))
                .andExpect(status().isBadRequest());
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            FlywayAutoConfiguration.class
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
    }
}
