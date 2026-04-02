package com.writeflow.auth.service;

import com.writeflow.auth.domain.User;
import com.writeflow.auth.dto.AuthDtos.*;
import com.writeflow.auth.jwt.JwtTokenProvider;
import com.writeflow.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public UserResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
	if (userRepository.existsByNickname(request.nickname())) {
	    throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
	}

        String hashed = passwordEncoder.encode(request.password());
        User user = new User(
                request.email(),
                request.username(),
                hashed,
                request.nickname()
        );

        User saved = userRepository.save(user);

        return new UserResponse(
                saved.getId(),
                saved.getEmail(),
                saved.getUsername(),
                saved.getNickname()
        );
    }

    public TokenPair login(LoginRequest request) {

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.1"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.2");
        }

        String access = jwtTokenProvider.createAccessToken(user.getId(), user.getUsername());
        String refresh = jwtTokenProvider.createRefreshToken(user.getId(), user.getUsername());

        return new TokenPair(access, refresh);
    }

    public TokenPair refresh(RefreshRequest request) {
        var jws = jwtTokenProvider.parseToken(request.refreshToken());
        var claims = jws.getBody();

        String type = (String) claims.get("type");
        if (!"refresh".equals(type)) {
            throw new IllegalArgumentException("리프레시 토큰이 아닙니다.");
        }

        Long userId = Long.parseLong(claims.getSubject());
        String username = (String) claims.get("username");

        String newAccess = jwtTokenProvider.createAccessToken(userId, username);
        String newRefresh = jwtTokenProvider.createRefreshToken(userId, username);

        return new TokenPair(newAccess, newRefresh);
    }
}

