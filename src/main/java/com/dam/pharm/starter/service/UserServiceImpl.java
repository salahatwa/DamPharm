package com.dam.pharm.starter.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.dam.pharm.starter.dto.UserDTO;
import com.dam.pharm.starter.entities.Role;
import com.dam.pharm.starter.entities.User;
import com.dam.pharm.starter.exception.GeneralException;
import com.dam.pharm.starter.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {

	@Autowired
	private UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		User user = userRepository.findByUsername(username).get();

		if (user == null) {
			throw new UsernameNotFoundException(String.format("No user found with username '%s'.", username));
		} else {
			return user;
		}
	}

	/*@Override
	public Optional<User> whoami(HttpServletRequest req) {
		return userRepository
				.findByUsername(jwtTokenHandler.getUsername(tokenAuthenticationService.getTokenFromRequest(req)));
	}*/

	@Override
	public User update(User user, UserDTO params) {
		params.getEmail().ifPresent(user::setEmail);
		params.getEncodedPassword().ifPresent(user::setPassword);
		params.getUsername().ifPresent(user::setUsername);
		return userRepository.save(user);
	}

	@Override
	public Optional<Optional<User>> findUser(String id) {
		return Optional.of(userRepository.findById(id));

	}

	@Override
	public User createUser(User user) throws GeneralException {
			Role role = new Role();
			role.setRolename("ROLE_USER");
			user.setRole(role);
			user.setPassword(new BCryptPasswordEncoder().encode(user.getPassword()));
			user = userRepository.save(user);
			return user;
	}

	private User toUserRole(UserDTO userDTO) {
		User user = userDTO.toUser();
		Role role = new Role();
		role.setRolename("ROLE_USER");
		user.setRole(role);
		return user;
	}
}
