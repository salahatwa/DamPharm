package com.dam.pharm.starter.utils;

import java.lang.reflect.Field;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.dam.pharm.starter.filters.DateRange;
import com.dam.pharm.starter.filters.config.CustomPredicatesBuilder;
import com.querydsl.core.types.dsl.BooleanExpression;

@Component
public class QueryBuilder {
	private static Logger logger = LoggerFactory.getLogger(QueryBuilder.class);

	public <T> BooleanExpression build(String json, Class<T> clazz, String condition) {
		logger.info("Building Generic Filiter Query For :{}", json);
		T filter = (T) JsonUtil.convertTextToObject(json, clazz);

		CustomPredicatesBuilder builder = new CustomPredicatesBuilder();

		if (GeneralUtil.isValidObject(filter))
			builder = addConditions(filter, builder);

		BooleanExpression exp = builder.build(clazz, condition);

		logger.info("Query for Filter {} , >>>{}", clazz.getSimpleName(), exp);
		return exp;

	}

	public CustomPredicatesBuilder addConditions(Object object, CustomPredicatesBuilder builder) {
		Class<?> c = object.getClass();
		Field[] fields = c.getDeclaredFields();

		System.out.println("Num Of Fields:" + fields.length);
		for (Field field : fields) {
			try {
				field.setAccessible(true);
				if (GeneralUtil.isValidObject(field) && GeneralUtil.isValidObject(field.get(object))
						&& GeneralUtil.isValidText(field.get(object).toString())) {
					builder.with(field.getType(), field.getName().toString(), ":", field.get(object));
				}
			} catch (IllegalArgumentException e1) {
				e1.printStackTrace();
			} catch (IllegalAccessException e1) {
				e1.printStackTrace();
			}
		}
		Field[] superClassFileds = object.getClass().getSuperclass().getDeclaredFields();

		for (Field field : superClassFileds) {
			try {
				field.setAccessible(true);
				if (GeneralUtil.isValidObject(field) && GeneralUtil.isValidObject(field.get(object))
						&& GeneralUtil.isValidText(field.get(object).toString())) {
					builder.with(field.getType(), field.getName().toString(), "::", field.get(object));
				}
			} catch (IllegalArgumentException e1) {
				e1.printStackTrace();
			} catch (IllegalAccessException e1) {
				e1.printStackTrace();
			}
		}

		return builder;
	}

}
