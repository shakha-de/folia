package com.folia.server;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class ServerApplicationTests extends AbstractIntegrationTest {

	@Autowired
	JdbcTemplate jdbcTemplate;

	@Test
	@SuppressWarnings("SqlNoDataSourceInspection")
	void contextLoads() {
		String regclass = jdbcTemplate.queryForObject("select to_regclass('public.trees')", String.class);
		assertThat(regclass).isNotNull();
	}
}

