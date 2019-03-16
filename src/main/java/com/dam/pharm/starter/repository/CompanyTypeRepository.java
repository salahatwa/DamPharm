package com.dam.pharm.starter.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dam.pharm.starter.entities.CompanyType;


public interface CompanyTypeRepository extends JpaRepository<CompanyType, String> {

}
