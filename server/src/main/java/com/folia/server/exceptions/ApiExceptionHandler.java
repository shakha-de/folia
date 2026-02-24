package com.folia.server.exceptions;

import com.folia.server.common.ApiResponse;
import com.folia.server.common.messages.MessageKey;
import com.folia.server.common.messages.MessageService;
import com.folia.server.common.util.ResponseUtils;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class ApiExceptionHandler {

    private final MessageService messageService;

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        MessageKey messageKey = getMessageKey(ex);

        // ⚠️ SECURITY: Log detailed error server-side (only visible to developers/ops)
        // Never expose database structure, constraints, or SQL details to clients
        log.error("Data integrity violation: {}", ex.getMostSpecificCause().getMessage());

        // Return generic, user-friendly message using i18n
        String message = messageService.get(messageKey, LocaleContextHolder.getLocale());
        return ResponseUtils.conflict(message);
    }

    private static @NonNull MessageKey getMessageKey(DataIntegrityViolationException ex) {
        String causeMessage = ex.getMostSpecificCause().getMessage();
        MessageKey messageKey;

        // Map database constraints to user-friendly message keys
        if (causeMessage != null && causeMessage.contains("users_email_key")) {
            messageKey = MessageKey.USER_EMAIL_ALREADY_EXISTS;
        } else if (causeMessage != null && causeMessage.contains("users_username_key")) {
            messageKey = MessageKey.USER_USERNAME_ALREADY_EXISTS;
        } else if (causeMessage != null && causeMessage.contains("duplicate key")) {
            messageKey = MessageKey.DATA_DUPLICATE_VALUE;
        } else {
            messageKey = MessageKey.DATA_VALIDATION_FAILED;
        }
        return messageKey;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        Locale locale = LocaleContextHolder.getLocale();
        ex.getBindingResult().getFieldErrors().forEach(
            error -> {
                String fieldName = error.getField();
                String translatedField = messageService.resolve("field." + fieldName, fieldName, locale);
                // Resilience: Use fieldName if translation service returns null (e.g. in tests with missing mocks)
                String key = translatedField != null ? translatedField : fieldName;
                errors.put(key, error.getDefaultMessage());
            }
        );
        String message = messageService.get(MessageKey.VALIDATION_FAILED, locale);
        return ResponseUtils.badRequest(message != null ? message : "Validation failed", errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException exception) {
        Map<String, String> errors = new HashMap<>();
        Locale locale = LocaleContextHolder.getLocale();
        exception.getConstraintViolations().forEach(
            violation -> {
                String propertyPath = violation.getPropertyPath().toString();
                String fieldName = propertyPath.contains(".")
                    ? propertyPath.substring(propertyPath.lastIndexOf('.') + 1)
                    : propertyPath;
                String translatedField = messageService.resolve("field." + fieldName, fieldName, locale);
                // Resilience: Use fieldName if translation service returns null
                String key = translatedField != null ? translatedField : fieldName;
                errors.put(key, violation.getMessage());
            }
        );
        String message = messageService.get(MessageKey.VALIDATION_FAILED, locale);
        return ResponseUtils.badRequest(message != null ? message : "Validation failed", errors);
    }

    @ExceptionHandler(UserNotFoundException.class)
    ResponseEntity<ApiResponse<Void>> handleUserNotFound(UserNotFoundException exception) {
        return notFoundResponse(exception.getMessageKey(), exception.getArgs());
    }

    @ExceptionHandler(TreeNotFoundException.class)
    ResponseEntity<ApiResponse<Void>> handleTreeNotFound(TreeNotFoundException exception) {
        return notFoundResponse(exception.getMessageKey(), exception.getArgs());
    }

    @ExceptionHandler(TokenNotFoundException.class)
    ResponseEntity<ApiResponse<Void>> handleTokenNotFound(TokenNotFoundException exception) {
        return notFoundResponse(exception.getMessageKey(), exception.getArgs());
    }

    @ExceptionHandler(TokenExpiredException.class)
    ResponseEntity<ApiResponse<Void>> handleTokenExpired(TokenExpiredException exception) {
        return unauthorizedResponse(exception.getMessageKey(), exception.getArgs());
    }

    @ExceptionHandler(TokenRevokedException.class)
    ResponseEntity<ApiResponse<Void>> handleTokenRevoked(TokenRevokedException exception) {
        return unauthorizedResponse(exception.getMessageKey(), exception.getArgs());
    }

    private ResponseEntity<ApiResponse<Void>> unauthorizedResponse(MessageKey messageKey, Object[] args) {
        String message = messageService.get(messageKey, LocaleContextHolder.getLocale(), args);
        return ResponseUtils.unauthorized(message);
    }

    private ResponseEntity<ApiResponse<Void>> notFoundResponse(MessageKey messageKey, Object[] args) {
        String message = messageService.get(messageKey, LocaleContextHolder.getLocale(), args);
        return ResponseUtils.notFound(message);
    }

    @ExceptionHandler(BadCredentialsException.class)
    ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(BadCredentialsException exception) {
        Locale locale = LocaleContextHolder.getLocale();
        String message = messageService.get(MessageKey.AUTH_INVALID_CREDENTIALS, locale);
        return ResponseUtils.badRequest(message != null ? message : "Invalid username or password");
    }
}
