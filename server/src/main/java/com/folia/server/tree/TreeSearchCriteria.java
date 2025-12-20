package com.folia.server.tree;

public record TreeSearchCriteria(
        String species,
        TreeHealthStatus healthStatus,
        SoilMoistureLevel soilMoistureLevel
) {}
