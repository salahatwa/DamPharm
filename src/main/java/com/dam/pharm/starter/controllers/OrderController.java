package com.dam.pharm.starter.controllers;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dam.pharm.starter.entities.Order;
import com.dam.pharm.starter.entities.QOrder;
import com.dam.pharm.starter.service.OrderService;

//http://localhost:8080/api/orders/dfe277bb-f0d4-421c-b543-9580df2b42af
@RestController
@RequestMapping("/api")
public class OrderController {
	private static Logger LOGGER = LoggerFactory.getLogger(OrderController.class);

	@Autowired
	private OrderService orderService;

	@GetMapping("/orders")
	// http://localhost:8080/api/orders?filter={"date_range":{"from":null,"to":null},"id":1,"product":null,"customer":null}
	public Iterable<QOrder> getOrders(@RequestParam(name = "filter", required = false) String orderFilter) {
		return orderService.findAll(orderFilter);
	}

	@GetMapping("/orders/{id}")
	public Optional<Order> getOrder(@PathVariable Long id) {
		LOGGER.info("Get Order :{}", id);
		return orderService.findById(id);
	}

	@DeleteMapping("/orders/delete/{id}")
	public void deleteOrder(@PathVariable Long id) {
		LOGGER.info("Delete Order :{}", id);
		orderService.deleteById(id);
	}

	@PostMapping("/orders/add")
	public Order addOrder(@RequestBody Order order) {

		LOGGER.info("Adding Order :{} " + order);

		order = orderService.saveOrder(order);

		return order;
	}
}
