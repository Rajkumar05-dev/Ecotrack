package com.learn.ecotrack;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learn.ecotrack.Dtos.WorkShopDto;

import jakarta.transaction.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class WorkShopControllerTest {
	@Autowired
	private MockMvc mockMvc;

	private ObjectMapper objectMapper = new ObjectMapper();

	@Test
	void testGetAllWorkShops() throws Exception {
		mockMvc.perform(get("/workshops")).andExpect(status().isOk());
	}

	@Test
	void paymentConfirmationCanReachSignatureValidationWithoutLogin() throws Exception {
		mockMvc.perform(post("/enroll/confirm")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{}"))
				.andExpect(status().isBadRequest());
	}

	@Test
	@WithMockUser(username = "user", password = "password", roles = { "ADMIN" })
	void testCreateWorkShop() throws Exception {
		WorkShopDto workShopDto = new WorkShopDto();
		workShopDto.setName("demo workshop");
		workShopDto.setDescription("demo workshops");
		workShopDto.setPrice(2000);
		workShopDto.setDuration(3);
		String response = mockMvc.perform(post("/workshops").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(workShopDto))).andExpect(status().isCreated()).andReturn()
				.getResponse().getContentAsString();
		WorkShopDto saved = objectMapper.readValue(response, WorkShopDto.class);
		mockMvc.perform(get("/workshops/{id}",saved.getId())).andExpect(jsonPath("$.name").value("demo workshop"));
	}
}
