package com.writeflow.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record SignupRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 3, max = 50) String username,
            @NotBlank @Size(min = 8, max = 128) String password,
            @NotBlank @Size(min = 1, max = 50) String nickname
    ) {}

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {}

    public record TokenPair(
            String accessToken,
            String refreshToken,
            String tokenType
    ) {
        public TokenPair(String accessToken, String refreshToken) {
            this(accessToken, refreshToken, "bearer");
        }
    }

    public record RefreshRequest(
            @NotBlank String refreshToken
    ) {}

    public record UserResponse(
            Long id,
            String email,
            String username,
            String nickname
    ) {}
}

