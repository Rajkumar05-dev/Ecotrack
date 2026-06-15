package com.learn.ecotrack.Services;

import com.learn.ecotrack.Dtos.UserDto;

public interface UserService {

	
UserDto	createUser(UserDto userDto);
UserDto	createAdmin(UserDto userDto);
	
}
