package com.dam.pharm.starter.filters.config;

import java.util.Date;

import com.dam.pharm.starter.entities.Customer;
import com.dam.pharm.starter.filters.DateRange;
import com.dam.pharm.starter.utils.GeneralUtil;
import com.querydsl.core.types.dsl.BeanPath;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.DateTimePath;
import com.querydsl.core.types.dsl.NumberPath;
import com.querydsl.core.types.dsl.PathBuilder;
import com.querydsl.core.types.dsl.StringPath;

public class CustomPredicate {
	private SearchCriteria criteria;

	public CustomPredicate(SearchCriteria criteria) {
		this.criteria = criteria;
	}

	public <T> BooleanExpression getPredicate(Class<T> clazz, String condition) {
		PathBuilder<T> entityPath = new PathBuilder<>(clazz, condition);

		if (criteria.getKeyType().equals(Integer.class)) {
			NumberPath<Integer> path = entityPath.getNumber(criteria.getKey(), Integer.class);
			int value = Integer.parseInt(criteria.getValue().toString());
			switch (criteria.getOperation()) {
			case ":":
				return path.eq(value);
			case ">":
				return path.goe(value);
			case "<":
				return path.loe(value);
			}
		} else if (criteria.getKeyType().equals(Long.class)) {
			NumberPath<Long> path = entityPath.getNumber(criteria.getKey(), Long.class);
			Long value = Long.parseLong(criteria.getValue().toString());
			switch (criteria.getOperation()) {
			case ":":
				return path.eq(value);
			case ">":
				return path.goe(value);
			case "<":
				return path.loe(value);
			}
		} else if (criteria.getKeyType().equals(DateRange.class)) {
			DateTimePath<Date> path = entityPath.getDateTime(criteria.getKey(), Date.class);
			DateRange value = (DateRange) criteria.getValue();
			switch (criteria.getOperation()) {
			case "::": {
				if (GeneralUtil.isValidText(value.getFrom()))
					return path.between(GeneralUtil.convertToDate(value.getFrom(), "MM/dd/yyyy"),
							GeneralUtil.convertToDate(value.getTo(), "MM/dd/yyyy"));
			}

			}
		} else if (criteria.getKeyType().equals(String.class)) {
			StringPath path = entityPath.getString(criteria.getKey());
			if (criteria.getOperation().equalsIgnoreCase(":")) {
				return path.eq(criteria.getValue().toString());
			}
		} 
		else
		{
			System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>"+criteria.getKey()+"[][]"+criteria.getValue().toString());
			BeanPath<Object> path = entityPath.get(criteria.getKey());
			if (criteria.getOperation().equalsIgnoreCase(":")) {
				return path.eq(criteria.getValue());
			}
		}
		
//		else if (criteria.getKeyType().equals(Object.class)) {
//			StringPath path = entityPath.getString(criteria.getKey());
//			if (criteria.getOperation().equalsIgnoreCase(":")) {
//				return path.eq(criteria.getValue().toString());
//			}
//		}
		return null;
	}

}
