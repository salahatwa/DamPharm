package com.dam.pharm.starter.graph.models;

public interface TopProduct {

	/**
	 * @return the name
	 */
	public String getName();

	/**
	 * @return the stock
	 */
	public double getStock();

	/**
	 * @return the orders
	 */
	public double getOrders();

	/**
	 * @return the sold
	 */
	public double getSold();

	public String getId();

}
