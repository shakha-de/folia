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
import static org.springframework.http.MediaType.APPLICATION_JSON;
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
    void create_validRequest_returns201AndApiResponse() throws Exception {
        UUID uuid = UUID.fromString("00000000-0000-0000-0000-000000000001");
        User created = User.builder()
            .uuid(uuid)
            .username("alice")
            .email("alice@example.com")
            .passwordHash("hashed")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build();

        when(userService.createUser(any(CreateUserRequest.class))).thenReturn(created);
        when(messageService.get(eq(MessageKey.USER_CREATED), any(Locale.class), any(Object[].class))).thenReturn("created");

        mockMvc.perform(post("/api/users")
                .contentType(APPLICATION_JSON)
                .content("{\"username\":\"alice\",\"email\":\"alice@example.com\",\"password\":\"secret123\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("created"))
            .andExpect(jsonPath("$.data.uuid").value(uuid.toString()))
            .andExpect(jsonPath("$.data.username").value("alice"))
            .andExpect(jsonPath("$.data.email").value("alice@example.com"))
            .andExpect(jsonPath("$.data.role").value("CITIZEN"))
            .andExpect(jsonPath("$.data.enabled").value(true));

        verify(userService).createUser(any(CreateUserRequest.class));
        verify(messageService).get(eq(MessageKey.USER_CREATED), any(Locale.class), any(Object[].class));
    }

    @Test
    void create_invalidBody_returns400() throws Exception {
        mockMvc.perform(post("/api/users")
                .contentType(APPLICATION_JSON)
                .content("{\"username\":\"ab\",\"email\":\"not-an-email\",\"password\":\"123\"}"))
            .andExpect(status().isBadRequest());
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

        mockMvc.perform(get("/api/users/{uuid}", uuid))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.title").value("Not found"))
            .andExpect(jsonPath("$.detail").value("USER_NOT_FOUND"));
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
