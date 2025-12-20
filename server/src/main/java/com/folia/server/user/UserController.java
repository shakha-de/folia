package com.folia.server.user;

import com.folia.server.common.ApiResponse;
import com.folia.server.common.messages.MessageKey;
import com.folia.server.common.messages.MessageService;
import com.folia.server.common.util.ResponseUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    private final MessageService messageService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ApiResponse<UserDto>> create(
        @RequestBody @Valid CreateUserRequest request,
        Locale locale
    ) {
        User createdUser = userService.createUser(request);

        return ResponseUtils.created(
            UserDto.from(createdUser),
            messageService.get(MessageKey.USER_CREATED, locale)
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> all(
        Locale locale
    ) {
        List<User> users = userService.getAllUsers();
        List<UserDto> userDtos = users.stream()
            .map(UserDto::from)
            .toList();

        return ResponseUtils.ok(
            userDtos,
            messageService.get(MessageKey.USERS_RETRIEVED, locale)
        );
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<UserDto>> byUuid(
        @PathVariable UUID uuid,
        Locale locale
    ) {
        User user = userService.getUserByUuid(uuid);
        return ResponseUtils.ok(
            UserDto.from(user),
            messageService.get(MessageKey.USER_RETRIEVED, locale));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> delete(
        @PathVariable UUID uuid,
        Locale locale
    ) {
        userService.deleteUserByUuid(uuid);
        return ResponseUtils.ok(
            null,
            messageService.get(MessageKey.USER_DELETED, locale)
        );
    }
}
