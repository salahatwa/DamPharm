package com.dam.pharm.starter.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dam.pharm.starter.entities.ProductType;
import com.dam.pharm.starter.repository.ProductTypeRepository;


@RestController
@RequestMapping("/api")
@CrossOrigin(value = "http://localhost:4200", allowedHeaders = "*")
public class ProductTypeController {

	@Autowired
	private ProductTypeRepository productTypeRepository;
	
	@GetMapping("/products/types")
	public List<ProductType> getProductsType() {
		return productTypeRepository.findAll();
	}

}
