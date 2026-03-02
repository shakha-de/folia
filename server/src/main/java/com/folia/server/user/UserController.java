package com.folia.server.user;

import com.folia.server.common.ApiResponse;
import com.folia.server.common.messages.MessageKey;
import com.folia.server.common.messages.MessageService;
import com.folia.server.common.util.ResponseUtils;
import com.folia.server.stats.UserStatsDto;
import com.folia.server.stats.UserStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;
    private final UserStatsService userStatsService;
    private final MessageService ms;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> all(
        Locale locale
    ) {
        List<User> users = userService.getAllUsers();
        List<UserDto> userDtos = users.stream()
            .map(UserDto::from)
            .toList();

        return ResponseUtils.ok(
            userDtos,
            ms.get(MessageKey.USERS_RETRIEVED, locale)
        );
    }

    @GetMapping("/{uuid}")
    @PreAuthorize("hasRole('ADMIN') or authentication.name == @userService.getUserByUuid(#uuid).username")
    public ResponseEntity<ApiResponse<UserDto>> byUuid(
        @PathVariable UUID uuid,
        Locale locale
    ) {
        User user = userService.getUserByUuid(uuid);
        return ResponseUtils.ok(
            UserDto.from(user),
            ms.get(MessageKey.USER_RETRIEVED, locale));
    }

    @DeleteMapping("/{uuid}")
    @PreAuthorize("hasRole('ADMIN') or authentication.name == @userService.getUserByUuid(#uuid).username")
    public ResponseEntity<ApiResponse<Void>> delete(
        @PathVariable UUID uuid,
        Locale locale
    ) {
        userService.deleteUserByUuid(uuid);
        return ResponseUtils.ok(
            null,
            ms.get(MessageKey.USER_DELETED, locale)
        );
    }

    @GetMapping("/{username}/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> byUsernameProfile(
        @PathVariable String username,
        Locale locale
    ) {
        User user = userService.getUserByUsername(username);
        UserStatsDto stats = UserStatsDto.from(userStatsService.getMyStats(user));
        long leaderboardPosition = userStatsService.getUserPositionInLeaderboard(user);

        return ResponseUtils.ok(
            UserProfileDto.from(user, stats, leaderboardPosition),
            ms.get(MessageKey.USER_RETRIEVED, locale)
        );
    }
}
