package com.dam.pharm.starter.filters.config;

import java.util.ArrayList;
import java.util.List;

import com.querydsl.core.types.dsl.BooleanExpression;

public class CustomPredicatesBuilder {

	private List<SearchCriteria> params = new ArrayList<>();

	public CustomPredicatesBuilder with(Class<?> keyType, String key, String operation, Object value) {

		params.add(new SearchCriteria(keyType, key, operation, value));
		return this;
	}

	public BooleanExpression build(Class clazz, String condition) {
		if (params.size() == 0) {
			return null;
		}

		List<BooleanExpression> predicates = new ArrayList<>();
		CustomPredicate predicate;
		for (SearchCriteria param : params) {
			predicate = new CustomPredicate(param);
			BooleanExpression exp = predicate.getPredicate(clazz, condition);
			if (exp != null) {
				predicates.add(exp);
			}
		}

		BooleanExpression result = null;
		if (!predicates.isEmpty()) {
			result = predicates.get(0);
			for (int i = 1; i < predicates.size(); i++) {
				result = result.and(predicates.get(i));
			}
		}
		return result;
	}
}
