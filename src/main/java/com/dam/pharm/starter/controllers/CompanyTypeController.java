package com.dam.pharm.starter.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dam.pharm.starter.entities.CompanyType;
import com.dam.pharm.starter.repository.CompanyTypeRepository;


@RestController
@RequestMapping("/api")
@CrossOrigin(value = "http://localhost:4200", allowedHeaders = "*")
public class CompanyTypeController {

	@Autowired
	private CompanyTypeRepository companyTypeRepository;

	@GetMapping("/companies/types")
	private List<CompanyType> getAllCompaniesTypes() {
		return companyTypeRepository.findAll();
	}

	@PutMapping("/companies/types/update")
	private CompanyType updateCompanyType(@RequestBody CompanyType companyType) {
		return companyTypeRepository.save(companyType);
	}

	@PostMapping("/companies/types/add")
	private CompanyType createCompanyType(@RequestBody CompanyType companyType) {
		return companyTypeRepository.save(companyType);
	}

	@DeleteMapping("/companies/types/delete/{id}")
	private void deleteCompanyType(@PathVariable String id) {
		companyTypeRepository.deleteById(id);
	}

}
