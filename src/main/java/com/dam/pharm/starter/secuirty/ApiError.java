package com.dam.pharm.starter.secuirty;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpStatus;

/**
 * API ERROR MESSAGE
 * @author salah
 *
 */
public class ApiError {
    
    private HttpStatus status;
    private String message;
    private List<String> errors;
    
    public ApiError(HttpStatus status, String message, List<String> errors) {
        super();
        this.status = status;
        this.message = message;
        this.errors = errors;
    }
    
    public ApiError(HttpStatus status, String message, String error) {
        super();
        this.status = status;
        this.message = message;
        this.errors = Arrays.asList(error);
    }
    
    public ApiError() {}

    public HttpStatus getStatus() {
        return status;
    }

    public void setStatus(HttpStatus status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }   
    
}
