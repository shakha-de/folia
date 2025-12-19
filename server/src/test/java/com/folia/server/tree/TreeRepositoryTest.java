package com.folia.server.tree;

import static org.assertj.core.api.Assertions.assertThat;

import com.folia.server.ServerApplication;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.List;
import java.util.UUID;

@SpringBootTest(classes = ServerApplication.class, webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers
class TreeRepositoryTest {

    private static final GeometryFactory GEOMETRY_FACTORY =
            new GeometryFactory(new PrecisionModel(), 4326);

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>(
            DockerImageName.parse("postgis/postgis:15-3.3-alpine").asCompatibleSubstituteFor("postgres")
    )
            .withDatabaseName("folia")
            .withUsername("folia")
            .withPassword("folia");

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);

        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.spatial.dialect.postgis.PostgisPG10Dialect");
    }

    @Autowired
    TreeRepository treeRepository;

    @Test
    void findByPublicId_returnsEntity() {
        UUID publicId = UUID.randomUUID();

        Tree saved = treeRepository.save(Tree.builder()
                .publicId(publicId)
                .species("Acer platanoides")
                .commonName("Norway maple")
                .location(point(13.4050, 52.5200))
                .soilMoistureLevel(SoilMoistureLevel.MODERATE)
                .healthStatus(TreeHealthStatus.HEALTHY)
                .build());

        Tree loaded = treeRepository.findByPublicId(publicId).orElseThrow();
        assertThat(loaded.getId()).isEqualTo(saved.getId());
        assertThat(loaded.getPublicId()).isEqualTo(publicId);
    }

    @Test
    void findNearby_filtersByRadiusAndOrdersByDistance() {
        // Center: Berlin (lat 52.5200, lng 13.4050)
        Tree near = treeRepository.save(Tree.builder()
                .publicId(UUID.randomUUID())
                .species("Tilia cordata")
                .commonName("Small-leaved lime")
                .location(point(13.4050, 52.5200))
                .soilMoistureLevel(SoilMoistureLevel.DRY)
                .healthStatus(TreeHealthStatus.STRESSED)
                .build());

        // ~150m east
        Tree mid = treeRepository.save(Tree.builder()
                .publicId(UUID.randomUUID())
                .species("Quercus robur")
                .commonName("English oak")
                .location(point(13.4072, 52.5200))
                .soilMoistureLevel(SoilMoistureLevel.WET)
                .healthStatus(TreeHealthStatus.HEALTHY)
                .build());

        // Far away (~14km)
        treeRepository.save(Tree.builder()
                .publicId(UUID.randomUUID())
                .species("Betula pendula")
                .commonName("Silver birch")
                .location(point(13.6050, 52.5200))
                .soilMoistureLevel(SoilMoistureLevel.DRY)
                .healthStatus(TreeHealthStatus.HEALTHY)
                .build());

        List<Tree> results = treeRepository.findNearby(52.5200, 13.4050, 2000);
        assertThat(results).extracting(Tree::getId).containsExactly(near.getId(), mid.getId());
    }

    private static Point point(double lng, double lat) {
        return GEOMETRY_FACTORY.createPoint(new Coordinate(lng, lat));
    }
}
