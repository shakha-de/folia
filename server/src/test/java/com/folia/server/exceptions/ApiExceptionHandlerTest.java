package com.folia.server.exceptions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.folia.server.common.messages.MessageKey;
import com.folia.server.common.messages.MessageService;
import com.folia.server.auth.AuthenticationController;
import com.folia.server.auth.AuthenticationService;
import com.folia.server.auth.RegisterRequest;
import com.folia.server.tree.TreeController;
import com.folia.server.tree.TreeService;
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
import java.util.Arrays;

import static org.hamcrest.Matchers.containsString;
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

        // Mock enum error message
        when(messageService.get(eq(MessageKey.INVALID_ENUM_VALUE), any(Locale.class), any(Object[].class)))
                .thenAnswer(invocation -> {
                    Object[] args;
                    Object thirdArg = invocation.getArgument(2);
                    if (thirdArg instanceof Object[]) {
                        args = (Object[]) thirdArg;
                    } else {
                        Object[] allArgs = invocation.getArguments();
                        args = Arrays.copyOfRange(allArgs, 2, allArgs.length);
                    }
                    String invalidValue = args.length > 0 ? String.valueOf(args[0]) : "";
                    String fieldName = args.length > 1 ? String.valueOf(args[1]) : "";
                    String accepted = args.length > 2 ? String.valueOf(args[2]) : "";
                    return String.format("Invalid value '%s' for field '%s'. Accepted values are: %s", invalidValue, fieldName, accepted);
                });

        // Mock field translations
        when(messageService.resolve(eq("field.password"), eq("password"), any(Locale.class)))
                .thenReturn("Passwort");
        when(messageService.resolve(eq("field.username"), eq("username"), any(Locale.class)))
                .thenReturn("Benutzername");
        when(messageService.resolve(eq("field.email"), eq("email"), any(Locale.class)))
                .thenReturn("E-Mail");
        when(messageService.resolve(eq("field.soilMoistureLevel"), eq("soilMoistureLevel"), any(Locale.class)))
                .thenReturn("soilMoistureLevel");
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

    @Test
    void createTree_invalidEnum_returns400WithExactField() throws Exception {
        String payload = "{\"species\":\"Quercus robur\"," +
                "\"commonName\":\"Stieleiche\"," +
                "\"lat\":51.4822," +
                "\"lng\":11.9693," +
                "\"soilMoistureLevel\":\"NOMODERATE\"," +
                "\"healthStatus\":\"HEALTHY\"," +
                "\"metadata\":{\"plantedDate\":\"2023-05-15\",\"caretakerId\":\"staff_042\"}}";

        mockMvc.perform(post("/api/trees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(VALIDATION_MESSAGE_DE))
                .andExpect(jsonPath("$.errors.soilMoistureLevel", containsString("NOMODERATE")))
                .andExpect(jsonPath("$.errors.soilMoistureLevel", containsString("soilMoistureLevel")))
                .andExpect(jsonPath("$.errors.soilMoistureLevel", containsString("MODERATE")));
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            FlywayAutoConfiguration.class
    })
    @Import({ AuthenticationController.class, TreeController.class, ApiExceptionHandler.class, MockConfig.class })
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
        TreeService treeService() {
            return Mockito.mock(TreeService.class);
        }

        @Bean
        @Primary
        MessageService messageService() {
            return Mockito.mock(MessageService.class);
        }
    }
}
