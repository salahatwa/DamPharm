package com.dam.pharm.starter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//GET http://localhost:8080/api/auth/detail 404 ()
//:8080/api/customers:1 GET http://localhost:8080/api/customers 500 ()
//:8080/api/stats/top/products:1 GET http://localhost:8080/api/stats/top/products 500 ()
//:8080/api/stats:1 GET http://localhost:8080/api/stats 500 ()
//:8080/api/products:1 GET http://localhost:8080/api/products 
//:8080/api/auth/detail:1 GET http://localhost:8080/api/auth/detail 404 ()
//:8080/api/auth/detail:1 GET http://localhost:8080/api/auth/detail 404 ()
//:8080/api/auth/detail:1 GET http://localhost:8080/api/auth/detail 401 (
@SpringBootApplication
public class DamPharmApplication {

	public static void main(String[] args) {
		SpringApplication.run(DamPharmApplication.class, args);
	}
}
