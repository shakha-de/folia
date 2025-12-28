package com.folia.server.auth;

import com.folia.server.user.UserDto;

public record AuthResponse(
        String token,
        String refreshToken,
        UserDto user
) {
}

