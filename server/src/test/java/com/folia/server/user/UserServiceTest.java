package com.folia.server.user;

import com.folia.server.common.messages.MessageKey;
import com.folia.server.exceptions.UserNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    UserRepository userRepository;

    @InjectMocks
    UserService userService;

    @Test
    void getAllUsers_delegatesToRepository() {
        List<User> expected = List.of(User.builder().username("a").passwordHash("x").build());
        when(userRepository.findAll()).thenReturn(expected);

        List<User> actual = userService.getAllUsers();

        assertThat(actual).isSameAs(expected);
        verify(userRepository).findAll();
    }

    @Test
    void getUserByUuid_whenMissing_throwsUserNotFoundException() {
        UUID uuid = UUID.randomUUID();
        when(userRepository.findByUuid(uuid)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserByUuid(uuid))
            .isInstanceOf(UserNotFoundException.class)
            .satisfies(ex -> {
                UserNotFoundException unfe = (UserNotFoundException) ex;
                assertThat(unfe.getMessageKey()).isEqualTo(MessageKey.USER_NOT_FOUND);
                assertThat(unfe.getArgs()).containsExactly(uuid);
            });

        verify(userRepository).findByUuid(uuid);
    }

    @Test
    void deleteUserByUuid_whenMissing_throwsAndDoesNotDelete() {
        UUID uuid = UUID.randomUUID();
        when(userRepository.findByUuid(uuid)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.deleteUserByUuid(uuid))
            .isInstanceOf(UserNotFoundException.class);

        verify(userRepository).findByUuid(uuid);
        verify(userRepository, never()).delete(any());
    }

    @Test
    void deleteUserByUuid_whenExists_deletesEntity() {
        UUID uuid = UUID.randomUUID();
        User user = User.builder().uuid(uuid).username("alice").passwordHash("x").build();
        when(userRepository.findByUuid(uuid)).thenReturn(Optional.of(user));

        userService.deleteUserByUuid(uuid);

        verify(userRepository).delete(user);
    }
}
