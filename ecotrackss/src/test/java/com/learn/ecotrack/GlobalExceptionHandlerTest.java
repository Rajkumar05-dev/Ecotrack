package com.learn.ecotrack;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import com.learn.ecotrack.Exception.ApiError;
import com.learn.ecotrack.Exception.GlobalExceptionHandler;

class GlobalExceptionHandlerTest {

	@Test
	void responseStatusExceptionPreservesStatusAndReason() {
		GlobalExceptionHandler handler = new GlobalExceptionHandler();
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/enroll/user/enroll/1");

		ResponseEntity<ApiError> response = handler.responseStatusExceptionHandler(
				new ResponseStatusException(HttpStatus.CONFLICT, "You are already enrolled in this workshop"),
				request);

		assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
		assertEquals("You are already enrolled in this workshop", response.getBody().getErrorMessage());
		assertEquals("/enroll/user/enroll/1", response.getBody().getPath());
	}

	@Test
	void dataIntegrityViolationReturnsSafeConflictResponse() {
		GlobalExceptionHandler handler = new GlobalExceptionHandler();
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/users/register");

		ResponseEntity<ApiError> response = handler.dataIntegrityViolationHandler(
				new DataIntegrityViolationException("duplicate email"), request);

		assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
		assertEquals("The submitted information conflicts with an existing record.",
				response.getBody().getErrorMessage());
		assertEquals("/users/register", response.getBody().getPath());
	}
}
