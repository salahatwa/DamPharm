package com.dam.pharm.starter.filters;

public class BaseFilter extends PageParam{
	private DateRange created_at;

	public DateRange getCreated_at() {
		return created_at;
	}

	public void setCreated_at(DateRange created_at) {
		this.created_at = created_at;
	}

}