package com.learn.ecotrack;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learn.ecotrack.Dtos.UserDto;
import com.learn.ecotrack.Entities.User;

class UserSerializationTest {
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Test
	void userDtoAcceptsPasswordInputButNeverSerializesIt() {
		assertWriteOnlyPassword(UserDto.class);
	}

	@Test
	void userEntityNeverSerializesPassword() {
		assertWriteOnlyPassword(User.class);
	}

	private void assertWriteOnlyPassword(Class<?> type) {
		var jacksonType = objectMapper.constructType(type);
		var serializedPassword = objectMapper.getSerializationConfig()
				.introspect(jacksonType)
				.findProperties()
				.stream()
				.filter(property -> property.getName().equals("password"))
				.findFirst()
				.orElseThrow();
		var deserializedPassword = objectMapper.getDeserializationConfig()
				.introspect(jacksonType)
				.findProperties()
				.stream()
				.filter(property -> property.getName().equals("password"))
				.findFirst()
				.orElseThrow();

		assertFalse(serializedPassword.couldSerialize());
		assertTrue(deserializedPassword.couldDeserialize());
	}
}
