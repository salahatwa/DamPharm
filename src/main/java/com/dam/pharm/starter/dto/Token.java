package com.dam.pharm.starter.dto;

public class Token {

	private String token;

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	@Override
	public String toString() {

		String info = String.format("{ \"token\" : %s }", "\""+token+"\"");
		return info;
	}

}
