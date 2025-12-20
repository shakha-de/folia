package com.folia.server.user;

import com.folia.server.common.messages.MessageKey;
import com.folia.server.exceptions.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(CreateUserRequest request) {
        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(UserRole.CITIZEN)
                .isEnabled(true)
                .build();

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserByUuid(UUID uuid) {
        return userRepository.findByUuid(uuid)
            .orElseThrow(() -> new UserNotFoundException(
                    MessageKey.USER_NOT_FOUND,
                    uuid
                )
            );
    }

    public void deleteUserByUuid(UUID uuid) {
        User user = userRepository.findByUuid(uuid)
            .orElseThrow(() -> new UserNotFoundException(
                    MessageKey.USER_NOT_FOUND,
                    uuid
                )
            );
        userRepository.delete(user);
    }

}
