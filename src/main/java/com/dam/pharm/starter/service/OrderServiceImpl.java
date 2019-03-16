package com.dam.pharm.starter.service;

import java.util.Date;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dam.pharm.starter.entities.Order;
import com.dam.pharm.starter.entities.Product;
import com.dam.pharm.starter.entities.ProductDetail;
import com.dam.pharm.starter.entities.QOrder;
import com.dam.pharm.starter.filters.OrderFilter;
import com.dam.pharm.starter.repository.OrderRepository;
import com.dam.pharm.starter.utils.QueryBuilder;

/**
 * @author atwa Jul 22, 2018
 */
@Service
public class OrderServiceImpl implements OrderService {

	@Autowired
	private OrderRepository orderRepository;

	@Autowired
	private QueryBuilder queryBuilder;

	@Autowired
	private ProductService productService;

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.dam.pharm.starter.service.OrderService#saveOrder(com.dam.pharm.starter.
	 * entities.Order)
	 */
	@Override
	public Order saveOrder(Order order) {

		order.setCreated_at(new Date());

		for (int i = 0; i < order.getProductDetails().size(); i++) {

			order.getProductDetails().set(i, updateProductStock(order.getProductDetails().get(i)));
		}

		order = orderRepository.save(order);
		return order;
	}

	/**
	 * this method to subtract actual number of stock product from amount
	 * this amount from product details 
	 * to check if user still have any number of this product in his store
	 * @param detail
	 * @return
	 */
	private ProductDetail updateProductStock(ProductDetail detail) {
		Product product = detail.getProduct();
		product.setNumberOfRemainStock(product.getStock() - detail.getAmount());
		product = productService.updateProduct(product);
		detail.setProduct(product);
		return detail;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.dam.pharm.starter.service.OrderService#findAll(com.querydsl.core.types.
	 * Predicate)
	 */
	@Override
	public Iterable<QOrder> findAll(String orderFilter) {

		return orderRepository.findAll(queryBuilder.build(orderFilter, OrderFilter.class, "order1"));
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.dam.pharm.starter.service.OrderService#findById(long)
	 */
	@Override
	public Optional<Order> findById(long id) {

		return orderRepository.findById(id);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.dam.pharm.starter.service.OrderService#deleteById(long)
	 */
	@Override
	public void deleteById(long id) {
		orderRepository.deleteById(id);

	}

}
