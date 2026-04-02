package com.project.pjt_01.dto.post;

import com.project.pjt_01.domain.ButtonType;
import com.project.pjt_01.domain.Emotion;
import com.project.pjt_01.domain.Post;
import com.project.pjt_01.domain.PostButtonStat;

import java.time.LocalDateTime;
import java.util.List;

public class PostDtos {

    // 글 작성 요청
    public record PostCreateRequest(
            String content,
            String emotion,  // "기쁨" 또는 "JOY" 형태 허용
            List<String> buttons  // 활성화할 버튼 목록 ("EMPATHY", "공감" 등)
    ) {}

    // 버튼 집계 응답
    public record ButtonStatDto(
            String buttonType,
            String label,
            int clickCount
    ) {
        public static ButtonStatDto from(PostButtonStat stat) {
            ButtonType t = stat.getButtonType();
            return new ButtonStatDto(
                    t.name(),
                    t.getKoreanLabel(),
                    stat.getClickCount()
            );
        }
    }

    // 글 단일 응답
    public record PostResponse(
            Long id,
            String authorName,
            String content,
            String emotion,
            String emotionLabel,
            String llmReply,
            boolean hidden,
            int reportedCount,
            LocalDateTime createdAt,
            List<ButtonStatDto> buttons
    ) {
        public static PostResponse from(Post post, List<PostButtonStat> stats) {
            Emotion e = post.getEmotion();
            return new PostResponse(
                    post.getId(),
                    post.getAuthor().getUsername(),
                    post.getContent(),
                    e.name(),
                    e.getKoreanLabel(),
                    post.getLlmReply(),
                    post.isHidden(),
                    post.getReportedCount(),
                    post.getCreatedAt(),
                    stats.stream().map(ButtonStatDto::from).toList()
            );
        }
    }

    // 리스트 응답 (페이지네이션)
    public record PostListResponse(
            List<PostResponse> items,
            int page,
            int size,
            long totalElements,
            int totalPages
    ) {}

    // 버튼 클릭 응답
    public record ButtonClickResponse(
            Long postId,
            String clickedButtonType,
            List<ButtonStatDto> buttons
    ) {}

    // 감정 비율 응답 (홈 화면용)
    public record EmotionStatResponse(
            String emotion,        // "JOY"
            String emotionLabel,   // "기쁨"
            long count,            // 해당 감정 글 수
            double ratio           // 전체 대비 비율 (0.0 ~ 1.0)
    ) {}
}

