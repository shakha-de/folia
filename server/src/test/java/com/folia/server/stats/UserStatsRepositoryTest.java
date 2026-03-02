package com.folia.server.stats;

import com.folia.server.AbstractIntegrationTest;
import com.folia.server.ServerApplication;
import com.folia.server.activity.TreeActivityRepository;
import com.folia.server.user.User;
import com.folia.server.user.UserRepository;
import com.folia.server.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = ServerApplication.class, webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Transactional
class UserStatsRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    private UserStatsRepository userStatsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TreeActivityRepository treeActivityRepository;

    @BeforeEach
    void setUp() {
        treeActivityRepository.deleteAll();
        userStatsRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void findByUser_ReturnsCorrectStats() {
        User user = createAndSaveUser("testuser", "test@example.com");
        UserStats stats = UserStats.builder()
                .user(user)
                .xp(100)
                .build();
        userStatsRepository.save(stats);

        Optional<UserStats> found = userStatsRepository.findByUser(user);

        assertThat(found).isPresent();
        assertThat(found.get().getXp()).isEqualTo(100);
        assertThat(found.get().getUser().getId()).isEqualTo(user.getId());
    }

    @Test
    void findByUserId_ReturnsCorrectStats() {
        User user = createAndSaveUser("useridtest", "userid@example.com");
        UserStats stats = UserStats.builder()
                .user(user)
                .xp(200)
                .build();
        userStatsRepository.save(stats);

        Optional<UserStats> found = userStatsRepository.findByUserId(user.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getXp()).isEqualTo(200);
    }

    @Test
    void findAllByOrderByXpDesc_ReturnsPagedStatsInOrder() {
        User user1 = createAndSaveUser("user1", "u1@e.com");
        User user2 = createAndSaveUser("user2", "u2@e.com");
        User user3 = createAndSaveUser("user3", "u3@e.com");

        saveStats(user1, 50);
        saveStats(user2, 150);
        saveStats(user3, 100);

        Page<UserStats> page = userStatsRepository.findAllByOrderByXpDesc(PageRequest.of(0, 10));

        assertThat(page.getContent()).hasSize(3);
        assertThat(page.getContent().get(0).getXp()).isEqualTo(150);
        assertThat(page.getContent().get(1).getXp()).isEqualTo(100);
        assertThat(page.getContent().get(2).getXp()).isEqualTo(50);
    }

    @Test
    void getUsersWithHigherXp_ReturnsCorrectList() {
        User targetUser = createAndSaveUser("target", "t@e.com");
        User higherUser = createAndSaveUser("higher", "h@e.com");
        User lowerUser = createAndSaveUser("lower", "l@e.com");

        saveStats(targetUser, 100);
        saveStats(higherUser, 200);
        saveStats(lowerUser, 50);

        List<UserStats> higherXpList = userStatsRepository.getUsersWithHigherXp(targetUser);

        assertThat(higherXpList).hasSize(1);
        assertThat(higherXpList.getFirst().getUser().getUsername()).isEqualTo("higher");
    }

    private User createAndSaveUser(String username, String email) {
        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash("hash")
                .role(UserRole.CITIZEN)
                .uuid(UUID.randomUUID())
                .isEnabled(true)
                .build();
        return userRepository.save(user);
    }

    private void saveStats(User user, int xp) {
        userStatsRepository.save(UserStats.builder()
                .user(user)
                .xp(xp)
                .build());
    }
}
