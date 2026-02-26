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
    INTERNAL_SERVER_ERROR("internal.server.error"),

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

    // ================= DATA INTEGRITY =========
    DATA_DUPLICATE_VALUE("data.duplicate.value"),
    DATA_VALIDATION_FAILED("data.validation.failed"),
    INVALID_ENUM_VALUE("error.invalid.enum.value"),

    // ================= AUTH ===================
    AUTH_LOGIN_SUCCESS("auth.login.success"),
    AUTH_LOGIN_FAILED("auth.login.failed"),
    AUTH_LOGOUT_SUCCESS("auth.logout.success"),
    AUTH_INVALID_CREDENTIALS("auth.invalid.credentials"),
    AUTH_ACCESS_DENIED("auth.access.denied"),
    AUTH_TOKEN_EXPIRED("auth.token.expired"),
    AUTH_TOKEN_INVALID("auth.token.invalid"),
    AUTH_REFRESH_TOKEN_EXPIRED("auth.refresh.token.expired"),
    AUTH_REFRESH_TOKEN_REVOKED("auth.refresh.token.revoked"),
    AUTH_REFRESH_TOKEN_NOT_FOUND("auth.refresh.token.not.found"),
    AUTH_REFRESH_TOKEN_REFRESHED_SUCCESS("auth.refresh.token.refresh.success"),

    // ============== TREE: ERROR ============
    TREE_NOT_FOUND("tree.not.found"),

    // ============== VALIDATION (USER) ========
    VALIDATION_FAILED("validation.failed"),
    VALIDATION_USER_USERNAME_INVALID("validation.user.username.invalid"),
    VALIDATION_USER_EMAIL_INVALID("validation.user.email.invalid"),
    VALIDATION_USER_PASSWORD_WEAK("validation.user.password.weak"),
    VALIDATION_USER_PASSWORD_INVALID("validation.user.password.invalid"),
    VALIDATION_USER_PHONE_INVALID("validation.user.phone.invalid"),
    VALIDATION_USER_USERNAME_SHORT("validation.user.username.short"),

    // ============== VALIDATION (TREE) ========
    VALIDATION_TREE_SPECIES_BLANK("validation.tree.species.blank"),
    VALIDATION_TREE_LAT_NULL("validation.tree.lat.null"),
    VALIDATION_TREE_LNG_NULL("validation.tree.lng.null"),
    VALIDATION_TREE_LAT_INVALID("validation.tree.lat.invalid"),
    VALIDATION_TREE_LNG_INVALID("validation.tree.lng.invalid"),
    VALIDATION_TREE_SOIL_MOISTURE_NULL("validation.tree.soilMoisture.null"),
    VALIDATION_TREE_HEALTH_STATUS_NULL("validation.tree.healthStatus.null"),

    // ============== LOCATION / SETTINGS =======
    USER_HOME_LOCATION_INVALID("user.location.invalid"),
    USER_NOTIFICATION_RADIUS_INVALID("user.notification.radius.invalid"),

    // ============== REPUTATION / ROLE =========
    USER_ROLE_INVALID("user.role.invalid"),
    USER_REPUTATION_TOO_LOW("user.reputation.too.low"),

    // ============== TREE ======================
    TREES_RETRIEVED_SUCCESSFULLY("trees.retrieved.successfully"),
    TREE_RETRIEVED_SUCCESSFULLY("tree.retrieved.successfully"),
    TREE_CREATED_SUCCESSFULLY("tree.created.successfully"),
    TREE_WATERED_SUCCESSFULLY("tree.watered.successfully"),
    TREE_UPDATED_SUCCESSFULLY("tree.updated.successfully"),
    TREE_DELETED_SUCCESSFULLY("tree.deleted.successfully"),
    TREE_STATISTICS_RETRIEVED_SUCCESSFULLY("tree.statistics.retrieved.successfully"),
    TREES_NEARBY_RETRIEVED_SUCCESSFULLY("trees.nearby.retrieved.successfully"),
    TREES_NEEDING_WATER_RETRIEVED_SUCCESSFULLY("trees.needing.water.retrieved.successfully"),
    TREES_SEARCHED_SUCCESSFULLY("trees.searched.successfully");

    private final String value;
}
