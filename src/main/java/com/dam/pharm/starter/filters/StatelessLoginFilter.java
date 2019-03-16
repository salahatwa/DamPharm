package com.dam.pharm.starter.filters;

import com.dam.pharm.starter.dto.UserDTO;
import com.dam.pharm.starter.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.nonused.secuirty.TokenAuthenticationService;
import com.nonused.secuirty.UserAuthentication;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Scanner;

/**
 * Filter for login only
 * 
 * http://localhost:8080/api/auth/login { "email": "salsahatwa@outloow.com",
 * "password":"Salah3889735*" }
 * 
 * @author salah
 *
 */
public class StatelessLoginFilter extends AbstractAuthenticationProcessingFilter {

	private static Logger LOGGER = LoggerFactory.getLogger(StatelessLoginFilter.class);

	private final TokenAuthenticationService tokenAuthenticationService;
	private final UserService userService;

	public StatelessLoginFilter(String urlMapping, TokenAuthenticationService tokenAuthenticationService,
			UserService userService, AuthenticationManager authenticationManager) {
		super(urlMapping);
		this.tokenAuthenticationService = tokenAuthenticationService;
		this.userService = userService;
		setAuthenticationManager(authenticationManager);
	}

	@Override
	public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
			throws AuthenticationException, IOException, ServletException {

		UsernamePasswordAuthenticationToken loginToken = null;

		UserDTO user = toUser(request);
		loginToken = user.toAuthenticationToken();

		return getAuthenticationManager().authenticate(loginToken);
	}

	private UserDTO toUser(HttpServletRequest request) throws IOException {
		return new ObjectMapper().readValue(request.getInputStream(), UserDTO.class);
	}

	@Override
	protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
			Authentication authResult) throws IOException, ServletException {

		final UserDetails authenticatedUser = userService.loadUserByUsername(authResult.getName());

		final UserAuthentication userAuthentication = new UserAuthentication(authenticatedUser);

		LOGGER.info("User [{}] is Authenticated :{}", authResult.getName(), userAuthentication.isAuthenticated());
		tokenAuthenticationService.addJwtTokenToHeader(response, userAuthentication);
		SecurityContextHolder.getContext().setAuthentication(userAuthentication);
	}

	@Override
	protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException failed) throws IOException, ServletException {

		LOGGER.warn("Unsuccessful Login cause of :{}", failed.getMessage());
		super.unsuccessfulAuthentication(request, response, failed);
	}
}