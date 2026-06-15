package com.learn.ecotrack.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learn.ecotrack.Dtos.UserDto;
import com.learn.ecotrack.Services.UserService;

@RestController
@RequestMapping("/users")
public class UserController {
	
	@Autowired
	private UserService userService;
	@PostMapping("/register")
 public ResponseEntity<UserDto> register(@RequestBody UserDto userDto ){
	 return new ResponseEntity<UserDto>(userService.createUser(userDto),HttpStatus.CREATED);
 }

	@PostMapping("/register-admin")
 public ResponseEntity<UserDto> registerAdmin(@RequestBody UserDto userDto ){
	 return new ResponseEntity<UserDto>(userService.createAdmin(userDto),HttpStatus.CREATED);
 }
}
