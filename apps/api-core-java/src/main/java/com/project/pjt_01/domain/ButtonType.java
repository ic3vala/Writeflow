package com.project.pjt_01.domain;

public enum ButtonType {
    EMPATHY("공감"),
    COMFORT("위로"),
    SAD("슬픔"),
    HAPPY("행복"),
    GOOD("좋음"),
    ANGRY("분노"),
    DISLIKE("싫음");

    private final String koreanLabel;

    ButtonType(String koreanLabel) {
        this.koreanLabel = koreanLabel;
    }

    public String getKoreanLabel() {
        return koreanLabel;
    }

    public static ButtonType from(String value) {
        if (value == null) throw new IllegalArgumentException("버튼 타입은 필수입니다.");
        value = value.trim();
        for (ButtonType b : values()) {
            // 영어 코드 (EMPATHY, HAPPY ...) 대소문자 무시
            if (b.name().equalsIgnoreCase(value)) return b;
            // 한글 라벨 ("공감", "행복" ...)
            if (b.koreanLabel.equals(value)) return b;
        }
        throw new IllegalArgumentException("지원하지 않는 버튼 타입입니다: " + value);
    }
}
