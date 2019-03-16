package com.dam.pharm.starter.filters;

import com.dam.pharm.starter.entities.Customer;
import com.dam.pharm.starter.entities.Product;
import com.dam.pharm.starter.entities.User;

public class OrderFilter extends BaseFilter {
	private Long id;
	private Product product;
	private Customer customer;

	private User user;

	/**
	 * @return the user
	 */
	public User getUser() {
		return user;
	}

	/**
	 * @param user
	 *            the user to set
	 */
	public void setUser(User user) {
		this.user = user;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Product getProduct() {
		return product;
	}

	public void setProduct(Product product) {
		this.product = product;
	}

	public Customer getCustomer() {
		return customer;
	}

	public void setCustomer(Customer customer) {
		this.customer = customer;
	}
}
