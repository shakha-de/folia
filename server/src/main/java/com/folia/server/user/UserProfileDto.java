package com.folia.server.user;

import com.folia.server.stats.UserStatsDto;

import java.util.UUID;

public record UserProfileDto(
    UUID uuid,
    String username,
    String email,
    UserRole role,
    boolean enabled,
    String displayName,
    String bio,
    String profileImageUrl,
    UserStatsDto stats,
    long leaderboardPosition
) {
    public static UserProfileDto from(User user, UserStatsDto stats, long leaderboardPosition) {
        return new UserProfileDto(
            user.getUuid(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.isEnabled(),
            user.getDisplayName(),
            user.getBio(),
            user.getProfileImageUrl(),
            stats,
            leaderboardPosition
        );
    }
}
