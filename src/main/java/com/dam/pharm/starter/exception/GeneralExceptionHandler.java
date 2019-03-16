package com.dam.pharm.starter.exception;

import java.util.Date;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.dam.pharm.starter.graph.models.Error;

//@Order(Ordered.HIGHEST_PRECEDENCE)
@ControllerAdvice
//@RestControllerAdvice
//extends ResponseEntityExceptionHandler
public class GeneralExceptionHandler extends ResponseEntityExceptionHandler{

//	@ResponseStatus(value = HttpStatus.BAD_REQUEST)
//	@ExceptionHandler(value=GeneralException.class)
	public ResponseEntity<Error> handleConflict(HttpServletRequest req,RuntimeException ex) {
		Error error = new Error();
		error.setMessage(ex.getMessage());
		error.setReason(ex.getCause().getMessage());
		error.setDate(new Date());
		
		System.out.println("$$$$$$$$$$$$:#################");

		return new ResponseEntity<Error>(error, HttpStatus.BAD_REQUEST);
	}

	
	@ExceptionHandler(value = { GeneralException.class })
	protected ResponseEntity<Object> handleUncaughtException(Exception ex, WebRequest request) {

	  String message = "Something bad happened";

	  return handleExceptionInternal(ex, message, new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
	}
}
