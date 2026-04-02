package com.project.pjt_01.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "post_button_stats",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_post_button",
                columnNames = {"post_id", "button_type"}
        ))
public class PostButtonStat {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Enumerated(EnumType.STRING)
    @Column(name = "button_type", nullable = false, length = 20)
    private ButtonType buttonType;

    @Column(name = "click_count", nullable = false)
    private int clickCount = 0;

    protected PostButtonStat() {}

    public PostButtonStat(Post post, ButtonType buttonType) {
        this.post = post;
        this.buttonType = buttonType;
    }

    public Long getId() { return id; }
    public Post getPost() { return post; }
    public ButtonType getButtonType() { return buttonType; }
    public int getClickCount() { return clickCount; }

    public void increase() {
        this.clickCount++;
    }
}
