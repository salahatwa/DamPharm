package com.dam.pharm.starter.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dam.pharm.starter.entities.User;
import com.nonused.secuirty.SecurityUtils;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {
	
	private Logger LOGGER = LoggerFactory.getLogger(UserProfileController.class);

	
	@PutMapping("/profile")
	public void updateUser(@RequestBody User user)
	{
		LOGGER.info("Current Logged In User:"+SecurityUtils.getCurrentLoggedIn().toString());
		LOGGER.info("Begin Update Profile :{}",user);
		String old_password=user.getOld_password();
		String current_password=user.getPassword();
		
		
		
	}
}
