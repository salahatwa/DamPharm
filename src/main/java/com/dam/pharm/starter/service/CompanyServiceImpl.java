package com.dam.pharm.starter.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dam.pharm.starter.entities.Company;
import com.dam.pharm.starter.repository.CompanyRepository;

/**
 * @author atwa Jul 22, 2018
 */
@Service
public class CompanyServiceImpl implements CompanyService {

	private Logger LOGGER = LoggerFactory.getLogger(CompanyServiceImpl.class);

	@Autowired
	private CompanyRepository companyRepository;

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.dam.pharm.starter.service.CompanyService#saveUser(com.dam.pharm.starter.
	 * entities.User)
	 */
	@Override
	public Company saveCompany(Company company) {

		LOGGER.info(">> save company :{}", company);
		Company comp = companyRepository.save(company);
		LOGGER.info(">> saved company :{}", comp);
		return comp;
	}

}
