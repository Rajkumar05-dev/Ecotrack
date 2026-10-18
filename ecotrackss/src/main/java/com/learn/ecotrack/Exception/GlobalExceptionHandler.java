package com.learn.ecotrack.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice// use for global exception handler
public class GlobalExceptionHandler {
 
	
	@ExceptionHandler(exception = NotFoundException.class)
	public ResponseEntity<ApiError> notFoundExecptionHandler(NotFoundException ex,HttpServletRequest request){
		
		ApiError apiError = new ApiError();
		apiError.setError(ex.getClass().getSimpleName());
		apiError.setErrorMessage(ex.getMessage());
		apiError.setPath(request.getRequestURI());
		return new ResponseEntity<ApiError>(apiError,HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ApiError> responseStatusExceptionHandler(
			ResponseStatusException ex, HttpServletRequest request) {
		ApiError apiError = new ApiError();
		apiError.setError(ex.getStatusCode().toString());
		apiError.setErrorMessage(ex.getReason());
		apiError.setPath(request.getRequestURI());
		return ResponseEntity.status(ex.getStatusCode()).body(apiError);
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiError> dataIntegrityViolationHandler(
			DataIntegrityViolationException ex, HttpServletRequest request) {
		ApiError apiError = new ApiError();
		apiError.setError(HttpStatus.CONFLICT.getReasonPhrase());
		apiError.setErrorMessage("The submitted information conflicts with an existing record.");
		apiError.setPath(request.getRequestURI());
		return ResponseEntity.status(HttpStatus.CONFLICT).body(apiError);
	}
	
}
