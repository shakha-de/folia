package com.folia.server.common.messages;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MessageKey {
    // ================= COMMON =================
    COMMON_SUCCESS("common.success"),
    COMMON_FAILURE("common.failure"),
    COMMON_UNEXPECTED_ERROR("common.unexpected.error"),
    COMMON_VALIDATION_FAILED("common.validation.failed"),

    // ================= USER: SUCCESS ==========
    USER_CREATED("user.created"),
    USER_UPDATED("user.updated"),
    USER_DELETED("user.deleted"),
    USER_RETRIEVED("user.retrieved"),
    USERS_RETRIEVED("users.retrieved"),

    // ================= USER: ERROR ============
    USER_NOT_FOUND("user.not.found"),
    USER_EMAIL_ALREADY_EXISTS("user.email.exists"),
    USER_USERNAME_ALREADY_EXISTS("user.username.exists"),
    USER_NOT_ENABLED("user.not.enabled"),
    USER_EMAIL_NOT_VERIFIED("user.email.not.verified"),

    // ================= AUTH ===================
    AUTH_LOGIN_SUCCESS("auth.login.success"),
    AUTH_LOGIN_FAILED("auth.login.failed"),
    AUTH_LOGOUT_SUCCESS("auth.logout.success"),
    AUTH_INVALID_CREDENTIALS("auth.invalid.credentials"),
    AUTH_ACCESS_DENIED("auth.access.denied"),
    AUTH_TOKEN_EXPIRED("auth.token.expired"),
    AUTH_TOKEN_INVALID("auth.token.invalid"),

    // ============== VALIDATION (USER) ========
    VALIDATION_USER_USERNAME_INVALID("validation.user.username.invalid"),
    VALIDATION_USER_EMAIL_INVALID("validation.user.email.invalid"),
    VALIDATION_USER_PASSWORD_WEAK("validation.user.password.weak"),
    VALIDATION_USER_PHONE_INVALID("validation.user.phone.invalid"),

    // ============== LOCATION / SETTINGS =======
    USER_HOME_LOCATION_INVALID("user.location.invalid"),
    USER_NOTIFICATION_RADIUS_INVALID("user.notification.radius.invalid"),

    // ============== REPUTATION / ROLE =========
    USER_ROLE_INVALID("user.role.invalid"),
    USER_REPUTATION_TOO_LOW("user.reputation.too.low");

    private final String value;
}
