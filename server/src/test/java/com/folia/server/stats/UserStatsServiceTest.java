package com.folia.server.stats;

import com.folia.server.tree.Tree;
import com.folia.server.tree.TreeHealthStatus;
import com.folia.server.user.User;
import com.folia.server.user.UserRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserStatsServiceTest {

    @Mock
    private UserStatsRepository statsRepo;

    @Mock
    private com.folia.server.activity.TreeActivityRepository activityRepo;

    @InjectMocks
    private UserStatsService statsService;

    @Test
    void onRegistered_createsStatsAndAwardsBadge() {
        User user = User.builder()
            .uuid(UUID.randomUUID())
            .username("alice")
            .email("alice@example.com")
            .passwordHash("x")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build();

        when(statsRepo.findByUser(user)).thenReturn(Optional.empty());
        when(statsRepo.save(any(UserStats.class))).thenAnswer(invocation -> {
            UserStats stats = invocation.getArgument(0);
            if (stats.getUnlockedBadgeIds() == null) {
                stats.setUnlockedBadgeIds(new ArrayList<>());
            }
            return stats;
        });

        statsService.onRegistered(user);

        verify(statsRepo).save(argThat(stats ->
            stats.getXp() == 1 &&
            stats.getTreesRegistered() == 1 &&
            stats.getUnlockedBadgeIds().contains("planter")
        ));
    }

    @Test
    void onWatered_awardsMilestoneXp() {
        User user = User.builder()
            .uuid(UUID.randomUUID())
            .username("bob")
            .email("bob@example.com")
            .passwordHash("x")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build();

        Tree tree = Tree.builder()
            .species("Oak")
            .healthStatus(TreeHealthStatus.HEALTHY)
            .build();

        LocalDate today = LocalDate.now();
        UserStats stats = UserStats.builder()
            .user(user)
            .xp(0)
            .wateringsLogged(0)
            .currentWateringsStreak(0)
            .unlockedBadgeIds(new ArrayList<>())
            .build();

        when(statsRepo.findByUser(user)).thenReturn(Optional.of(stats));
        when(statsRepo.save(any(UserStats.class))).thenAnswer(invocation -> invocation.getArgument(0));

        statsService.onWatered(user, tree);

        verify(statsRepo).save(argThat(updatedStats ->
            updatedStats.getXp() == 10 &&
            updatedStats.getWateringsLogged() == 1 &&
            updatedStats.getCurrentWateringsStreak() == 1 &&
            updatedStats.getLastWateredDate().equals(today)
        ));
    }

    @Test
    void onWatered_dyingTreeBonusXp() {
        User user = User.builder()
            .uuid(UUID.randomUUID())
            .username("charlie")
            .email("charlie@example.com")
            .passwordHash("x")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build();

        Tree tree = Tree.builder()
            .species("Oak")
            .healthStatus(TreeHealthStatus.DYING)
            .build();

        UserStats stats = UserStats.builder()
            .user(user)
            .xp(0)
            .wateringsLogged(0)
            .currentWateringsStreak(0)
            .dyingTreesWatered(0)
            .unlockedBadgeIds(new ArrayList<>())
            .build();

        when(statsRepo.findByUser(user)).thenReturn(Optional.of(stats));
        when(statsRepo.save(any(UserStats.class))).thenAnswer(invocation -> invocation.getArgument(0));

        statsService.onWatered(user, tree);

        verify(statsRepo).save(argThat(updatedStats ->
            updatedStats.getXp() == 30 && // 10 base + 20 bonus
            updatedStats.getDyingTreesWatered() == 1
        ));
    }

    @Test
    void onWatered_streakBonus() {
        User user = User.builder()
            .uuid(UUID.randomUUID())
            .username("diana")
            .email("diana@example.com")
            .passwordHash("x")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build();

        Tree tree = Tree.builder()
            .species("Oak")
            .healthStatus(TreeHealthStatus.HEALTHY)
            .build();

        LocalDate today = LocalDate.now();
        UserStats stats = UserStats.builder()
            .user(user)
            .xp(0)
            .wateringsLogged(6)
            .currentWateringsStreak(6)
            .lastWateredDate(today.minusDays(1))
            .unlockedBadgeIds(new ArrayList<>())
            .build();

        when(statsRepo.findByUser(user)).thenReturn(Optional.of(stats));
        when(statsRepo.save(any(UserStats.class))).thenAnswer(invocation -> invocation.getArgument(0));

        statsService.onWatered(user, tree);

        verify(statsRepo).save(argThat(updatedStats ->
            updatedStats.getXp() == 85 && // 10 base + 75 weekly bonus
            updatedStats.getCurrentWateringsStreak() == 7
        ));
    }

    @Test
    void awardBadge_droughtBuster() {
        User user = User.builder().uuid(UUID.randomUUID()).username("eve").build();
        
        UserStats stats = UserStats.builder()
            .unlockedBadgeIds(new ArrayList<>())
            .user(user)
            .xp(50)
            .treesRegistered(0)
            .wateringsLogged(0)
            .currentWateringsStreak(0)
            .dyingTreesWatered(5)
            .build();

        when(statsRepo.findByUser(user)).thenReturn(Optional.of(stats));
        when(statsRepo.save(any(UserStats.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Tree dyingTree = Tree.builder().healthStatus(TreeHealthStatus.DYING).build();
        statsService.onWatered(user, dyingTree);

        verify(statsRepo).save(argThat(s ->
            s.getUnlockedBadgeIds().contains("drought_buster")
        ));
    }

    @Test
    void awardBadge_centurion() {
        User user = User.builder().uuid(UUID.randomUUID()).username("frank").build();
        UserStats stats = UserStats.builder()
            .user(user)
            .xp(990)
            .treesRegistered(0)
            .wateringsLogged(0)
            .currentWateringsStreak(0)
            .unlockedBadgeIds(new ArrayList<>())
            .build();

        when(statsRepo.findByUser(user)).thenReturn(Optional.of(stats));
        when(statsRepo.save(any(UserStats.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Tree tree = Tree.builder().healthStatus(TreeHealthStatus.HEALTHY).build();
        statsService.onWatered(user, tree);

        verify(statsRepo).save(argThat(s ->
            s.getUnlockedBadgeIds().contains("centurion")
        ));
    }

    @Test
    void getLeaderboard_returnsPagedResults() {
        UserStats stats1 = UserStats.builder().xp(5000).user(User.builder().username("alice").build()).build();
        UserStats stats2 = UserStats.builder().xp(3000).user(User.builder().username("bob").build()).build();
        
        Page<UserStats> page = new PageImpl<>(List.of(stats1, stats2), PageRequest.of(0, 10), 2);
        
        when(statsRepo.findAllByOrderByXpDesc(PageRequest.of(0, 10))).thenReturn(page);

        Page<LeaderboardEntryDto> result = statsService.getLeaderboard(0, 10);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).position()).isEqualTo(1);
        assertThat(result.getContent().get(0).xp()).isEqualTo(5000);
        assertThat(result.getContent().get(1).position()).isEqualTo(2);
        assertThat(result.getContent().get(1).xp()).isEqualTo(3000);
    }

    @Test
    void getUserPositionInLeaderboard() {
        User user = User.builder().uuid(UUID.randomUUID()).username("charlie").build();
        UserStats stats1 = UserStats.builder().xp(5000).build();
        UserStats stats2 = UserStats.builder().xp(4000).build();
        
        when(statsRepo.getUsersWithHigherXp(user)).thenReturn(List.of(stats1, stats2));

        long position = statsService.getUserPositionInLeaderboard(user);

        assertThat(position).isEqualTo(3); // 2 users with higher XP + 1
    }
}
