package com.folia.server.tree;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.Map;
import java.util.Optional;

public record UpdateTreeRequest(
        @Size(max = 255) String species,
        @Size(max = 255) String commonName,
        SoilMoistureLevel soilMoistureLevel,
        TreeHealthStatus healthStatus,
        Map<String, Object> metadata,
        @Min(-90) @Max(90) Double lat,
        @Min(-180) @Max(180) Double lng
) {
    public Optional<String> optionalSpecies() { return Optional.ofNullable(species); }
    public Optional<String> optionalCommonName() { return Optional.ofNullable(commonName); }
    public Optional<SoilMoistureLevel> optionalSoilMoistureLevel() { return Optional.ofNullable(soilMoistureLevel); }
    public Optional<TreeHealthStatus> optionalHealthStatus() { return Optional.ofNullable(healthStatus); }
    public Optional<Map<String, Object>> optionalMetadata() { return Optional.ofNullable(metadata); }
    public Optional<Double> optionalLat() { return Optional.ofNullable(lat); }
    public Optional<Double> optionalLng() { return Optional.ofNullable(lng); }
}
