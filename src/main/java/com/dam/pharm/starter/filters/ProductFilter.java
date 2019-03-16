package com.dam.pharm.starter.filters;

import com.dam.pharm.starter.entities.CompanyType;
import com.dam.pharm.starter.entities.User;

public class ProductFilter extends BaseFilter {
	private String sku;
	private String name;
	private CompanyType type;

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

	public String getSku() {
		return sku;
	}

	public void setSku(String sku) {
		this.sku = sku;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public CompanyType getType() {
		return type;
	}

	public void setType(CompanyType type) {
		this.type = type;
	}
}
