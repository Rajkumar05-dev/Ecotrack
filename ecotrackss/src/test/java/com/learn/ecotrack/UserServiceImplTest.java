package com.learn.ecotrack;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;// j   unit testing  

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.learn.ecotrack.Dtos.UserDto;
import com.learn.ecotrack.Entities.Role;
import com.learn.ecotrack.Entities.User;
import com.learn.ecotrack.Enum.AppRole;
import com.learn.ecotrack.Repository.RoleRepository;
import com.learn.ecotrack.Repository.UserRespository;
import com.learn.ecotrack.Services.impl.UserServiceImpl;

@ExtendWith(MockitoExtension.class)
public class UserServiceImplTest {
	@Mock
	private UserRespository userRespository;
	@Mock
	private ModelMapper modelMapper;
	@Mock
	private RoleRepository roleRepository;
	@Mock
	private PasswordEncoder passwordEncoder;
	@InjectMocks
	private UserServiceImpl userService;

	private UserDto userDto;
	private User user;
	private Role role;

	@BeforeEach
	void setUp() {

		userDto = new UserDto();
		userDto.setName("raj");
		userDto.setEmail("raj89@gmail.com");
		userDto.setPassword("User@123");
		userDto.setPhoneNo("9897899878");

		role = new Role();
		role.setAppRole(AppRole.ROLE_USER);

		user = new User();
		user.setEmail(userDto.getEmail());
		user.setPassword("encodedpassword");
		user.setName(userDto.getName());
		userDto.setPhoneNo(userDto.getPhoneNo());

	}

	@Test
	public void registerUserTest() {
		when(userRespository.findByEmail(userDto.getEmail())).thenReturn(Optional.empty());
		when(passwordEncoder.encode("User@123")).thenReturn("encodedpassword");
		when(modelMapper.map(userDto, User.class)).thenReturn(user);
		when(roleRepository.findByAppRole(AppRole.ROLE_USER)).thenReturn(Optional.of(role));
		when(userRespository.save(user)).thenReturn(user);
		when(modelMapper.map(user, UserDto.class)).thenReturn(userDto);
		UserDto savedUser = userService.createUser(userDto);
		assertNotNull(savedUser);
		assertEquals(userDto.getEmail(), savedUser.getEmail());
	}

	@Test
	public void registerUserRoleNotPresent() {
		when(userRespository.findByEmail(userDto.getEmail())).thenReturn(Optional.empty());
		when(passwordEncoder.encode(anyString())).thenReturn("encodedpassword");
		when(modelMapper.map(userDto, User.class)).thenReturn(user);
		when(roleRepository.findByAppRole(AppRole.ROLE_USER)).thenReturn(Optional.empty());
	RuntimeException exception = assertThrows(RuntimeException.class, () -> {
			userService.createUser(userDto);

		});
		assertEquals("Role not found", exception.getMessage());

	}

	@Test
	void registerUserWithExistingEmailReturnsConflict() {
		when(userRespository.findByEmail(userDto.getEmail())).thenReturn(Optional.of(user));

		ResponseStatusException exception = assertThrows(
				ResponseStatusException.class, () -> userService.createUser(userDto));

		assertEquals(409, exception.getStatusCode().value());
		assertEquals("An account with this email already exists. Please log in instead.", exception.getReason());
		verify(userRespository, never()).save(user);
		verify(passwordEncoder, never()).encode(anyString());
	}

}
