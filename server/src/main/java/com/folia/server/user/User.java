package com.folia.server.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private UUID uuid = UUID.randomUUID();

    @Column(nullable = false, unique = true)
    @Size(min = 3, max = 50, message = "Username should be 3-50 symbols long")
    private String username;

    @Email(message = "Invalid email")
    @Column(unique = true)
    private String email;

    @Column
    @Size(max = 20, message = "Telephone number is too long")
    private String phone;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private boolean isEnabled = true;

    @Column(nullable = false)
    private boolean isEmailVerified = false;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role = UserRole.CITIZEN;

    @Column(name = "reputation_score", nullable = false)
    private Integer reputationScore = 0;


    @Column(name = "home_location_lat")
    private Double homeLocationLat;

    @Column(name = "home_location_lng")
    private Double homeLocationLng;

    @Column(name = "notification_radius_km")
    private Integer notificationRadiusKm = 1;

    // ⏱️ ZEITSTEMPEL
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // 🔗 OPTIONALE COMMUNITY-METADATEN
    @Column(name = "display_name")
    private String displayName;

    @Column(name = "bio", length = 500)
    private String bio;

    @Column(name = "profile_image_url")
    private String profileImageUrl;


}
