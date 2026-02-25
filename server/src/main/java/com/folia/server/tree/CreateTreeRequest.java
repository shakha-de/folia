package com.folia.server.tree;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record CreateTreeRequest(
        @NotBlank(message = "{validation.tree.species.blank}") @Size(max = 255) String species,
        @Size(max = 255) String commonName,
        @NotNull(message = "{validation.tree.lat.null}") @Min(value = -90, message = "{validation.tree.lat.invalid}") @Max(value = 90, message = "{validation.tree.lat.invalid}") Double lat,
        @NotNull(message = "{validation.tree.lng.null}") @Min(value = -180, message = "{validation.tree.lng.invalid}") @Max(value = 180, message = "{validation.tree.lng.invalid}") Double lng,
        @NotNull(message = "{validation.tree.soilMoisture.null}") SoilMoistureLevel soilMoistureLevel,
        @NotNull(message = "{validation.tree.healthStatus.null}") TreeHealthStatus healthStatus,
        Map<String, Object> metadata
) {
}
