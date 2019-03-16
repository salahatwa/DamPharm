package com.dam.pharm.starter.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dam.pharm.starter.graph.models.Stats;
import com.dam.pharm.starter.graph.models.TopProduct;
import com.dam.pharm.starter.service.StatsService;

//http://localhost:8080/api/stats/top/products
@RestController
@RequestMapping("/api")
@CrossOrigin(value = "http://localhost:4200", allowedHeaders = "*")
// SELECT Name , USER_ID, MIN(STOCK-NUMBER_OF_REMAIN_STOCK) as NUMBER_OF_SELLING
// FROM PRODUCT group by name order by NUMBER_OF_SELLING asc
public class StatsController {

	@Autowired
	private StatsService statsService;

	@GetMapping("/stats")
	public Stats getStats() {
		return new Stats();
	}

	@GetMapping("/stats/{userID}/top/products")
	public List<TopProduct> getTopProducts(@PathVariable String userID) {
		return statsService.getTopSellingProducts(userID);
	}

}
