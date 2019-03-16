package com.dam.pharm.starter.service;

import java.util.List;

import com.dam.pharm.starter.entities.User;
import com.dam.pharm.starter.graph.models.TopProduct;

/**
 * @author atwa
 * Jul 22, 2018
 */
public interface StatsService {

	public List<TopProduct> getTopSellingProducts(String userID);
}
