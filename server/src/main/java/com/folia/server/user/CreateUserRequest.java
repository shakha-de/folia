package com.folia.server.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank(message = "{validation.user.username.invalid}")
        @Size(min = 3, max = 50, message = "{validation.user.username.short}")
        String username,

        @Email(message = "{validation.user.email.invalid}")
        String email,

        @NotBlank(message = "{validation.user.password.invalid}")
        @Size(min = 8, max = 200, message = "{validation.user.password.weak}")
        String password
) {
}
