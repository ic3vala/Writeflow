package com.project.pjt_01.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "post_reports",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_report_post_user",
                columnNames = {"post_id", "user_id"}
        ))
public class PostReport {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    protected PostReport() {}

    public PostReport(Post post, User user) {
        this.post = post;
        this.user = user;
    }

    public Long getId() { return id; }
    public Post getPost() { return post; }
    public User getUser() { return user; }
}
