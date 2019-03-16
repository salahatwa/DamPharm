package com.dam.pharm.starter.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dam.pharm.starter.entities.Company;
import com.dam.pharm.starter.repository.CompanyRepository;


@RestController
@RequestMapping("/api")
public class CompanyController {

	@Autowired
	private CompanyRepository companyRepository;

	@GetMapping("/companies")
	private List<Company> getAllCompanies() {
		return companyRepository.findAll();
	}

	@PutMapping("/companies/update")
	private Company updateCompany(@RequestBody Company company) {
		return companyRepository.save(company);
	}

	@PostMapping("/companies/add")
	private Company createCompany(@RequestBody Company company) {
		return companyRepository.save(company);
	}

	@DeleteMapping("/companies/delete/{id}")
	private void deleteCompany(@PathVariable String id) {
		companyRepository.deleteById(id);
	}
}
