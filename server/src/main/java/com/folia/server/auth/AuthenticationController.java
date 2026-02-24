package com.folia.server.auth;

import com.folia.server.common.ApiResponse;
import com.folia.server.common.messages.MessageKey;
import com.folia.server.common.messages.MessageService;
import com.folia.server.common.util.ResponseUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;
    private final MessageService messageService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @RequestBody @Valid LoginRequest request,
            Locale locale) {
        return ResponseUtils.ok(service.authenticate(request), messageService.get(MessageKey.AUTH_LOGIN_SUCCESS, locale));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @RequestBody @Valid TokenRefreshRequest request,
            Locale locale) {
        return ResponseUtils.ok(service.refreshToken(request), messageService.get(MessageKey.AUTH_REFRESH_TOKEN_REFRESHED_SUCCESS, locale));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @RequestBody @Valid RegisterRequest request,
            Locale locale) {
        return ResponseUtils.created(service.register(request), messageService.get(MessageKey.USER_CREATED, locale));
    }
}
