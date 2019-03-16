package com.dam.pharm.starter.secuirty;

import java.io.Serializable;

import com.dam.pharm.starter.dto.UserDTO;
import com.dam.pharm.starter.entities.User;


public class JwtAuthenticationResponse implements Serializable {

	private static final long serialVersionUID = 1250166508152483573L;

	private final String token;
	private final UserDTO user;

	public JwtAuthenticationResponse(String token, UserDTO user) {
		this.token = token;
		this.user = user;
	}

	public String getToken() {
		return this.token;
	}

	public UserDTO getUser() {
		return this.user;
	}

}
