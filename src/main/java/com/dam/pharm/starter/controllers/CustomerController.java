package com.dam.pharm.starter.controllers;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.integration.support.json.Jackson2JsonObjectMapper;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.dam.pharm.starter.entities.Customer;
import com.dam.pharm.starter.entities.QCustomer;
import com.dam.pharm.starter.filters.CustomerFilter;
import com.dam.pharm.starter.graph.models.Error;
import com.dam.pharm.starter.graph.models.Response;
import com.dam.pharm.starter.repository.CustomerRepository;
import com.dam.pharm.starter.utils.QueryBuilder;

@RestController
@RequestMapping("/api")
public class CustomerController {

	private static Logger LOGGER = LoggerFactory.getLogger(CustomerController.class);
	public Response response = new Response(0, "success", null);

	@Autowired
	private CustomerRepository customerRepository;

	@Autowired
	private QueryBuilder queryBuilder;
	
	@Autowired
	public Jackson2JsonObjectMapper jackson2JsonObjectMapper;

	@GetMapping("/customers")
	private Iterable<QCustomer> getAllCustomers(
			@RequestParam(name = "filter", required = false) String customerFilter) {
		System.err.println(customerFilter);
		
		CustomerFilter filter = null;
		try {
			filter = jackson2JsonObjectMapper.fromJson(customerFilter, CustomerFilter.class);
		} catch (Exception e) {
			e.printStackTrace();
			filter = new CustomerFilter();
		}
		
		Sort sort = new Sort(new Sort.Order(Direction.DESC, ""));
	    Pageable pageable = new PageRequest(filter.getPage(), 5, sort);

		return customerRepository.findAll(queryBuilder.build(customerFilter, CustomerFilter.class, "customer"),pageable);
	}

	@GetMapping("/customers/{id}")
	public Optional<Customer> getProduct(@PathVariable String id) {
		LOGGER.info("Get Customer :{}", id);
		return customerRepository.findById(id);
	}

	@PutMapping("/customers/update")
	private Customer updateCustomer(@RequestBody Customer customer) {
		return customerRepository.save(customer);
	}

	@PostMapping("/customers/add")
	private Customer createCustomer(@RequestBody Customer customer) {
		LOGGER.info("Adding Customer :{}", customer);
		return customerRepository.save(customer);
	}

	@DeleteMapping("/customers/delete/{id}")
	private @ResponseBody ResponseEntity<?> deleteCustomer(@PathVariable String id) {
		try {
			response.setCode(0);
			customerRepository.deleteById(id);
			return new ResponseEntity<Response>(response, HttpStatus.OK);
		} catch (Exception ex) {

			Error error = new Error();
			error.setReason("Error:" + ex.getMessage());
			error.setMessage("This Customer token Order ");

			response.setMessage(ex.getMessage());
			response.setCode(01);
			response.setError(error);
			return new ResponseEntity<Response>(response, HttpStatus.OK);
		}
	}
}
