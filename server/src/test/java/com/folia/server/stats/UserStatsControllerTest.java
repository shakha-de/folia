package com.folia.server.stats;

import com.folia.server.activity.ActivityDto;
import com.folia.server.common.messages.MessageKey;
import com.folia.server.common.messages.MessageService;
import com.folia.server.user.User;
import com.folia.server.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = UserStatsControllerTest.TestApp.class, webEnvironment = SpringBootTest.WebEnvironment.MOCK)
class UserStatsControllerTest {

    @Autowired
    WebApplicationContext webApplicationContext;

    MockMvc mockMvc;

    @Autowired
    UserStatsService statsService;

    @Autowired
    MessageService messageService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        Mockito.reset(statsService, messageService);
        when(messageService.get(any(MessageKey.class), any(Locale.class)))
            .thenReturn("Success");
        when(messageService.get(any(MessageKey.class), isNull(), any(Object[].class)))
            .thenReturn("Success");
    }

    @Test
    void getMyStats_returns200() throws Exception {
        UserStats stats = UserStats.builder()
            .xp(500)
            .treesRegistered(2)
            .wateringsLogged(8)
            .currentWateringsStreak(3)
            .unlockedBadgeIds(new ArrayList<>())
            .build();

        when(statsService.getMyStats(any())).thenReturn(stats);

        mockMvc.perform(get("/api/users/me/stats"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.xp").value(500))
            .andExpect(jsonPath("$.data.rank").value("Sapling Steward"));
    }

    @Test
    void getMyActivities_returns200WithPageableData() throws Exception {
        ActivityDto activity1 = new ActivityDto(
            UUID.randomUUID(),
            "bob",
            "Oak",
            "WATERED",
            10,
            LocalDateTime.now()
        );

        Page<ActivityDto> page = new PageImpl<>(List.of(activity1), PageRequest.of(0, 10), 1);
        
        when(statsService.getMyActivities(any(), eq(0), eq(10))).thenReturn(page);

        mockMvc.perform(get("/api/users/me/activities")
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].username").value("bob"));
    }

    @Test
    void getLeaderboard_returns200() throws Exception {
        List<LeaderboardEntryDto> entries = List.of(
            new LeaderboardEntryDto(1, "alice", 5000, "Forest Warden"),
            new LeaderboardEntryDto(2, "bob", 3000, "Branch Guardian")
        );

        Page<LeaderboardEntryDto> page = new PageImpl<>(entries, PageRequest.of(0, 50), 100);

        when(statsService.getLeaderboard(0, 50)).thenReturn(page);

        mockMvc.perform(get("/api/users/leaderboard")
                .param("page", "0")
                .param("size", "50"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].position").value(1));
    }

    @Test
    void getPositionInLeaderboard_returns200() throws Exception {
        when(statsService.getUserPositionInLeaderboard(any())).thenReturn(42L);

        mockMvc.perform(get("/api/users/leaderboard/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").value(42));
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class
    })
    @Import({UserStatsController.class, MockConfig.class})
    static class TestApp {
    }

    @TestConfiguration
    static class MockConfig {
        @Bean
        @Primary
        UserStatsService statsService() {
            return Mockito.mock(UserStatsService.class);
        }

        @Bean
        @Primary
        MessageService messageService() {
            return Mockito.mock(MessageService.class);
        }
    }
}
