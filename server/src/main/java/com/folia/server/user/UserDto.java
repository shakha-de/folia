package com.folia.server.user;

import java.util.UUID;

public record UserDto(
        UUID uuid,
        String username,
        String email,
        UserRole role,
        boolean enabled
) {
    public static UserDto from(User user) {
        return new UserDto(
                user.getUuid(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled()
        );
    }
}
