package com.folia.server.user;

import com.folia.server.ServerApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = ServerApplication.class, webEnvironment = SpringBootTest.WebEnvironment.NONE)
class UserRepositoryTest extends com.folia.server.AbstractIntegrationTest {

    @Autowired
    UserRepository userRepository;

    @Test
    void findByUuid_returnsEntity() {
        UUID uuid = UUID.randomUUID();

        User saved = userRepository.save(User.builder()
            .uuid(uuid)
            .username("alice")
            .email("alice@example.com")
            .passwordHash("x")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build());

        User loaded = userRepository.findByUuid(uuid).orElseThrow();

        assertThat(loaded.getId()).isEqualTo(saved.getId());
        assertThat(loaded.getUuid()).isEqualTo(uuid);
        assertThat(loaded.getUsername()).isEqualTo("alice");
    }
}
