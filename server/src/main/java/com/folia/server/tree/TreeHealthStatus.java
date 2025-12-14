package com.folia.server.tree;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum TreeHealthStatus {
    HEALTHY("Healthy"),
    STRESSED("Stressed"),
    DYING("Dying"),
    DEAD("Dead"),
    REMOVED("Removed");

    private final String displayName;
}
