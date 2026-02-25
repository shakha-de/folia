package com.folia.server.auth;

import jakarta.validation.constraints.NotBlank;

public record TokenRefreshRequest(
        @NotBlank(message = "{validation.user.refreshToken.invalid}") String refreshToken
) {
}
