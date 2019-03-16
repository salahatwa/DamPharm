package com.dam.pharm.starter.service;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.Query;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dam.pharm.starter.entities.User;
import com.dam.pharm.starter.graph.models.TopProduct;
import com.dam.pharm.starter.repository.ProductRepository;

/**
 * @author atwa Jul 22, 2018
 */
@Service
public class StatsServiceImpl implements StatsService {

	private Logger LOGGER = LoggerFactory.getLogger(StatsServiceImpl.class);

	@Autowired
	private ProductRepository productRepository;

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.dam.pharm.starter.service.StatsService#getTopSellingProducts()
	 */
	@Override
	public List<TopProduct> getTopSellingProducts(String userID) {


		List<TopProduct> products = productRepository.getTopSellingProducts(userID);

		LOGGER.info(">>>>>>>> Top Products Number:{}", products.size());
		return products;
	}

}
