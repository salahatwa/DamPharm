package com.nonused.secuirty;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.dam.pharm.starter.filters.StatelessAuthenticationFilter;
import com.dam.pharm.starter.filters.StatelessLoginFilter;
import com.dam.pharm.starter.service.UserService;
import com.google.common.collect.ImmutableList;
import com.nonused.secuirty.RestUnauthorizedEntryPoint;
import com.nonused.secuirty.TokenAuthenticationService;

@Configuration
@EnableWebSecurity
@Order(1)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

	@Autowired
	private UserService userService;

	@Autowired
	private TokenAuthenticationService tokenAuthenticationService;


	// @Autowired
	// private AuthenticationSuccessHandler restAuthenticationSuccessHandler;
	//
	// @Autowired
	// private AuthenticationFailureHandler restAuthenticationFailureHandler;

	public SecurityConfig() {
		super(true);
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		final CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(ImmutableList.of("*"));
		configuration.setAllowedMethods(ImmutableList.of("HEAD", "GET", "POST", "PUT", "DELETE", "PATCH"));
		// setAllowCredentials(true) is important, otherwise:
		// The value of the 'Access-Control-Allow-Origin' header in the response must
		// not be the wildcard '*' when the request's credentials mode is 'include'.
		configuration.setAllowCredentials(true);
		// setAllowedHeaders is important! Without it, OPTIONS preflight request
		// will fail with 403 Invalid CORS request
		configuration.setAllowedHeaders(ImmutableList.of("Authorization", "Cache-Control", "Content-Type"));
		final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Override
	protected void configure(HttpSecurity http) throws Exception {

		http.cors();

		http.csrf().disable();

		// h2 database console
		http.headers().frameOptions().disable();

//		http.exceptionHandling().and().anonymous().and().servletApi().and().headers().cacheControl();

		//authenticationEntryPoint(restAuthenticationEntryPoint)
//		http.authorizeRequests().antMatchers(HttpMethod.GET, "/api/**").permitAll()
//		.antMatchers(HttpMethod.POST, "/api/**").permitAll().anyRequest().authenticated()
//		.and()
//        .exceptionHandling().accessDeniedHandler(restAccessDeniedHandler);

		http.addFilterBefore(new StatelessLoginFilter("/api/auth/login", tokenAuthenticationService, userService,
				authenticationManager()), UsernamePasswordAuthenticationFilter.class);

		http.addFilterBefore(new StatelessAuthenticationFilter(tokenAuthenticationService),
				UsernamePasswordAuthenticationFilter.class);

	}

	@Bean
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(userService).passwordEncoder(new BCryptPasswordEncoder());
	}

	@Override
	protected UserDetailsService userDetailsService() {
		return userService;
	}
}