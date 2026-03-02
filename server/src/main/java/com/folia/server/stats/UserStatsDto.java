package com.folia.server.stats;

import java.util.HashMap;
import java.util.Map;

public record UserStatsDto(
    int xp,
    String rank,
    String nextRank,
    int xpToNextRank,
    int progressPercent,
    int treesRegistered,
    int wateringsLogged,
    int currentWateringsStreak,
    int co2OffsetKg,
    Map<String, Object> unlockedBadges
) {
    private static final int[] RANK_THRESHOLDS = { 0, 200, 500, 1000, 2500, 5000, 10000 };
    private static final String[] RANK_NAMES = {
        "Seed Keeper",
        "Seedling Saver",
        "Sapling Steward",
        "Branch Guardian",
        "Canopy Keeper",
        "Forest Warden",
        "Ancient Grove Master"
    };

    private static final Map<String, Object> BADGE_INFO = Map.ofEntries(
        Map.entry("first_drop", Map.of("name", "First Drop", "icon", "water_drop")),
        Map.entry("planter", Map.of("name", "Planter", "icon", "forest")),
        Map.entry("dedicated_guardian", Map.of("name", "Dedicated Guardian", "icon", "wb_sunny")),
        Map.entry("community_pillar", Map.of("name", "Community Pillar", "icon", "group")),
        Map.entry("forester", Map.of("name", "Forester", "icon", "park")),
        Map.entry("drought_buster", Map.of("name", "Drought Buster", "icon", "thunderstorm")),
        Map.entry("centurion", Map.of("name", "Centurion", "icon", "military_tech"))
    );

    public static UserStatsDto from(UserStats stats) {
        int currentXp = stats.getXp();
        
        // Determine current rank tier (0-6)
        int rankTier = 0;
        for (int i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
            if (currentXp >= RANK_THRESHOLDS[i]) {
                rankTier = i;
                break;
            }
        }

        // Determine next rank tier
        int nextRankTier = Math.min(rankTier + 1, RANK_THRESHOLDS.length - 1);
        String currentRank = RANK_NAMES[rankTier];
        String nextRank = RANK_NAMES[nextRankTier];
        
        int currentThreshold = RANK_THRESHOLDS[rankTier];
        int nextThreshold = RANK_THRESHOLDS[nextRankTier];
        int xpToNextRank = Math.max(0, nextThreshold - currentXp);
        int progressPercent = rankTier == nextRankTier ? 100 : 
            Math.round(100f * (currentXp - currentThreshold) / (nextThreshold - currentThreshold));

        // Calculate CO2 offset (3.1 kg per tree per year average)
        int co2OffsetKg = (int) (stats.getTreesRegistered() * 3.1);

        // Build unlocked badges map
        Map<String, Object> unlockedBadges = new HashMap<>();
        for (String badgeId : stats.getUnlockedBadgeIds()) {
            Map<String, Object> badgeDetail = (Map<String, Object>) BADGE_INFO.get(badgeId);
            if (badgeDetail != null) {
                Map<String, Object> badge = new HashMap<>(badgeDetail);
                badge.put("id", badgeId);
                badge.put("unlocked", true);
                unlockedBadges.put(badgeId, badge);
            }
        }

        return new UserStatsDto(
            currentXp,
            currentRank,
            nextRank,
            xpToNextRank,
            progressPercent,
            stats.getTreesRegistered(),
            stats.getWateringsLogged(),
            stats.getCurrentWateringsStreak(),
            co2OffsetKg,
            unlockedBadges
        );
    }
}
