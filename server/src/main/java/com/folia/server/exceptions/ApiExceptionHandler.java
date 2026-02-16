package com.folia.server.exceptions;

import com.folia.server.common.ApiResponse;
import com.folia.server.common.messages.MessageKey;
import com.folia.server.common.messages.MessageService;
import com.folia.server.common.util.ResponseUtils;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class ApiExceptionHandler {

    private final MessageService messageService;

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String causeMessage = ex.getMostSpecificCause().getMessage();
        String message;

        if (causeMessage != null && causeMessage.contains("users_email_key")) {
            message = "An account with this email address already exists";
        } else if (causeMessage != null && causeMessage.contains("users_username_key")) {
            message = "This username is already taken";
        } else if (causeMessage != null && causeMessage.contains("duplicate key")) {
            message = "This value already exists. Please use a different one";
        } else {
            message = "Data validation failed. Please check your input";
        }

        // Log the actual error for debugging (only visible to developers/ops)
        log.error("Data integrity violation: {}", ex.getMostSpecificCause().getMessage());

        return ResponseUtils.conflict(message);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(
            error -> errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseUtils.badRequest("Validation failed", errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException exception) {
        Map<String, String> errors = new HashMap<>();
        exception.getConstraintViolations().forEach(
            violation -> {
                String propertyPath = violation.getPropertyPath().toString();
                String fieldName = propertyPath.contains(".")
                    ? propertyPath.substring(propertyPath.lastIndexOf('.') + 1)
                    : propertyPath;
                errors.put(fieldName, violation.getMessage());
            }
        );
        return ResponseUtils.badRequest("Validation failed", errors);
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
}
