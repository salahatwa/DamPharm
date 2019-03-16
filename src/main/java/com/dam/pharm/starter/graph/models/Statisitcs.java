package com.dam.pharm.starter.graph.models;

public class Statisitcs {
	
	private Graph graph;

	private Stats stats;

	private String orders;

	private String customers;

	private String products;

	public Graph getGraph() {
		return graph;
	}

	public void setGraph(Graph graph) {
		this.graph = graph;
	}

	public Stats getStats() {
		return stats;
	}

	public void setStats(Stats stats) {
		this.stats = stats;
	}

	public String getOrders() {
		return orders;
	}

	public void setOrders(String orders) {
		this.orders = orders;
	}

	public String getCustomers() {
		return customers;
	}

	public void setCustomers(String customers) {
		this.customers = customers;
	}

	public String getProducts() {
		return products;
	}

	public void setProducts(String products) {
		this.products = products;
	}

	@Override
	public String toString() {
		return "ClassPojo [graph = " + graph + ", stats = " + stats + ", orders = " + orders + ", customers = "
				+ customers + ", products = " + products + "]";
	}
}
