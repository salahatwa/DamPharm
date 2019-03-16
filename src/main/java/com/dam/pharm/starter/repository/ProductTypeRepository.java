package com.dam.pharm.starter.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dam.pharm.starter.entities.ProductType;


public interface ProductTypeRepository extends JpaRepository<ProductType, String> {

}
