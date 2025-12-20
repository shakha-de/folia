package com.folia.server.common.util;

import com.folia.server.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;

public class ResponseUtils {

    private ResponseUtils() {
        throw new  IllegalStateException("Utility class");
    }

    public static <T> ResponseEntity<ApiResponse<T>> build(
        boolean success,
        String message,
        T data,
        HttpStatus status
    ) {
        return ResponseEntity
            .status(status)
            .body(ApiResponse.<T>builder()
                .success(success)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build()
            );
    }

    public static <T> ResponseEntity<ApiResponse<T>> ok(T data, String message) {
        return build(true, message, data, HttpStatus.OK);
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(T data, String message) {
        return build(true, message, data, HttpStatus.CREATED);
    }

    public static <T> ResponseEntity<ApiResponse<T>> notFound(String message) {
        return build(false, message, null, HttpStatus.NOT_FOUND);
    }

    public static <T> ResponseEntity<ApiResponse<T>> conflict(String message) {
        return build(false, message, null, HttpStatus.CONFLICT);
    }

    public static <T> ResponseEntity<ApiResponse<T>> unauthorized(String message) {
        return build(false, message, null, HttpStatus.UNAUTHORIZED);
    }

    public static <T> ResponseEntity<ApiResponse<T>> noContent(String message) {
        return build(false, message, null, HttpStatus.NO_CONTENT);
    }

    public static <T> ResponseEntity<ApiResponse<T>> badRequest(String message) {
        return build(false, message, null, HttpStatus.BAD_REQUEST);
    }

    public static <T> ResponseEntity<ApiResponse<T>> internalServerError(String message) {
        return build(false, message, null, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public static <T> ResponseEntity<ApiResponse<T>> forbidden(String message) {
        return build(false, message, null, HttpStatus.FORBIDDEN);
    }
}
