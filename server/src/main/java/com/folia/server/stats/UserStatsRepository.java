package com.folia.server.stats;

import com.folia.server.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserStatsRepository extends JpaRepository<UserStats, Long> {

    Optional<UserStats> findByUser(User user);

    Optional<UserStats> findByUserId(Long userId);

    Page<UserStats> findAllByOrderByXpDesc(Pageable pageable);

    @Query("SELECT s FROM UserStats s WHERE s.xp > (SELECT u.xp FROM UserStats u WHERE u.user = ?1) ORDER BY s.xp DESC")
    List<UserStats> getUsersWithHigherXp(User user);
}
