package com.dam.pharm.starter.controllers;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dam.pharm.starter.entities.Customer;
import com.dam.pharm.starter.entities.Product;
import com.dam.pharm.starter.entities.QProduct;
import com.dam.pharm.starter.service.ProductService;

//api/products/8b76cfec-b42e-4dc9-9a43-a7f032780004/customers

// http://localhost:8080/api/products/delete/76940c85-f73e-4f17-bd13-67495ea2c81d/ 404 ()

@RestController
@RequestMapping("/api")
@CrossOrigin(value = "http://localhost:4200", allowedHeaders = "*")
public class ProductController {

	@Autowired
	private ProductService productService;

	@GetMapping("/products")
	private Iterable<QProduct> getProducts(@RequestParam(name = "filter", required = false) String productFilter) {
		return productService.getProducts(productFilter);
	}

	@GetMapping("/products/{id}")
	public Optional<Product> getProduct(@PathVariable String id) {
		return productService.getProduct(id);
	}

	@GetMapping("/products/customers/{id}")
	private List<Customer> getCustomersBoughtProduct(@PathVariable String id) {
		return productService.getCustomersBoughtProduct(id);
	}

	@DeleteMapping("/products/delete/{id}")
	public void deleteProduct(@PathVariable String id) {
		productService.deleteProduct(id);
	}

	@PutMapping("/products/update/{id}")
	public Product updateProduct(@PathVariable String id, @RequestBody Product product) {
		return productService.updateProduct( product);
	}

	@PostMapping("/products/add")
	public Product addProduct(@RequestBody Product product) {

		return productService.addProduct(product);
	}

}
