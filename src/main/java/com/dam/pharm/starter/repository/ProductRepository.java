package com.dam.pharm.starter.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;

import com.dam.pharm.starter.entities.Product;
import com.dam.pharm.starter.entities.QProduct;
import com.dam.pharm.starter.graph.models.TopProduct;

public interface ProductRepository extends JpaRepository<Product, String>, QuerydslPredicateExecutor<QProduct>,
		QuerydslBinderCustomizer<QProduct> {
	@Override
	default public void customize(QuerydslBindings bindings, QProduct root) {
	}
	
	@Query(nativeQuery=true,value="SELECT Name , STOCK  , NUMBER_OF_REMAIN_STOCK as orders , USER_ID, MIN(STOCK-NUMBER_OF_REMAIN_STOCK)  as sold FROM PRODUCT where USER_ID = ?1 group by USER_ID order by sold asc")
	public List<TopProduct> getTopSellingProducts(String userID);

}
