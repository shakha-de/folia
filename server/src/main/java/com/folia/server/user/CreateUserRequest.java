package com.folia.server.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank
        @Size(min = 3, max = 50)
        String username,

        @Email
        String email,

        @NotBlank
        @Size(min = 6, max = 200)
        String password
) {
}
