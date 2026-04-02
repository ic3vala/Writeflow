package com.project.pjt_01.domain;

public enum Emotion {
    JOY("기쁨"),
    ANGER("분노"),
    SADNESS("슬픔"),
    PLEASURE("즐거움"),
    LOVE("사랑"),
    HATE("미움"),
    AMBITION("야망");

    private final String koreanLabel;

    Emotion(String koreanLabel) {
        this.koreanLabel = koreanLabel;
    }

    public String getKoreanLabel() {
        return koreanLabel;
    }

    public static Emotion from(String value) {
        if (value == null) throw new IllegalArgumentException("감정은 필수입니다.");
        value = value.trim();
        // 한글도 허용
        for (Emotion e : values()) {
            if (e.name().equalsIgnoreCase(value)) return e;
            if (e.koreanLabel.equals(value)) return e;
        }
        throw new IllegalArgumentException("지원하지 않는 감정입니다: " + value);
    }
}
