package com.project.pjt_01.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
public class Post extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Emotion emotion;

    @Column(name = "llm_reply", columnDefinition = "TEXT")
    private String llmReply;   // LLM 응답 (나중에 연동)

    @Column(nullable = false)
    private boolean hidden = false;

    @Column(name = "reported_count", nullable = false)
    private int reportedCount = 0;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostButtonStat> buttonStats = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ButtonClick> buttonClicks = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostReport> reports = new ArrayList<>();

    protected Post() {}

    public Post(User author, String content, Emotion emotion) {
        this.author = author;
        this.content = content;
        this.emotion = emotion;
    }

    public Long getId() { return id; }
    public User getAuthor() { return author; }
    public String getContent() { return content; }
    public Emotion getEmotion() { return emotion; }
    public String getLlmReply() { return llmReply; }
    public void setLlmReply(String llmReply) { this.llmReply = llmReply; }
    public boolean isHidden() { return hidden; }
    public int getReportedCount() { return reportedCount; }
    public List<PostButtonStat> getButtonStats() { return buttonStats; }

    public void addButtonStat(PostButtonStat stat) {
        buttonStats.add(stat);
    }

    public void increaseReportCount() {
        this.reportedCount++;
    }

    public void hide() {
        this.hidden = true;
    }
}
