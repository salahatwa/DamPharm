package com.nonused.secuirty;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.dam.pharm.starter.dto.Token;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Service
public class TokenAuthenticationService {

	private static final String AUTH_HEADER_NAME = "Authorization";

	private final JwtTokenHandler jwtTokenHandler;

	@Autowired
	public TokenAuthenticationService(JwtTokenHandler jwtTokenHandler) {
		this.jwtTokenHandler = jwtTokenHandler;
	}

	public void addJwtTokenToHeader(HttpServletResponse response, UserAuthentication authentication) {
		final UserDetails user = authentication.getDetails();
		try {
			Token token = new Token();
			token.setToken(jwtTokenHandler.createTokenForUser(user));

			response.getWriter().write(token.toString());
		} catch (IOException e) {
			e.printStackTrace();
		}
		response.addHeader(AUTH_HEADER_NAME, "Bearer " + jwtTokenHandler.createTokenForUser(user));
	}

	public String getToken(UserAuthentication authentication) {
		final UserDetails user = authentication.getDetails();
		return jwtTokenHandler.createTokenForUser(user);
	}

	public UserAuthentication generateAuthenticationFromRequest(HttpServletRequest request) {
		String token = request.getHeader(AUTH_HEADER_NAME);

		if (token == null || token.isEmpty())
			return null;
		else
			token = token.replace("Bearer ", "").trim();

		return jwtTokenHandler.parseUserFromToken(token).map(UserAuthentication::new).orElse(null);
	}

	public String getTokenFromRequest(HttpServletRequest request) {
		String token = request.getHeader(AUTH_HEADER_NAME);

		if (token == null || token.isEmpty())
			return null;
		else
			token = token.replace("Bearer ", "").trim();
		
		return token;
	}

}
