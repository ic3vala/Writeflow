package com.project.pjt_01.repository;

import com.project.pjt_01.domain.Post;
import com.project.pjt_01.domain.PostReport;
import com.project.pjt_01.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostReportRepository extends JpaRepository<PostReport, Long> {
    Optional<PostReport> findByPostAndUser(Post post, User user);
    long countByPost(Post post);
}
