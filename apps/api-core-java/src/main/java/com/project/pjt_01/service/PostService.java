package com.project.pjt_01.service;

import com.project.pjt_01.domain.*;
import com.project.pjt_01.dto.post.PostDtos.*;
import com.project.pjt_01.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    // 신고 임계치 (15회 이상이면 숨김)
    private static final int REPORT_THRESHOLD = 15;

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostButtonStatRepository postButtonStatRepository;
    private final ButtonClickRepository buttonClickRepository;
    private final PostReportRepository postReportRepository;

    // 글 작성
    public PostResponse createPost(Long userId, PostCreateRequest req) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Emotion emotion = Emotion.from(req.emotion());
        Post post = new Post(author, req.content(), emotion);
        postRepository.save(post);

        // 글 작성 시 활성화할 버튼 목록이 비어 있으면 예외
        if (req.buttons() == null || req.buttons().isEmpty()) {
            throw new IllegalArgumentException("최소 1개 이상의 버튼을 선택해야 합니다.");
        }

        // 요청으로 넘어온 버튼 문자열들을 Enum으로 변환 (한글/영문 모두 허용) + 중복 제거
        List<ButtonType> buttonTypes = req.buttons().stream()
                .map(ButtonType::from)
                .distinct()
                .toList();

        // 선택된 버튼들에 대해서만 집계 row 생성
        for (ButtonType type : buttonTypes) {
            PostButtonStat stat = new PostButtonStat(post, type);
            postButtonStatRepository.save(stat);
            post.addButtonStat(stat);
        }

        // TODO: 여기서 LLM 호출 → post.setLlmReply(...) 후 저장하는 로직 연결 가능

        List<PostButtonStat> stats = postButtonStatRepository.findByPost(post);
        return PostResponse.from(post, stats);
    }

    // 글 단건 조회 (숨김 글이면 예외)
    @Transactional(readOnly = true)
    public PostResponse getPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("글을 찾을 수 없습니다."));

        if (post.isHidden()) {
            throw new IllegalStateException("숨김 처리된 글입니다.");
        }

        List<PostButtonStat> stats = postButtonStatRepository.findByPost(post);
        return PostResponse.from(post, stats);
    }

    // 전체 글 목록 (무한스크롤용) - 숨김 글 제외
    @Transactional(readOnly = true)
    public PostListResponse getPosts(String emotionValue, Pageable pageable) {

        Page<Post> page;
        if (emotionValue == null || emotionValue.isBlank()) {
            page = postRepository.findByHiddenFalseOrderByCreatedAtDesc(pageable);
        } else {
            Emotion emotion = Emotion.from(emotionValue);
            page = postRepository.findByHiddenFalseAndEmotionOrderByCreatedAtDesc(emotion, pageable);
        }

        List<PostResponse> items = page.getContent().stream()
                .map(p -> PostResponse.from(p, postButtonStatRepository.findByPost(p)))
                .toList();

        return new PostListResponse(
                items,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    // 내 글 목록 (숨김 여부와 상관없이 내가 쓴 글 전체)
    @Transactional(readOnly = true)
    public PostListResponse getMyPosts(Long userId, String emotionValue, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Page<Post> page;
        if (emotionValue == null || emotionValue.isBlank()) {
            page = postRepository.findByAuthorOrderByCreatedAtDesc(user, pageable);
        } else {
            Emotion emotion = Emotion.from(emotionValue);
            page = postRepository.findByAuthorAndEmotionOrderByCreatedAtDesc(user, emotion, pageable);
        }

        List<PostResponse> items = page.getContent().stream()
                .map(p -> PostResponse.from(p, postButtonStatRepository.findByPost(p)))
                .toList();

        return new PostListResponse(
                items,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    // 글 삭제 (작성자만 가능)
    public void deletePost(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("글을 찾을 수 없습니다."));

        if (!post.getAuthor().getId().equals(userId)) {
            throw new IllegalStateException("본인이 작성한 글만 삭제할 수 있습니다.");
        }

        post.hide();
    }

    // 버튼 클릭 (한 유저당 한 글에 한 번만)
    public ButtonClickResponse clickButton(Long userId, Long postId, String buttonTypeStr) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("글을 찾을 수 없습니다."));

        if (post.isHidden()) {
            throw new IllegalStateException("숨김 처리된 글에는 버튼을 누를 수 없습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (buttonClickRepository.existsByPostAndUser(post, user)) {
            throw new IllegalStateException("이미 이 글에 버튼을 클릭했습니다.");
        }

        ButtonType type = ButtonType.from(buttonTypeStr);

        // 이 글에서 해당 버튼이 활성화되어 있는지 확인
        PostButtonStat stat = postButtonStatRepository
                .findByPostAndButtonType(post, type)
                .orElseThrow(() -> new IllegalArgumentException("이 글에서 활성화되지 않은 버튼입니다."));

        // 클릭 로그 저장
        ButtonClick click = new ButtonClick(post, user, type);
        buttonClickRepository.save(click);

        // 집계 증가
        stat.increase();

        List<PostButtonStat> stats = postButtonStatRepository.findByPost(post);
        var buttonDtos = stats.stream().map(ButtonStatDto::from).toList();

        return new ButtonClickResponse(post.getId(), type.name(), buttonDtos);
    }

    // 신고 (임계치 넘으면 숨김)
    public void reportPost(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("글을 찾을 수 없습니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (postReportRepository.findByPostAndUser(post, user).isPresent()) {
            throw new IllegalStateException("이미 신고한 글입니다.");
        }

        PostReport report = new PostReport(post, user);
        postReportRepository.save(report);

        // Post 엔티티 내부 카운트 증가
        post.increaseReportCount();

        // 실제 신고 개수 기준으로 숨김 처리
        long reportCount = postReportRepository.countByPost(post);
        if (reportCount >= REPORT_THRESHOLD) {
            post.hide();
        }
    }

    // 감정 비율 통계 (숨김되지 않은 글 기준)
    @Transactional(readOnly = true)
    public List<EmotionStatResponse> getEmotionStats() {
        // 숨김되지 않은 글만 대상으로 통계 계산
        List<Post> visiblePosts = postRepository.findAll().stream()
                .filter(p -> !p.isHidden())
                .toList();

        long total = visiblePosts.size();

        // 글이 하나도 없으면 모든 감정에 대해 0 반환
        if (total == 0) {
            return Arrays.stream(Emotion.values())
                    .map(e -> new EmotionStatResponse(
                            e.name(),
                            e.getKoreanLabel(),
                            0L,
                            0.0
                    ))
                    .toList();
        }

        // 감정별 개수 집계
        Map<Emotion, Long> counts = visiblePosts.stream()
                .collect(Collectors.groupingBy(Post::getEmotion, Collectors.counting()));

        // 비율 계산
        return Arrays.stream(Emotion.values())
                .map(e -> {
                    long count = counts.getOrDefault(e, 0L);
                    double ratio = (double) count / total;
                    return new EmotionStatResponse(
                            e.name(),
                            e.getKoreanLabel(),
                            count,
                            ratio
                    );
                })
                .toList();
    }

    // 감정 전체 코드 목록 (JOY, ANGER, ...)
    @Transactional(readOnly = true)
    public List<String> getEmotionCodes() {
        return Arrays.stream(Emotion.values())
                .map(Enum::name)
                .toList();
    }

    // 버튼 전체 코드 목록 (EMPATHY, COMFORT, ...)
    @Transactional(readOnly = true)
    public List<String> getButtonCodes() {
        return Arrays.stream(ButtonType.values())
                .map(Enum::name)
                .toList();
    }
}
