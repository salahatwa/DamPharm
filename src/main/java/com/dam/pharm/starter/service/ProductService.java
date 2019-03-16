package com.dam.pharm.starter.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.dam.pharm.starter.entities.Customer;
import com.dam.pharm.starter.entities.Product;
import com.dam.pharm.starter.entities.QProduct;

public interface ProductService {
	
	public static Logger LOGGER = LoggerFactory.getLogger(ProductService.class);

	public Iterable<QProduct> getProducts(String productFilter);
	
	public Optional<Product> getProduct(String id);
	
	public void deleteProduct(String id);
	
	public Product updateProduct(Product product); 
	
	public Product addProduct(Product product) ;
	
	public List<Customer> getCustomersBoughtProduct(String id) ;
}
