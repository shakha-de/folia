package com.folia.server.tree;

import java.time.LocalDateTime;
import java.util.Map;

public record TreeStats(
        long totalTrees,
        Map<String, Long> treesBySpecies,
        Map<TreeHealthStatus, Long> treesByHealth,
        Map<SoilMoistureLevel, Long> treesBySoilMoisture,
        long treesNeedingWater,
        LocalDateTime generatedAt
) {
}
