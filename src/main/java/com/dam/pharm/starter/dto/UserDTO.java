package com.dam.pharm.starter.dto;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.dam.pharm.starter.entities.Role;
import com.dam.pharm.starter.entities.User;

import javax.validation.constraints.Size;
import java.util.Collection;
import java.util.Collections;
import java.util.Optional;

public class UserDTO {
	
	private static Logger LOGGER=LoggerFactory.getLogger(UserDTO.class);

	private static final String ROLE_USER = "ROLE_USER";

	private String email;

	@Size(min = 8, max = 100)
	private String password;
	
	private String username;

	public Optional<String> getUsername() {
		return Optional.ofNullable(username);
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public UserDTO() {
	}

	public Optional<String> getEmail() {
		return Optional.ofNullable(email);
	}

	public Optional<String> getEncodedPassword() {
		return Optional.ofNullable(password).map(p -> new BCryptPasswordEncoder().encode(p));
	}


	public User toUser() {
		User user = new User();
		user.setUsername(username);
		Role role=new Role();
		role.setRolename("Default_USER");
		user.setRole(role);
		user.setPassword(new BCryptPasswordEncoder().encode(password));
		user.setEmail(email);
		return user;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public void setEmail(String email) {
		this.email = email;
	}


	public UsernamePasswordAuthenticationToken toAuthenticationToken() {
		LOGGER.info("Login Using Email: {}" , email);
		return new UsernamePasswordAuthenticationToken(email, password, getAuthorities());
	}

	public Collection<? extends GrantedAuthority> getAuthorities() {
		return Collections.singleton(() -> ROLE_USER);
	}

	@Override
	public String toString() {
		return username + ":" + email+":"+password;
	}
}