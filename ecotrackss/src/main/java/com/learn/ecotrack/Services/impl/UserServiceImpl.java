package com.learn.ecotrack.Services.impl;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.learn.ecotrack.Dtos.UserDto;
import com.learn.ecotrack.Entities.Role;
import com.learn.ecotrack.Entities.User;
import com.learn.ecotrack.Enum.AppRole;
import com.learn.ecotrack.Exception.NotFoundException;
import com.learn.ecotrack.Repository.RoleRepository;
import com.learn.ecotrack.Repository.UserRespository;
import com.learn.ecotrack.Services.UserService;

@Service
public class UserServiceImpl implements UserService {
	@Autowired
	private ModelMapper modelMapper;

	@Autowired
	private UserRespository userRespository;
	@Autowired
	private RoleRepository roleRepository;
	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	public UserDto createUser(UserDto userDto) {

		userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));
		User user = modelMapper.map(userDto, User.class);

		// ✅ PASSWORD ENCODE HERE

		Role role = roleRepository.findByAppRole(AppRole.ROLE_USER)
				.orElseThrow(() -> new NotFoundException("Role not found"));
		user.setRole(role);
		User savedUser = userRespository.save(user);
		UserDto savedDto = modelMapper.map(savedUser, UserDto.class);

		return savedDto;
	}

	@Override
	public UserDto createAdmin(UserDto userDto) {
		userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));
		User user = modelMapper.map(userDto, User.class);

		Role role = roleRepository.findByAppRole(AppRole.ROLE_ADMIN)
				.orElseThrow(() -> new NotFoundException("Role not found"));
		user.setRole(role);
		User savedUser = userRespository.save(user);

		return modelMapper.map(savedUser, UserDto.class);
	}

}
