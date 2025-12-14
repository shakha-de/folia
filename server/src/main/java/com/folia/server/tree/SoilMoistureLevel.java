package com.folia.server.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SoilMoistureLevel {
    DRY("Dry"),
    MODERATE("Moderate"),
    WET("Wet");

    private final String displayText;
}
