package com.folia.server.activity;

import com.folia.server.tree.Tree;
import com.folia.server.user.User;
import com.folia.server.user.UserRole;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ActivityDtoTest {

    @Test
    void from_createsActivityDto() {
        User user = User.builder()
            .uuid(UUID.randomUUID())
            .username("alice")
            .email("alice@example.com")
            .passwordHash("x")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build();

        Tree tree = Tree.builder()
            .species("Acer platanoides")
            .build();

        LocalDateTime now = LocalDateTime.now();
        TreeActivity activity = TreeActivity.builder()
            .id(UUID.randomUUID())
            .user(user)
            .tree(tree)
            .activityType(ActivityType.WATERED)
            .xpEarned(10)
            .performedAt(now)
            .build();

        ActivityDto dto = ActivityDto.from(activity);

        assertThat(dto.id()).isEqualTo(activity.getId());
        assertThat(dto.username()).isEqualTo("alice");
        assertThat(dto.treeSpecies()).isEqualTo("Acer platanoides");
        assertThat(dto.activityType()).isEqualTo("WATERED");
        assertThat(dto.xpEarned()).isEqualTo(10);
        assertThat(dto.performedAt()).isEqualTo(now);
    }

    @Test
    void from_registeredActivity() {
        User user = createUser("bob");
        Tree tree = Tree.builder().species("Quercus robur").build();

        TreeActivity activity = TreeActivity.builder()
            .id(UUID.randomUUID())
            .user(user)
            .tree(tree)
            .activityType(ActivityType.REGISTERED)
            .xpEarned(50)
            .build();

        ActivityDto dto = ActivityDto.from(activity);

        assertThat(dto.activityType()).isEqualTo("REGISTERED");
        assertThat(dto.xpEarned()).isEqualTo(50);
    }

    @Test
    void from_photoUploadedActivity() {
        User user = createUser("charlie");
        Tree tree = Tree.builder().species("Betula").build();

        TreeActivity activity = TreeActivity.builder()
            .id(UUID.randomUUID())
            .user(user)
            .tree(tree)
            .activityType(ActivityType.PHOTO_UPLOADED)
            .xpEarned(15)
            .build();

        ActivityDto dto = ActivityDto.from(activity);

        assertThat(dto.activityType()).isEqualTo("PHOTO_UPLOADED");
        assertThat(dto.xpEarned()).isEqualTo(15);
    }

    @Test
    void from_nullUserHandling() {
        Tree tree = Tree.builder().species("Oak").build();

        TreeActivity activity = TreeActivity.builder()
            .id(UUID.randomUUID())
            .user(null)
            .tree(tree)
            .activityType(ActivityType.WATERED)
            .xpEarned(10)
            .build();

        ActivityDto dto = ActivityDto.from(activity);

        assertThat(dto.username()).isNull();
        assertThat(dto.treeSpecies()).isEqualTo("Oak");
    }

    @Test
    void from_nullTreeHandling() {
        User user = createUser("diana");

        TreeActivity activity = TreeActivity.builder()
            .id(UUID.randomUUID())
            .user(user)
            .tree(null)
            .activityType(ActivityType.WATERED)
            .xpEarned(10)
            .build();

        ActivityDto dto = ActivityDto.from(activity);

        assertThat(dto.username()).isEqualTo("diana");
        assertThat(dto.treeSpecies()).isNull();
    }

    private User createUser(String username) {
        return User.builder()
            .uuid(UUID.randomUUID())
            .username(username)
            .email(username + "@example.com")
            .passwordHash("x")
            .role(UserRole.CITIZEN)
            .isEnabled(true)
            .build();
    }
}
