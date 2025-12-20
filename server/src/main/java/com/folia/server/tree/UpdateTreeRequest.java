package com.folia.server.tree;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record UpdateTreeRequest(
        @Size(max = 255) String species,
        @Size(max = 255) String commonName,
        SoilMoistureLevel soilMoistureLevel,
        TreeHealthStatus healthStatus,
        Map<String, Object> metadata,
        @Min(-90) @Max(90) Double lat,
        @Min(-180) @Max(180) Double lng
) {
    public java.util.Optional<String> optionalSpecies() { return java.util.Optional.ofNullable(species); }
    public java.util.Optional<String> optionalCommonName() { return java.util.Optional.ofNullable(commonName); }
    public java.util.Optional<SoilMoistureLevel> optionalSoilMoistureLevel() { return java.util.Optional.ofNullable(soilMoistureLevel); }
    public java.util.Optional<TreeHealthStatus> optionalHealthStatus() { return java.util.Optional.ofNullable(healthStatus); }
    public java.util.Optional<Map<String, Object>> optionalMetadata() { return java.util.Optional.ofNullable(metadata); }
    public java.util.Optional<Double> optionalLat() { return java.util.Optional.ofNullable(lat); }
    public java.util.Optional<Double> optionalLng() { return java.util.Optional.ofNullable(lng); }
}
