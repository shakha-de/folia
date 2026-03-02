package com.folia.server.stats;

public record LeaderboardEntryDto(
    long position,
    String username,
    int xp,
    String rank
) {
    public static LeaderboardEntryDto from(UserStats stats, long position) {
        String rank = determineRank(stats.getXp());
        return new LeaderboardEntryDto(position, stats.getUser().getUsername(), stats.getXp(), rank);
    }

    private static String determineRank(int xp) {
        if (xp >= 10000) return "Ancient Grove Master";
        if (xp >= 5000) return "Forest Warden";
        if (xp >= 2500) return "Canopy Keeper";
        if (xp >= 1000) return "Branch Guardian";
        if (xp >= 500) return "Sapling Steward";
        if (xp >= 200) return "Seedling Saver";
        return "Seed Keeper";
    }
}
