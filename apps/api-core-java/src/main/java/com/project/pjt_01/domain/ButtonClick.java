package com.project.pjt_01.domain;
//1명당 1클릭 제한용
import jakarta.persistence.*;

@Entity
@Table(name = "button_clicks",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_click_post_user",
                columnNames = {"post_id", "user_id"}
        ))
public class ButtonClick {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "button_type", nullable = false, length = 20)
    private ButtonType buttonType;

    protected ButtonClick() {}

    public ButtonClick(Post post, User user, ButtonType buttonType) {
        this.post = post;
        this.user = user;
        this.buttonType = buttonType;
    }

    public Long getId() { return id; }
    public Post getPost() { return post; }
    public User getUser() { return user; }
    public ButtonType getButtonType() { return buttonType; }
}
