package com.folia.server.tree;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.awt.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Tree {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    @Column(nullable = false)
    private String species;

    @Column(name = "common_name")
    private String commonName;

    // Geodata with hibernate spatial
    @Column(name = "location", columnDefinition = "geometry(Point,4326)")
    private Point location; // latitude/longitude as a Point

    @Column(name = "soil_moisture_level", nullable = false)
    @Enumerated(EnumType.STRING)
    private SoilMoistureLevel soilMoistureLevel = SoilMoistureLevel.DRY;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TreeHealthStatus healthStatus = TreeHealthStatus.HEALTHY;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "last_watered_at")
    private LocalDateTime lastWateredAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "next_watering_due")
    private LocalDateTime nextWateringDue;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata = new HashMap<>();

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
