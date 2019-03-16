package com.dam.pharm.starter.service;

import com.dam.pharm.starter.dto.UserDTO;
import com.dam.pharm.starter.entities.User;
import com.dam.pharm.starter.exception.GeneralException;

import java.util.Optional;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public interface UserService extends org.springframework.security.core.userdetails.UserDetailsService {

	static Logger LOGGER = LoggerFactory.getLogger(UserService.class);

	User update(User user, UserDTO params);

	Optional<Optional<User>> findUser(String id);
	
//	public Optional<User> whoami(HttpServletRequest req);

	public User createUser(User user) throws GeneralException;

}