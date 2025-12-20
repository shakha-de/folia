package com.folia.server.tree;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record CreateTreeRequest(
        @NotBlank @Size(max = 255) String species,
        @Size(max = 255) String commonName,
        @NotNull @Min(-90) @Max(90) Double lat,
        @NotNull @Min(-180) @Max(180) Double lng,
        @NotNull SoilMoistureLevel soilMoistureLevel,
        @NotNull TreeHealthStatus healthStatus,
        Map<String, Object> metadata
) {
}
