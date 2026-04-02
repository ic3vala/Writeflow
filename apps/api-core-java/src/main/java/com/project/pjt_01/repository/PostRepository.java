package com.project.pjt_01.repository;

import com.project.pjt_01.domain.Emotion;
import com.project.pjt_01.domain.Post;
import com.project.pjt_01.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByHiddenFalseOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findByHiddenFalseAndEmotionOrderByCreatedAtDesc(Emotion emotion, Pageable pageable);

    Page<Post> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);

    Page<Post> findByAuthorAndEmotionOrderByCreatedAtDesc(User author, Emotion emotion, Pageable pageable);
}
