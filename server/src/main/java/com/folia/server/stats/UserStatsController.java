package com.folia.server.stats;

import com.folia.server.activity.ActivityDto;
import com.folia.server.common.ApiResponse;
import com.folia.server.common.messages.MessageKey;
import com.folia.server.common.messages.MessageService;
import com.folia.server.common.util.ResponseUtils;
import com.folia.server.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Locale;

@RestController
@RequestMapping("api/users")
@RequiredArgsConstructor
public class UserStatsController {
    private final UserStatsService statsService;
    private final MessageService messageService;

    @GetMapping("/me/stats")
    public ResponseEntity<ApiResponse<UserStatsDto>> getMyStats(
        @AuthenticationPrincipal User user,
        Locale locale
    ) {
        UserStats stats = statsService.getMyStats(user);
        UserStatsDto dto = UserStatsDto.from(stats);
        return ResponseUtils.ok(dto, messageService.get(MessageKey.USER_STATS_RETRIEVED_SUCCESSFULLY, locale));
    }

    @GetMapping("/me/activities")
    public ResponseEntity<ApiResponse<Page<ActivityDto>>> getMyActivities(
        @AuthenticationPrincipal User user,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        Locale locale
    ) {
        Page<ActivityDto> activities = statsService.getMyActivities(user, page, size);
        return ResponseUtils.ok(activities, messageService.get(MessageKey.USER_ACTIVITIES_RETRIEVED_SUCCESSFULLY, locale));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<Page<LeaderboardEntryDto>>> getLeaderboard(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size,
        Locale locale
    ) {
        Page<LeaderboardEntryDto> leaderboard = statsService.getLeaderboard(page, size);
        return ResponseUtils.ok(leaderboard, messageService.get(MessageKey.LEADERBOARD_RETRIEVED_SUCCESSFULLY, locale));
    }

    @GetMapping("/leaderboard/me")
    public ResponseEntity<ApiResponse<Long>> getPositionInLeaderboard(
        @AuthenticationPrincipal User user,
        Locale locale
    ) {
        long position = statsService.getUserPositionInLeaderboard(user);
        return ResponseUtils.ok(position, messageService.get(MessageKey.USER_POSITION_RETRIEVED_SUCCESSFULLY, locale));
    }
}
