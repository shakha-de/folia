package com.folia.server.stats;

import com.folia.server.activity.ActivityDto;
import com.folia.server.activity.TreeActivityRepository;
import com.folia.server.tree.Tree;
import com.folia.server.tree.TreeHealthStatus;
import com.folia.server.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class UserStatsService {

    private final UserStatsRepository statsRepo;
    private final TreeActivityRepository activityRepo;

    public void onRegistered(User user) {
        UserStats stats = getOrCreate(user);
        stats.setXp(stats.getXp() + 1);
        stats.setTreesRegistered(stats.getTreesRegistered() + 1);
        checkAndAwardBadges(stats);
        statsRepo.save(stats);
    }

    private UserStats getOrCreate(User user) {
        return statsRepo.findByUser(user)
            .orElse(UserStats.builder().user(user).build());
    }

    private void checkAndAwardBadges(UserStats stats) {
        awardIfAbsent(stats, "planter",           stats.getTreesRegistered() >= 1);
        awardIfAbsent(stats, "first_drop",         stats.getWateringsLogged() >= 1);
        awardIfAbsent(stats, "dedicated_guardian", stats.getCurrentWateringsStreak() >= 7);
        awardIfAbsent(stats, "community_pillar",   stats.getTreesRegistered() >= 10);
        awardIfAbsent(stats, "forester",           stats.getTreesRegistered() >= 50);
        awardIfAbsent(stats, "drought_buster",     stats.getDyingTreesWatered() >= 5);
        awardIfAbsent(stats, "centurion",          stats.getXp() >= 1000);
    }

    private void awardIfAbsent(UserStats stats, String badgeId, boolean condition) {
        if (condition && !stats.getUnlockedBadgeIds().contains(badgeId)) {
            stats.getUnlockedBadgeIds().add(badgeId);
        }
    }

    public void onWatered(User user, Tree tree) {
        UserStats stats = getOrCreate(user);
        LocalDate today = LocalDate.now();
        int xpGain = 10;

        // Bonus XP for saving dying trees
        if (tree.getHealthStatus() == TreeHealthStatus.DYING) {
            xpGain += 20;
            stats.setDyingTreesWatered(stats.getDyingTreesWatered() + 1);
        }
        // Streak logic
        if (today.minusDays(1).equals(stats.getLastWateredDate())) {
            stats.setCurrentWateringsStreak(stats.getCurrentWateringsStreak() + 1);
        } else if (!today.equals(stats.getLastWateredDate())) {
            stats.setCurrentWateringsStreak(1);
        }

        stats.setLastWateredDate(today);

        // Weekly streak bonus
        if (stats.getCurrentWateringsStreak() % 7 == 0) xpGain += 75;

        stats.setXp(stats.getXp() + xpGain);
        stats.setWateringsLogged(stats.getWateringsLogged() + 1);
        checkAndAwardBadges(stats);
        statsRepo.save(stats);
    }


    public UserStats getMyStats(User user) {
        return statsRepo.findByUser(user)
            .orElse(UserStats.builder().build());
    }

    public Page<ActivityDto> getMyActivities(User user, int page, int size) {
        return activityRepo.findByUser(user, PageRequest.of(page, size))
            .map(ActivityDto::from);
    }

    public Page<LeaderboardEntryDto> getLeaderboard(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserStats> stats = statsRepo.findAllByOrderByXpDesc(pageable);
        
        long startPosition = (long) page * size + 1;
        var index = new java.util.concurrent.atomic.AtomicLong(0);
        return stats.map(userStats -> {
            long position = startPosition + index.getAndIncrement();
            return LeaderboardEntryDto.from(userStats, position);
        });
    }

    public long getUserPositionInLeaderboard(User user) {
        // Get count of users with higher XP
        long usersWithHigherXp = statsRepo.getUsersWithHigherXp(user).size();
        return usersWithHigherXp + 1; // Position is 1-indexed
    }
}
