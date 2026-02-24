package com.folia.server.user;

import com.folia.server.common.messages.MessageKey;
import com.folia.server.common.messages.MessageService;
import com.folia.server.exceptions.ApiExceptionHandler;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = UserControllerTest.TestApp.class, webEnvironment = SpringBootTest.WebEnvironment.MOCK)
class UserControllerTest {

    @Autowired
    WebApplicationContext webApplicationContext;

    @Autowired
    UserService userService;

    @Autowired
    MessageService messageService;

    MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void all_returns200AndList() throws Exception {
        UUID uuid = UUID.fromString("00000000-0000-0000-0000-000000000002");
        User user = User.builder()
            .uuid(uuid)
            .username("bob")
            .email("bob@example.com")
            .passwordHash("x")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build();

        when(userService.getAllUsers()).thenReturn(List.of(user));
        when(messageService.get(eq(MessageKey.USERS_RETRIEVED), any(Locale.class), any(Object[].class))).thenReturn("ok");

        mockMvc.perform(get("/api/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("ok"))
            .andExpect(jsonPath("$.data[0].uuid").value(uuid.toString()))
            .andExpect(jsonPath("$.data[0].username").value("bob"));

        verify(userService).getAllUsers();
        verify(messageService).get(eq(MessageKey.USERS_RETRIEVED), any(Locale.class), any(Object[].class));
    }

    @Test
    void byUuid_existing_returns200() throws Exception {
        UUID uuid = UUID.fromString("00000000-0000-0000-0000-000000000003");
        User user = User.builder()
            .uuid(uuid)
            .username("carol")
            .email("carol@example.com")
            .passwordHash("x")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build();

        when(userService.getUserByUuid(uuid)).thenReturn(user);
        when(messageService.get(eq(MessageKey.USER_RETRIEVED), any(Locale.class), any(Object[].class))).thenReturn("retrieved");

        mockMvc.perform(get("/api/users/{uuid}", uuid))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("retrieved"))
            .andExpect(jsonPath("$.data.uuid").value(uuid.toString()))
            .andExpect(jsonPath("$.data.username").value("carol"));

        verify(userService).getUserByUuid(uuid);
        verify(messageService).get(eq(MessageKey.USER_RETRIEVED), any(Locale.class), any(Object[].class));
    }

    @Test
    void byUuid_missing_returns404ProblemDetail() throws Exception {
        UUID uuid = UUID.fromString("00000000-0000-0000-0000-000000000004");
        when(userService.getUserByUuid(uuid)).thenThrow(new com.folia.server.exceptions.UserNotFoundException(MessageKey.USER_NOT_FOUND, uuid));
        when(messageService.get(eq(MessageKey.USER_NOT_FOUND), any(Locale.class), eq(uuid))).thenReturn("User not found");

        mockMvc.perform(get("/api/users/{uuid}", uuid))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("User not found"))
            .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    void delete_existing_returns200AndNullData() throws Exception {
        UUID uuid = UUID.fromString("00000000-0000-0000-0000-000000000005");
        when(messageService.get(eq(MessageKey.USER_DELETED), any(Locale.class), any(Object[].class))).thenReturn("deleted");

        mockMvc.perform(delete("/api/users/{uuid}", uuid))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("deleted"))
            .andExpect(jsonPath("$.data").value(nullValue()));

        verify(userService).deleteUserByUuid(uuid);
        verify(messageService).get(eq(MessageKey.USER_DELETED), any(Locale.class), any(Object[].class));
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        FlywayAutoConfiguration.class
    })
    @Import({UserController.class, ApiExceptionHandler.class, MockConfig.class})
    static class TestApp {
    }

    @TestConfiguration
    static class MockConfig {
        @Bean
        @Primary
        UserService userService() {
            return Mockito.mock(UserService.class);
        }

        @Bean
        @Primary
        MessageService messageService() {
            return Mockito.mock(MessageService.class);
        }
    }
}
