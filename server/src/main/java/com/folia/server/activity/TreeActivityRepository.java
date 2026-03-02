package com.folia.server.activity;

import com.folia.server.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TreeActivityRepository extends JpaRepository<TreeActivity, UUID> {
    Page<TreeActivity> findByUser(User user, Pageable pageable);
}
