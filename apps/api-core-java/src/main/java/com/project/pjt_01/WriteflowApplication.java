package com.project.pjt_01;   // ✅ 패키지 선언은 항상 제일 위에!

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * 스프링부트 진입점 (Main Class)
 * - @SpringBootApplication: 자동 설정 + 컴포넌트 스캔 + 설정 클래스 통합
 * - @EnableJpaAuditing: BaseTimeEntity의 createdAt / updatedAt 자동 기록
 */
@SpringBootApplication
@EnableJpaAuditing
public class WriteflowApplication {

    public static void main(String[] args) {
        SpringApplication.run(WriteflowApplication.class, args);
    }
}
