package com.folia.server.stats;

import com.folia.server.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Builder
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "user_stats")
public class UserStats {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Builder.Default
    private int xp = 0;

    @Builder.Default
    private int treesRegistered = 0;

    @Builder.Default
    private int wateringsLogged = 0;

    @Builder.Default
    private int currentWateringsStreak = 0;

    @Builder.Default
    private int dyingTreesWatered = 0;

    private LocalDate lastWateredDate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private List<String> unlockedBadgeIds = new ArrayList<>();


    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();


}
