package com.project.pjt_01.controller;

import com.project.pjt_01.dto.post.PostDtos.*;
import com.project.pjt_01.security.UserPrincipal;
import com.project.pjt_01.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class LegacyCodeElevenController {

    private final PostService postService;

    // 글 작성  POST /api/post
    @PostMapping("/post")
    public ResponseEntity<PostResponse> createPostLegacy(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestBody PostCreateRequest req
    ) {
        return ResponseEntity.ok(postService.createPost(me.getId(), req));
    }

    // 글 읽기  GET /api/post?emotion=JOY&page=0&size=20
    @GetMapping("/post")
    public ResponseEntity<PostListResponse> getPostsLegacy(
            @RequestParam(required = false) String emotion,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.DESC, "createdAt");
        return ResponseEntity.ok(postService.getPosts(emotion, pageable));
    }

    // 글 삭제  DELETE /api/post?postId=1
    @DeleteMapping("/post")
    public ResponseEntity<Void> deletePostLegacy(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam("postId") Long postId
    ) {
        postService.deletePost(me.getId(), postId);
        return ResponseEntity.noContent().build();
    }

    // 유저 내용 확인  POST /api/postuser
    @PostMapping("/postuser")
    public ResponseEntity<PostListResponse> getMyPostsLegacy(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam(required = false) String emotion,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.Direction.DESC, "createdAt");
        return ResponseEntity.ok(postService.getMyPosts(me.getId(), emotion, pageable));
    }

    // 신고  POST /api/postreport?postId=1
    @PostMapping("/postreport")
    public ResponseEntity<Void> reportPostLegacy(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam("postId") Long postId
    ) {
        postService.reportPost(me.getId(), postId);
        return ResponseEntity.ok().build();
    }

    // 버튼 클릭  POST /api/botten  { "postId": 1, "buttonType": "EMPATHY" }
    public record LegacyButtonClickRequest(Long postId, String buttonType) {}

    @PostMapping("/botten")
    public ResponseEntity<ButtonClickResponse> clickButtonLegacy(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestBody LegacyButtonClickRequest req
    ) {
        ButtonClickResponse resp =
                postService.clickButton(me.getId(), req.postId(), req.buttonType());
        return ResponseEntity.ok(resp);
    }

    // 감정 비율  GET /api/post/stats/emotions
    @GetMapping("/post/stats/emotions")
    public ResponseEntity<java.util.List<EmotionStatResponse>> getEmotionStatsLegacy() {
        return ResponseEntity.ok(postService.getEmotionStats());
    }
}

