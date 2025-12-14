package com.folia.server.tree;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SoilMoistureLevel {
    DRY("Dry"),
    MODERATE("Moderate"),
    WET("Wet");

    private final String displayName;
}
