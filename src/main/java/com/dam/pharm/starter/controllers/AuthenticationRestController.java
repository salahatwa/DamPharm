package com.dam.pharm.starter.controllers;

import java.util.Calendar;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mobile.device.Device;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dam.pharm.starter.dto.UserDTO;
import com.dam.pharm.starter.entities.User;
import com.dam.pharm.starter.exception.GeneralException;
import com.dam.pharm.starter.repository.UserRepository;
import com.dam.pharm.starter.secuirty.JwtAuthenticationRequest;
import com.dam.pharm.starter.secuirty.JwtAuthenticationResponse;
import com.dam.pharm.starter.secuirty.JwtTokenUtil;

/**
 * 
 * @author salah
 *
 */
@RestController
@RequestMapping("${jwt.route.authentication.path}")
public class AuthenticationRestController {

	@Value("${jwt.header}")
	private String tokenHeader;

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@Autowired
	private UserDetailsService userDetailsService;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private BCryptPasswordEncoder bCryptPasswordEncoder;

	/**
	 * http://localhost:8080/auth POST BODY: {"username":"admin","password":"admin"}
	 * 
	 * @param authenticationRequest
	 * @param device
	 * @return
	 * @throws AuthenticationException
	 */
	@PostMapping
	public ResponseEntity<?> createAuthenticationToken(@RequestBody JwtAuthenticationRequest authenticationRequest,
			Device device) throws AuthenticationException {

		// Perform the security
		final Authentication authentication = authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(),
						authenticationRequest.getPassword()));
		SecurityContextHolder.getContext().setAuthentication(authentication);

		// Reload password post-security so we can generate token
		final UserDetails userDetails = userDetailsService.loadUserByUsername(authenticationRequest.getUsername());
		final String token = jwtTokenUtil.generateToken(userDetails, device);

		System.err.println("::::::" + userDetails.toString());
		User user = (User) userDetails;
		UserDTO userDTO = new UserDTO();
		BeanUtils.copyProperties(user, userDTO);
		// Return the token
		return ResponseEntity.ok(new JwtAuthenticationResponse(token, userDTO));
	}

	@PostMapping("/${jwt.route.authentication.register}")
	public ResponseEntity<?> registerUser(@RequestBody UserDTO userDTO, Device device)  {
		User user = new User();
		try {
			Assert.notNull(userDTO, "Parameter user can not be null!");
			Assert.hasLength(userDTO.getUsername().get(), "Username can not be empty!");
			Assert.hasLength(userDTO.getPassword(), "password can not be blank!");
			Assert.notNull(userDTO.getEmail(), "Parameter user can not be null!");

			boolean check = userRepository.findByUsername(userDTO.getUsername().get()).isPresent();

			if (check)
				throw new GeneralException("username already exists!");

			check = userRepository.findByEmail(userDTO.getEmail().get()).isPresent();

			if (check)
				throw new GeneralException("The mailbox has been registered!");

			user = userDTO.toUser();

			Date now = Calendar.getInstance().getTime();

			user.setPassword(bCryptPasswordEncoder.encode(userDTO.getPassword()));

			user = userRepository.save(user);

		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return ResponseEntity.ok(user);
	}

	@GetMapping("/${jwt.route.authentication.refresh}")
	public ResponseEntity<?> refreshAndGetAuthenticationToken(HttpServletRequest request) {
		String token = request.getHeader(tokenHeader);
		String username = jwtTokenUtil.getUsernameFromToken(token);
		User user = (User) userDetailsService.loadUserByUsername(username);

		if (jwtTokenUtil.canTokenBeRefreshed(token, user.getLastLogin())) {
			String refreshedToken = jwtTokenUtil.refreshToken(token);
			UserDTO userDTO = new UserDTO();
			BeanUtils.copyProperties(user, userDTO);
			// Return the token
			return ResponseEntity.ok(new JwtAuthenticationResponse(token, userDTO));
		} else {
			return ResponseEntity.badRequest().body(null);
		}
	}

	/*
	 * @GetMapping("/${jwt.route.authentication.logout}") public ResponseEntity<?>
	 * logout(HttpServletRequest request) { // String token =
	 * request.getHeader(tokenHeader); // String username =
	 * jwtTokenUtil.getUsernameFromToken(token); // User user = (User)
	 * userDetailsService.loadUserByUsername(username);
	 * 
	 * Data data = Data.success("logout successuflly", Data.NOOP); return
	 * ResponseEntity.ok(data); }
	 */

}
