package com.folia.server.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "{validation.user.identifier.required}")
        String identifier,
        @NotBlank(message = "{validation.user.password.required}")
        String password
) {
}

