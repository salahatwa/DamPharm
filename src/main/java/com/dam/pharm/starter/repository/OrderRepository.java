package com.dam.pharm.starter.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.data.querydsl.binding.SingleValueBinding;

import com.dam.pharm.starter.entities.Order;
import com.dam.pharm.starter.entities.QOrder;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.core.types.dsl.StringPath;

public interface OrderRepository
		extends JpaRepository<Order, Long>, QuerydslPredicateExecutor<QOrder>, QuerydslBinderCustomizer<QOrder> {
	@Override
	default public void customize(QuerydslBindings bindings, QOrder root) {
		bindings.bind(String.class)
				.first((SingleValueBinding<StringPath, String>) StringExpression::containsIgnoreCase);
		// bindings.excluding(root.email);
	}
	
}
