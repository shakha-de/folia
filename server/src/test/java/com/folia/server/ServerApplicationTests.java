package com.folia.server;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
class ServerApplicationTests {

	@Container
	static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>(
			DockerImageName.parse("postgis/postgis:15-3.3-alpine").asCompatibleSubstituteFor("postgres")
	)
			.withDatabaseName("folia")
			.withUsername("folia")
			.withPassword("folia");

	@DynamicPropertySource
	static void datasourceProps(DynamicPropertyRegistry registry) {
		systemProperties(registry);
	}

	@Autowired
	JdbcTemplate jdbcTemplate;

	private static void systemProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
		registry.add("spring.datasource.username", POSTGRES::getUsername);
		registry.add("spring.datasource.password", POSTGRES::getPassword);
		registry.add("spring.jpa.defer-datasource-initialization", () -> "true");
		registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
		registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.spatial.dialect.postgis.PostgisPG10Dialect");
		registry.add("spring.flyway.enabled", () -> "true");
	}

	@Test
	void contextLoads() {
		String regclass = jdbcTemplate.queryForObject("select to_regclass('public.trees')", String.class);
		assertThat(regclass).isNotNull();
	}

}
