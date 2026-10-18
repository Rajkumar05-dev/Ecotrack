package com.learn.ecotrack.Dtos;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.learn.ecotrack.Entities.RecycleRequest;
import com.learn.ecotrack.Entities.Role;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

	
	
	private String id;

	private String name;
	
	private  String email;
	
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private String password;
	
	private String phoneNo;
	
	
	private List<RecycleRequest> recycleRequests;
	

	private Role role;
	
}
