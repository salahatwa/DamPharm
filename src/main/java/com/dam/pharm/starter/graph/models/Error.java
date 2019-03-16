package com.dam.pharm.starter.graph.models;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

public class Error {

	private String reason;

	private String message;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy hh:mm:ss")
	private Date Date;

	private String http_status;

	public Error() {
	}

	public Error(String reason, String message) {
		this.reason = reason;
		this.message = message;
	}

	public String getReason() {
		return reason;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public Date getDate() {
		return Date;
	}

	public void setDate(Date date) {
		Date = date;
	}

	public String getHttp_status() {
		return http_status;
	}

	public void setHttp_status(String http_status) {
		this.http_status = http_status;
	}

}
