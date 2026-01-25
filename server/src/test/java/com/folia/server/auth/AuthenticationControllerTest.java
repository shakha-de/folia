package com.folia.server.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.folia.server.exceptions.TokenNotFoundException;
import com.folia.server.exceptions.TokenExpiredException;
import com.folia.server.exceptions.TokenRevokedException;
import com.folia.server.common.messages.MessageKey;
import com.folia.server.user.UserDto;
import com.folia.server.user.UserRole;
import com.folia.server.exceptions.ApiExceptionHandler;
import com.folia.server.common.messages.MessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = AuthenticationControllerTest.TestApp.class, webEnvironment = SpringBootTest.WebEnvironment.MOCK)
class AuthenticationControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void login_Success_ReturnsAuthResponse() throws Exception {
        LoginRequest loginRequest = new LoginRequest("testuser", "password");
        AuthResponse authResponse = new AuthResponse("access-token", "refresh-token",
                new UserDto(UUID.randomUUID(), "testuser", "test@example.com", UserRole.CITIZEN, true));

        when(authenticationService.authenticate(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"));
    }

    @Test
    void refresh_Success_ReturnsNewAuthResponse() throws Exception {
        TokenRefreshRequest refreshRequest = new TokenRefreshRequest("old-refresh-token");
        AuthResponse authResponse = new AuthResponse("new-access-token", "new-refresh-token",
                new UserDto(UUID.randomUUID(), "testuser", "test@example.com", UserRole.CITIZEN, true));

        when(authenticationService.refreshToken(any(TokenRefreshRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/refresh-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("new-access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("new-refresh-token"));
    }

    @Test
    void refresh_TokenNotFound_Returns404() throws Exception {
        TokenRefreshRequest refreshRequest = new TokenRefreshRequest("non-existent-token");

        when(authenticationService.refreshToken(any(TokenRefreshRequest.class)))
                .thenThrow(new TokenNotFoundException(MessageKey.AUTH_REFRESH_TOKEN_NOT_FOUND));

        mockMvc.perform(post("/api/auth/refresh-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Not found"));
    }

    @Test
    void refresh_TokenExpired_Returns401() throws Exception {
        TokenRefreshRequest refreshRequest = new TokenRefreshRequest("expired-token");

        when(authenticationService.refreshToken(any(TokenRefreshRequest.class)))
                .thenThrow(new TokenExpiredException(MessageKey.AUTH_REFRESH_TOKEN_EXPIRED));

        mockMvc.perform(post("/api/auth/refresh-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Unauthorized"));
    }

    @Test
    void refresh_TokenRevoked_Returns401() throws Exception {
        TokenRefreshRequest refreshRequest = new TokenRefreshRequest("revoked-token");

        when(authenticationService.refreshToken(any(TokenRefreshRequest.class)))
                .thenThrow(new TokenRevokedException(MessageKey.AUTH_REFRESH_TOKEN_REVOKED));

        mockMvc.perform(post("/api/auth/refresh-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Unauthorized"));
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            FlywayAutoConfiguration.class
    })
    @Import({ AuthenticationController.class, ApiExceptionHandler.class, MockConfig.class })
    static class TestApp {
    }

    @TestConfiguration
    static class MockConfig {
        @Bean
        @Primary
        AuthenticationService authenticationService() {
            return Mockito.mock(AuthenticationService.class);
        }

        @Bean
        @Primary
        MessageService messageService() {
            return Mockito.mock(MessageService.class);
        }

        @Bean
        public ObjectMapper objectMapper() {
            return new ObjectMapper().findAndRegisterModules();
        }
    }
}
