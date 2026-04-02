package com.project.pjt_01.repository;

import com.project.pjt_01.domain.ButtonClick;
import com.project.pjt_01.domain.Post;
import com.project.pjt_01.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ButtonClickRepository extends JpaRepository<ButtonClick, Long> {
    boolean existsByPostAndUser(Post post, User user);
    Optional<ButtonClick> findByPostAndUser(Post post, User user);
}
