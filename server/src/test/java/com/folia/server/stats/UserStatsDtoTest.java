package com.folia.server.stats;

import com.folia.server.user.User;
import com.folia.server.user.UserRole;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class UserStatsDtoTest {

    @Test
    void from_rankSeedKeeper() {
        UserStats stats = createStats(0);
        UserStatsDto dto = UserStatsDto.from(stats);

        assertThat(dto.rank()).isEqualTo("Seed Keeper");
        assertThat(dto.nextRank()).isEqualTo("Seedling Saver");
        assertThat(dto.xpToNextRank()).isEqualTo(200);
        assertThat(dto.progressPercent()).isZero();
    }

    @Test
    void from_rankSeedlingSaver() {
        UserStats stats = createStats(250);
        UserStatsDto dto = UserStatsDto.from(stats);

        assertThat(dto.rank()).isEqualTo("Seedling Saver");
        assertThat(dto.nextRank()).isEqualTo("Sapling Steward");
        assertThat(dto.xpToNextRank()).isEqualTo(250);
        assertThat(dto.progressPercent()).isGreaterThan(0).isLessThan(100);
    }

    @Test
    void from_rankBranchGuardian() {
        UserStats stats = createStats(1500);
        UserStatsDto dto = UserStatsDto.from(stats);

        assertThat(dto.rank()).isEqualTo("Branch Guardian");
        assertThat(dto.nextRank()).isEqualTo("Canopy Keeper");
        assertThat(dto.xpToNextRank()).isEqualTo(1000);
    }

    @Test
    void from_rankAncientGroveMaster() {
        UserStats stats = createStats(10000);
        UserStatsDto dto = UserStatsDto.from(stats);

        assertThat(dto.rank()).isEqualTo("Ancient Grove Master");
        assertThat(dto.nextRank()).isEqualTo("Ancient Grove Master");
        assertThat(dto.xpToNextRank()).isZero();
        assertThat(dto.progressPercent()).isEqualTo(100);
    }

    @Test
    void from_progressCalculation() {
        UserStats stats = createStats(600); // 100 XP into Sapling Steward (500-1000)
        UserStatsDto dto = UserStatsDto.from(stats);

        assertThat(dto.progressPercent()).isEqualTo(20); // 100 / 500 = 20%
    }

    @Test
    void from_co2Offset() {
        UserStats stats = createStats(100);
        stats.setTreesRegistered(5);
        
        UserStatsDto dto = UserStatsDto.from(stats);

        assertThat(dto.co2OffsetKg()).isEqualTo(15); // 5 * 3.1 = 15.5 rounded to 15
    }

    @Test
    void from_unlockedBadges() {
        User user = User.builder()
            .uuid(UUID.randomUUID())
            .username("alice")
            .email("alice@example.com")
            .passwordHash("x")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build();

        UserStats stats = UserStats.builder()
            .user(user)
            .xp(100)
            .treesRegistered(1)
            .wateringsLogged(1)
            .currentWateringsStreak(0)
            .unlockedBadgeIds(List.of("planter", "first_drop"))
            .build();

        UserStatsDto dto = UserStatsDto.from(stats);

        assertThat(dto.unlockedBadges()).containsKeys("planter", "first_drop");
        assertThat(dto.unlockedBadges().get("planter")).isInstanceOf(java.util.Map.class);
    }

    @Test
    void from_allFields() {
        UserStats stats = createStats(750);
        stats.setTreesRegistered(3);
        stats.setWateringsLogged(12);
        stats.setCurrentWateringsStreak(4);

        UserStatsDto dto = UserStatsDto.from(stats);

        assertThat(dto.xp()).isEqualTo(750);
        assertThat(dto.treesRegistered()).isEqualTo(3);
        assertThat(dto.wateringsLogged()).isEqualTo(12);
        assertThat(dto.currentWateringsStreak()).isEqualTo(4);
        assertThat(dto.progressPercent()).isGreaterThan(0);
    }

    private UserStats createStats(int xp) {
        User user = User.builder()
            .uuid(UUID.randomUUID())
            .username("testuser")
            .email("test@example.com")
            .passwordHash("x")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build();

        return UserStats.builder()
            .user(user)
            .xp(xp)
            .treesRegistered(0)
            .wateringsLogged(0)
            .currentWateringsStreak(0)
            .unlockedBadgeIds(new java.util.ArrayList<>())
            .build();
    }
}
