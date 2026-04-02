package com.project.pjt_01.repository;

import com.project.pjt_01.domain.ButtonType;
import com.project.pjt_01.domain.Post;
import com.project.pjt_01.domain.PostButtonStat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostButtonStatRepository extends JpaRepository<PostButtonStat, Long> {
    Optional<PostButtonStat> findByPostAndButtonType(Post post, ButtonType type);
    List<PostButtonStat> findByPost(Post post);
}
