package com.dam.pharm.starter.service;

import java.util.Optional;

import com.dam.pharm.starter.entities.Order;
import com.dam.pharm.starter.entities.QOrder;

/**
 * @author atwa
 * Jul 22, 2018
 */
public interface OrderService {
	
	public Iterable<QOrder> findAll(String orderFilter);
	
	public Order saveOrder(Order order);
	
	public Optional<Order> findById(long id);
	
	public void deleteById(long id);

}
