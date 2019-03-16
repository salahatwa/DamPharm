package com.dam.pharm.starter.service;

import java.util.List;
import java.util.Optional;

import javax.persistence.EntityManager;
import javax.persistence.Query;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dam.pharm.starter.entities.Customer;
import com.dam.pharm.starter.entities.Product;
import com.dam.pharm.starter.entities.QProduct;
import com.dam.pharm.starter.filters.ProductFilter;
import com.dam.pharm.starter.repository.ProductRepository;
import com.dam.pharm.starter.utils.QueryBuilder;

@Service
public class ProductServiceImpl implements ProductService {

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private QueryBuilder queryBuilder;

	@Autowired
	private EntityManager entityManager;

	@Override
	public Iterable<QProduct> getProducts(String productFilter) {
		return productRepository.findAll(queryBuilder.build(productFilter, ProductFilter.class, "product"));
	}

	@Override
	public Optional<Product> getProduct(String id) {
		LOGGER.info("Get Product :{}", id);
		return productRepository.findById(id);
	}

	@Override
	public void deleteProduct(String id) {
		LOGGER.info("Delete Product :{}", id);
		productRepository.deleteById(id);
	}

	@Override
	public Product updateProduct(Product product) {
		LOGGER.info("Update Product : {} ", product);

		product = productRepository.save(product);
		return product;
	}

	@Override
	public Product addProduct(Product product) {
		LOGGER.info("Adding Product :{} " + product);

		product = productRepository.save(product);
		return product;
	}

	@Override
	public List<Customer> getCustomersBoughtProduct(String productID) {
		String sqlQuery = "select * from DAM_CUSTOMER  where ID in (select DISTINCT(CUSTOMER_ID)  from DAM_ORDER INNER JOIN DAM_PRODUCT_DETAIL where DAM_PRODUCT_DETAIL.ORDER_ID =DAM_ORDER.ID and PRODUCT_ID = :productID)";
		Query query = entityManager.createNativeQuery(sqlQuery, Customer.class);
		query.setParameter("productID", productID);

		List<Customer> customers = query.getResultList();

		return customers;
	}

}
