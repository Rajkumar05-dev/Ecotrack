package com.learn.ecotrack.Controller;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learn.ecotrack.Dtos.UserDto;
import com.learn.ecotrack.Entities.User;
import com.learn.ecotrack.Security.LoginRequest;
import com.learn.ecotrack.Security.LoginResponse;
import com.learn.ecotrack.Security.jwt.JwtUtils;



@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {
	
	@Autowired
	private AuthenticationManager authenticationManager;
	
	@Autowired
	private JwtUtils jwtUtils;
	
	@Autowired
	private ModelMapper modelMapper;
	
	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest)
	{
		String email = loginRequest.getEmail();
		String password = loginRequest.getPassword();
		
		Authentication authenticate=null;
		
		try
		{
		   authenticate = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
		}
		catch(BadCredentialsException badCredentialsException)
		{
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		
		
		 SecurityContextHolder.getContext().setAuthentication(authenticate);
		 
		 User user= (User) authenticate.getPrincipal();
		 
		 String token = jwtUtils.generateTokenFromUsername(user);
		 
		 LoginResponse loginResponse = new LoginResponse();
		 
		 loginResponse.setToken(token);
		 
		 UserDto userDto = modelMapper.map(user, UserDto.class);
		 
		 loginResponse.setUserDto(userDto);
		 
	
		return new ResponseEntity<LoginResponse>(loginResponse,HttpStatus.OK);
	}
	
	

}


