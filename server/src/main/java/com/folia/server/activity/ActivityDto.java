package com.folia.server.activity;

import java.time.LocalDateTime;
import java.util.UUID;

public record ActivityDto(
    UUID id,
    String username,
    String treeSpecies,
    String activityType,
    int xpEarned,
    LocalDateTime performedAt
) {
    public static ActivityDto from(TreeActivity activity) {
        return new ActivityDto(
            activity.getId(),
            activity.getUser() != null ? activity.getUser().getUsername() : null,
            activity.getTree() != null ? activity.getTree().getSpecies() : null,
            activity.getActivityType().name(),
            activity.getXpEarned(),
            activity.getPerformedAt()
        );
    }
}
