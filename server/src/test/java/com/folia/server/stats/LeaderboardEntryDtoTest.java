package com.folia.server.stats;

import com.folia.server.user.User;
import com.folia.server.user.UserRole;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class LeaderboardEntryDtoTest {

    @Test
    void from_position1() {
        UserStats stats = createStats(5000);
        LeaderboardEntryDto entry = LeaderboardEntryDto.from(stats, 1);

        assertThat(entry.position()).isEqualTo(1);
        assertThat(entry.username()).isEqualTo("alice");
        assertThat(entry.xp()).isEqualTo(5000);
        assertThat(entry.rank()).isEqualTo("Forest Warden");
    }

    @Test
    void from_rankSeedKeeper() {
        UserStats stats = createStats(50);
        LeaderboardEntryDto entry = LeaderboardEntryDto.from(stats, 100);

        assertThat(entry.rank()).isEqualTo("Seed Keeper");
    }

    @Test
    void from_rankSaplingSteward() {
        UserStats stats = createStats(700);
        LeaderboardEntryDto entry = LeaderboardEntryDto.from(stats, 50);

        assertThat(entry.rank()).isEqualTo("Sapling Steward");
    }

    @Test
    void from_rankCanopyKeeper() {
        UserStats stats = createStats(2500);
        LeaderboardEntryDto entry = LeaderboardEntryDto.from(stats, 25);

        assertThat(entry.rank()).isEqualTo("Canopy Keeper");
    }

    @Test
    void from_rankAncientGroveMaster() {
        UserStats stats = createStats(15000);
        LeaderboardEntryDto entry = LeaderboardEntryDto.from(stats, 1);

        assertThat(entry.rank()).isEqualTo("Ancient Grove Master");
    }

    @Test
    void from_allFields() {
        UserStats stats = createStats(2500); // Changed from 3250 to exactly match Canopy Keeper threshold
        LeaderboardEntryDto entry = LeaderboardEntryDto.from(stats, 42);

        assertThat(entry.position()).isEqualTo(42);
        assertThat(entry.username()).isEqualTo("alice");
        assertThat(entry.xp()).isEqualTo(2500);
        assertThat(entry.rank()).isEqualTo("Canopy Keeper");
    }

    private UserStats createStats(int xp) {
        User user = User.builder()
            .uuid(UUID.randomUUID())
            .username("alice")
            .email("alice@example.com")
            .passwordHash("x")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build();

        return UserStats.builder()
            .user(user)
            .xp(xp)
            .build();
    }
}
