package com.project.pjt_01.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("WriteFlow CMS API")
                        .description("커뮤니티 사이트용 백엔드 API 문서입니다.")
                        .version("1.0.0"));
    }
}
