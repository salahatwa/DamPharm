//package com.dam.pharm.starter.controllers;
//
//import com.dam.pharm.starter.dto.Token;
//import com.dam.pharm.starter.dto.UserDTO;
//import com.dam.pharm.starter.entities.User;
//import com.dam.pharm.starter.exception.GeneralException;
//import com.dam.pharm.starter.service.CompanyService;
//import com.dam.pharm.starter.service.UserService;
//import com.nonused.secuirty.TokenAuthenticationService;
//import com.nonused.secuirty.UserAuthentication;
//
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.Date;
//import java.util.Optional;
//
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//import javax.transaction.Transactional;
//import javax.validation.Valid;
//
//@RestController
//@RequestMapping("/api/auth") /// api/auth
////@CrossOrigin(value = "http://localhost:4200", allowedHeaders = "*")
//public class UserController {
//
//	private static Logger LOGGER = LoggerFactory.getLogger(UserDTO.class);
//
//	@Autowired
//	private UserService userService;
//	
//	@Autowired 
//	private CompanyService companyService;
//
//	@Autowired
//	private TokenAuthenticationService tokenAuthenticationService;
//
//	/**
//	 * http://localhost:8080/api/auth/register
//	 * {"company":{"name":"saloaher","type":"Restaurant"},"email":"salahatwa@outloow.com","password":"Salah3889735*","name":"ATWA_TESTqq"}
//	 * 
//	 * @param user
//	 * @return
//	 */
//	@Transactional
//	@PostMapping("/register")
//	public @ResponseBody ResponseEntity<Token> register(@Valid @RequestBody User user, HttpServletResponse response) {
//
//		try
//		{
//		user.setCreated_at(new Date());
//		user.setUpdated_at(new Date());
//
//		user.setCompany(companyService.saveCompany(user.getCompany()));
//		
//		LOGGER.info("Register User:{}",user.toString());
//		
//		userService.createUser(user);
//
//		final UserAuthentication userAuthentication = new UserAuthentication(user);
//
//		// tokenAuthenticationService.addJwtTokenToHeader(response, userAuthentication);
//
//		String token = tokenAuthenticationService.getToken(userAuthentication);
//
//		Token instantToken = new Token();
//		instantToken.setToken(token);
//
//		LOGGER.info("User token :{} ",  instantToken.toString());
//
//		return new ResponseEntity<Token>(instantToken, HttpStatus.OK);
//		}catch(Exception ex) {
//			throw new GeneralException("Error During register" ,ex.getCause());
//		}
//	}
//
//	/**
//	 * http://localhost:8080/api/auth/detail
//	 * @param request
//	 * @return
//	 */
//	@GetMapping("/detail")
//	public @ResponseBody Optional<User> getUserDetails(HttpServletRequest request) {
//
//		Optional<User> user=userService.whoami(request);
//		
//		return user;
//	}
//
//}
