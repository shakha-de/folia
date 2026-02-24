package com.folia.server.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "{validation.user.username.required}")
    private String username;

    @NotBlank(message = "{validation.user.email.required}")
    @Email(message = "{validation.user.email.invalid}")
    private String email;

    @NotBlank(message = "{validation.user.password.required}")
    private String password;
}
