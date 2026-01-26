package com.folia.server.auth;

import com.folia.server.common.messages.MessageKey;
import com.folia.server.exceptions.TokenNotFoundException;
import com.folia.server.exceptions.TokenRevokedException;
import com.folia.server.security.JwtService;
import com.folia.server.user.UserDto;
import com.folia.server.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

        private final UserRepository userRepository;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final RefreshTokenService refreshTokenService;

        public AuthResponse authenticate(LoginRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.identifier(),
                                                request.password()));
                var user = userRepository.findByUsernameOrEmail(request.identifier())
                                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
                var jwtToken = jwtService.generateToken(user);

                var refreshToken = refreshTokenService.createRefreshToken(user);

                return new AuthResponse(jwtToken, refreshToken.getToken(), UserDto.from(user));
        }

        public AuthResponse refreshToken(TokenRefreshRequest request) {
                String requestRefreshToken = request.refreshToken();

                return refreshTokenService.findByToken(requestRefreshToken)
                                .map(refreshTokenService::verifyExpiration)
                                .map(token -> {
                                        if (token.isRevoked()) {
                                                refreshTokenService.deleteByUserId(token.getUser());
                                                throw new TokenRevokedException(MessageKey.AUTH_REFRESH_TOKEN_REVOKED);
                                        }
                                        return token;
                                })
                                .map(token -> {
                                        refreshTokenService.revokeToken(token);
                                        var user = token.getUser();
                                        String accessToken = jwtService.generateToken(user);
                                        var newRefreshToken = refreshTokenService.createRefreshToken(user);
                                        return new AuthResponse(accessToken, newRefreshToken.getToken(),
                                                        UserDto.from(user));
                                })
                                .orElseThrow(() -> new TokenNotFoundException(MessageKey.AUTH_REFRESH_TOKEN_NOT_FOUND));
        }
}
