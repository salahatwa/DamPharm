package com.dam.pharm.starter.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.data.querydsl.binding.SingleValueBinding;

import com.dam.pharm.starter.entities.Customer;
import com.dam.pharm.starter.entities.QCustomer;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.core.types.dsl.StringPath;

public interface CustomerRepository extends JpaRepository<Customer, String>, QuerydslPredicateExecutor<QCustomer>,
		QuerydslBinderCustomizer<QCustomer> {
	@Override
	default public void customize(QuerydslBindings bindings, QCustomer root) {
		bindings.bind(String.class)
				.first((SingleValueBinding<StringPath, String>) StringExpression::containsIgnoreCase);
	}


}
