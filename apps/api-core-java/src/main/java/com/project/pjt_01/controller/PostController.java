package com.project.pjt_01.controller;

import com.project.pjt_01.dto.post.PostDtos.*;
import com.project.pjt_01.security.UserPrincipal;
import com.project.pjt_01.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    // 글 작성
    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestBody PostCreateRequest req
    ) {
        PostResponse resp = postService.createPost(me.getId(), req);
        return ResponseEntity.ok(resp);
    }

    // 글 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPost(id));
    }

    // 감정별 글 목록 조회 (숨김 제외, 최신순)
    @GetMapping
    public ResponseEntity<PostListResponse> getPosts(
            @RequestParam(required = false) String emotion,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.DESC, "createdAt");
        return ResponseEntity.ok(postService.getPosts(emotion, pageable));
    }

    // 내 글 목록
    @GetMapping("/me")
    public ResponseEntity<PostListResponse> getMyPosts(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam(required = false) String emotion,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.DESC, "createdAt");
        return ResponseEntity.ok(postService.getMyPosts(me.getId(), emotion, pageable));
    }

    // 글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @AuthenticationPrincipal UserPrincipal me,
            @PathVariable Long id
    ) {
        postService.deletePost(me.getId(), id);
        return ResponseEntity.noContent().build();
    }

    // 버튼 클릭
    @PostMapping("/{postId}/buttons/{buttonType}")
    public ResponseEntity<ButtonClickResponse> clickButton(
            @AuthenticationPrincipal UserPrincipal me,
            @PathVariable Long postId,
            @PathVariable String buttonType
    ) {
        ButtonClickResponse resp = postService.clickButton(me.getId(), postId, buttonType);
        return ResponseEntity.ok(resp);
    }

    // 신고
    @PostMapping("/{postId}/report")
    public ResponseEntity<Void> reportPost(
            @AuthenticationPrincipal UserPrincipal me,
            @PathVariable Long postId
    ) {
        postService.reportPost(me.getId(), postId);
        return ResponseEntity.ok().build();
    }

    // 지원하는 감정 / 버튼 코드 목록
    @GetMapping("/meta/emotions")
    public ResponseEntity<?> getEmotionCodes() {
        return ResponseEntity.ok(postService.getEmotionCodes());
    }

    @GetMapping("/meta/buttons")
    public ResponseEntity<?> getButtonCodes() {
        return ResponseEntity.ok(postService.getButtonCodes());
    }

    // 홈 화면용 감정 비율 통계
    @GetMapping("/stats/emotions")
    public ResponseEntity<List<EmotionStatResponse>> getEmotionStats() {
        return ResponseEntity.ok(postService.getEmotionStats());
    }
}
