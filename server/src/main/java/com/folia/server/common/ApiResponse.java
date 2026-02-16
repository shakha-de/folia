package com.folia.server.common;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.Map;

@Builder
public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    Map<String, String> errors,
    LocalDateTime timestamp
) {}
