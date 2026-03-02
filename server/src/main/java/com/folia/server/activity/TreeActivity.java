package com.folia.server.activity;

import com.folia.server.tree.Tree;
import com.folia.server.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tree_activity")
public class TreeActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    private Tree tree;

    @Enumerated(EnumType.STRING)
    private ActivityType activityType;

    private int xpEarned;

    @Builder.Default
    private LocalDateTime performedAt = LocalDateTime.now();
}
