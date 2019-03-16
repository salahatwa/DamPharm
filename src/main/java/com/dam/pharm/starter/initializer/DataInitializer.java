
package com.dam.pharm.starter.initializer;

import java.util.*;

import com.dam.pharm.starter.entities.Company;
import com.dam.pharm.starter.entities.CompanyType;
import com.dam.pharm.starter.entities.Customer;
import com.dam.pharm.starter.entities.Order;
import com.dam.pharm.starter.entities.Product;
import com.dam.pharm.starter.entities.ProductDetail;
import com.dam.pharm.starter.entities.ProductType;
import com.dam.pharm.starter.entities.User;
import com.dam.pharm.starter.repository.CompanyRepository;
import com.dam.pharm.starter.repository.CompanyTypeRepository;
import com.dam.pharm.starter.repository.CustomerRepository;
import com.dam.pharm.starter.repository.OrderRepository;
import com.dam.pharm.starter.repository.ProductRepository;
import com.dam.pharm.starter.repository.ProductTypeRepository;
import com.dam.pharm.starter.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {


	@Autowired
	UserService userService;

	@Autowired
	CompanyTypeRepository companyTypeRepository;
	
	@Autowired
	CompanyRepository companyRepository;
	
	@Autowired
	ProductTypeRepository productTypeRepository;
	
	
	@Autowired
	ProductRepository productRepository;
	
	
	@Autowired
	CustomerRepository customerRepository;
	
	
	@Autowired
	OrderRepository orderRepository;
	
//	@Autowired 
//	OrderDetailsRepository orderDetailsRepository;

	@Override
	public void run(String... arg0) throws Exception {
		initCompanyTypes();
		initProductTypes();
		initOrder();
		User user = new User("testuser@gmail.com", "password123");
		Company company=new Company();
		company.setName("SSSS");
		
		CompanyType companyType2 = new CompanyType();
		companyType2.setName("TECH");

		companyType2=companyTypeRepository.save(companyType2);	
		
		company.setType(companyType2);
		company.setCreated_at(new Date());
		company=companyRepository.save(company);
		user.setCompany(company);
		user.setCreated_at(new Date());
		
		userService.createUser(user);
	}

	public void initCompanyTypes() {
		CompanyType companyType = new CompanyType();
		companyType.setName("JJJ");

		companyTypeRepository.save(companyType);

		CompanyType companyType2 = new CompanyType();
		companyType2.setName("Resturant");

		companyTypeRepository.save(companyType2);

		CompanyType companyType3 = new CompanyType();
		companyType3.setName("Office");

		companyTypeRepository.save(companyType3);

		CompanyType companyType4 = new CompanyType();
		companyType4.setName("Company");

		companyTypeRepository.save(companyType4);

	}
	
	public void initProductTypes()
	{
		ProductType productType=new ProductType();
		productType.setName("Product1");
		productTypeRepository.save(productType);
		
		ProductType productType2=new ProductType();
		productType2.setName("Product2");
		productTypeRepository.save(productType2);
		
		
		ProductType productType3=new ProductType();
		productType3.setName("Product3");
		productTypeRepository.save(productType3);
		
		
	}
	
	
	public void initOrder()
	{
		Product product=new Product();
		product.setName("asdasdsad");
		product.setSelling_price(20);
		product.setCost(50);
		product.setStock(5);
		product.setCreated_at(new Date());
		
		product=productRepository.save(product);
		
		
		Customer customer2=new Customer();
		customer2.setCompany_name("WAEL ALI");
		customer2.setCountry("EGYPT");
		customer2.setFull_name("HASJDHUASD asd");
		customer2.setEmail("@@@");
		customer2.setCreated_at(new Date());
		
		customer2=customerRepository.save(customer2);
		
		Customer customer=new Customer();
		customer.setCompany_name("CIT");
		customer.setCountry("asdasdsa");
		customer.setFull_name("HASJDHUASD asd");
		customer.setEmail("LLLLLL");
		customer.setCreated_at(new Date());
		
		customer=customerRepository.save(customer);
		
		Order order=new Order();
		order.setCustomer(customer);
		
		List<ProductDetail> productDetails=new ArrayList<>();
		
		ProductDetail pD1=new ProductDetail();
		pD1.setAmount(100);
		pD1.setProduct(product);
		pD1.setDiscount(55);
	
		
		productDetails.add(pD1);
		
		order.setProductDetails(productDetails);
		
        order.setCreated_at(new Date());		
//		order.setOrder_detail(details);
		
		orderRepository.save(order);
	}


}
