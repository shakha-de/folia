package com.folia.server.tree;

import com.folia.server.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TreeRepository extends JpaRepository<Tree, Long> {
    Optional<Tree> findByPublicId(UUID publicId);

    @Query(value = """
            select *
            from trees t
            where ST_DWithin(
                t.location::geography,
                ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                :radiusMeters
            )
            order by ST_Distance(
                t.location::geography,
                ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
            )
            """, nativeQuery = true)
    List<Tree> findNearby(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMeters") int radiusMeters);

    @Query(value = """
            select *
            from trees t
            where ST_DWithin(
                t.location::geography,
                ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                :radiusMeters
            )
            and (t.next_watering_due is null or t.next_watering_due <= :now)
            order by t.next_watering_due asc nulls first
            """, nativeQuery = true)
    List<Tree> findTreesNeedingWater(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMeters") int radiusMeters,
            @Param("now") LocalDateTime now);

    @Query(value = """
            select *
            from trees t
            where (:species is null or lower(t.species) = lower(:species))
            and (:healthStatus is null or t.health_status = :healthStatus)
            and (:soilMoistureLevel is null or t.soil_moisture_level = :soilMoistureLevel)
            """, nativeQuery = true)
    List<Tree> searchTrees(
            @Param("species") String species,
            @Param("healthStatus") String healthStatus,
            @Param("soilMoistureLevel") String soilMoistureLevel);

    List<Tree> findByRegisteredBy(User registeredBy);
}
