package com.folia.server.tree;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record TreeDto(
        UUID publicId,
        String species,
        String commonName,
        double lat,
        double lng,
        SoilMoistureLevel soilMoistureLevel,
        TreeHealthStatus healthStatus,
        LocalDateTime lastWateredAt,
        LocalDateTime nextWateringDue,
        LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Map<String, Object> metadata
) {
    public static TreeDto from(Tree tree) {
        double lat = tree.getLocation() == null ? 0.0 : tree.getLocation().getY();
        double lng = tree.getLocation() == null ? 0.0 : tree.getLocation().getX();
        return new TreeDto(
                tree.getPublicId(),
                tree.getSpecies(),
                tree.getCommonName(),
                lat,
                lng,
                tree.getSoilMoistureLevel(),
                tree.getHealthStatus(),
                tree.getLastWateredAt(),
                tree.getNextWateringDue(),
                tree.getCreatedAt(),
                tree.getUpdatedAt(),
                tree.getMetadata()
        );
    }
}
