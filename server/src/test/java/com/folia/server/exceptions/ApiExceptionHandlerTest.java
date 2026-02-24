package com.folia.server.exceptions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.folia.server.common.messages.MessageKey;
import com.folia.server.common.messages.MessageService;
import com.folia.server.auth.AuthenticationController;
import com.folia.server.auth.AuthenticationService;
import com.folia.server.auth.RegisterRequest;
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

import java.util.Locale;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = ApiExceptionHandlerTest.TestApp.class, webEnvironment = SpringBootTest.WebEnvironment.MOCK)
class ApiExceptionHandlerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private MessageService messageService;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private static final String VALIDATION_MESSAGE_DE = "Validation fehlgeschlagen";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // Mock common validation failed message
        when(messageService.get(eq(MessageKey.VALIDATION_FAILED), any(Locale.class)))
                .thenReturn(VALIDATION_MESSAGE_DE);

        // Mock field translations
        when(messageService.resolve(eq("field.password"), eq("password"), any(Locale.class)))
                .thenReturn("Passwort");
        when(messageService.resolve(eq("field.username"), eq("username"), any(Locale.class)))
                .thenReturn("Benutzername");
        when(messageService.resolve(eq("field.email"), eq("email"), any(Locale.class)))
                .thenReturn("E-Mail");
    }

    @Test
    void register_missingPassword_returns400WithTranslatedFieldAndMessage() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("naturelover")
                .email("leaf@example.com")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(VALIDATION_MESSAGE_DE))
                .andExpect(jsonPath("$.errors.Passwort").exists());
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
    }
}

