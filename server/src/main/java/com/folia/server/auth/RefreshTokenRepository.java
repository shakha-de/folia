package com.folia.server.auth;

import com.folia.server.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(User user);

    int deleteByRevoked(boolean revoked);

    void deleteByExpiryDateBefore(LocalDateTime expiryDate);
}
