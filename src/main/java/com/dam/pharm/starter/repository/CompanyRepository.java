package com.dam.pharm.starter.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dam.pharm.starter.entities.Company;



public interface CompanyRepository extends JpaRepository<Company, String> {

}
