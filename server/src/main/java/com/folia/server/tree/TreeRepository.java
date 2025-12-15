package com.folia.server.tree;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TreeRepository extends JpaRepository<Tree, Long> {
    Optional<Tree> findByPublicId(UUID publicId);

    @Query(
            value = """
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
                    """,
            nativeQuery = true
    )
    List<Tree> findNearby(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMeters") int radiusMeters
    );
}
