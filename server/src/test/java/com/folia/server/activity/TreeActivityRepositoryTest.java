package com.folia.server.activity;

import com.folia.server.AbstractIntegrationTest;
import com.folia.server.ServerApplication;
import com.folia.server.tree.Tree;
import com.folia.server.tree.TreeRepository;
import com.folia.server.user.User;
import com.folia.server.user.UserRepository;
import com.folia.server.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = ServerApplication.class, webEnvironment = SpringBootTest.WebEnvironment.NONE)
class TreeActivityRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    private TreeActivityRepository treeActivityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TreeRepository treeRepository;

    private User testUser;
    private Tree testTree;

    @BeforeEach
    void setUp() {
        treeActivityRepository.deleteAll();
        treeRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(User.builder()
                .username("activityuser")
                .email("activity@example.com")
                .passwordHash("hash")
                .role(UserRole.CITIZEN)
                .uuid(UUID.randomUUID())
                .isEnabled(true)
                .build());

        testTree = treeRepository.save(Tree.builder()
                .species("Quercus robur")
                .publicId(UUID.randomUUID())
                .build());
    }

    @Test
    void findByUser_ReturnsPagedActivities() {
        // Save some activities
        for (int i = 0; i < 5; i++) {
            treeActivityRepository.save(TreeActivity.builder()
                    .user(testUser)
                    .tree(testTree)
                    .activityType(ActivityType.WATERED)
                    .xpEarned(10)
                    .performedAt(LocalDateTime.now().minusDays(i))
                    .build());
        }

        // Save an activity for another user
        User anotherUser = userRepository.save(User.builder()
                .username("otheruser")
                .email("other@example.com")
                .passwordHash("hash")
                .isEnabled(true)
                .uuid(UUID.randomUUID())
                .build());
        
        treeActivityRepository.save(TreeActivity.builder()
                .user(anotherUser)
                .tree(testTree)
                .activityType(ActivityType.REGISTERED)
                .xpEarned(50)
                .build());

        Page<TreeActivity> result = treeActivityRepository.findByUser(testUser, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(5);
        assertThat(result.getTotalElements()).isEqualTo(5);
        assertThat(result.getContent()).allMatch(a -> a.getUser().getId().equals(testUser.getId()));
    }
}
