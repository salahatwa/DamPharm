package com.dam.pharm.starter.entities;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

@Entity
@Table
public class Product implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(generator = "uuid")
	@GenericGenerator(name = "uuid", strategy = "uuid2")
	private String id;

	private String sku = null;
	private String name;
	private String description = null;
	private String type_id;

	@OneToOne(cascade = { CascadeType.DETACH, CascadeType.REMOVE }, orphanRemoval = true)
	@JoinColumn(name = "product_type_id")
	private ProductType type;
	private double stock;

	private double numberOfRemainStock;


	private double cost;
	private double selling_price;

	@Lob
	private String image;

	private Date updated_at;

	private Date deleted_at;

	private Date created_at;
	
	@ManyToOne(cascade = CascadeType.DETACH)
	@JoinColumn(name = "user_id")
	private User user;

	/**
	 * @return the user
	 */
	public User getUser() {
		return user;
	}

	/**
	 * @param user the user to set
	 */
	public void setUser(User user) {
		this.user = user;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	/**
	 * @return the numberOfRemainStock
	 */
	public double getNumberOfRemainStock() {
		return numberOfRemainStock;
	}

	/**
	 * @param numberOfRemainStock the numberOfRemainStock to set
	 */
	public void setNumberOfRemainStock(double numberOfRemainStock) {
		this.numberOfRemainStock = numberOfRemainStock;
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

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getType_id() {
		return type_id;
	}

	public void setType_id(String type_id) {
		this.type_id = type_id;
	}

	public ProductType getType() {
		return type;
	}

	public void setType(ProductType type) {
		this.type = type;
	}

	public double getStock() {
		return stock;
	}

	public void setStock(double stock) {
		this.stock = stock;
	}

	public double getCost() {
		return cost;
	}

	public void setCost(double cost) {
		this.cost = cost;
	}

	public double getSelling_price() {
		return selling_price;
	}

	public void setSelling_price(double selling_price) {
		this.selling_price = selling_price;
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public Date getUpdated_at() {
		return updated_at;
	}

	public void setUpdated_at(Date updated_at) {
		this.updated_at = updated_at;
	}

	public Date getDeleted_at() {
		return deleted_at;
	}

	public void setDeleted_at(Date deleted_at) {
		this.deleted_at = deleted_at;
	}

	public Date getCreated_at() {
		return created_at;
	}

	public void setCreated_at(Date created_at) {
		this.created_at = created_at;
	}

	@Override
	public String toString() {
		return "Product [id=" + id + ", sku=" + sku + ", name=" + name + ", description=" + description + ", type_id="
				+ type_id + ", type=" + type + ", stock=" + stock + ", cost=" + cost + ", selling_price="
				+ selling_price + ", image=" + image + ", updated_at=" + updated_at + ", deleted_at=" + deleted_at
				+ ", created_at=" + created_at + "]";
	}

}
