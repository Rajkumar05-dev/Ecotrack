package com.learn.ecotrack.Services;

import com.learn.ecotrack.Dtos.RecycleRequestDto;

public interface RecycleRequestService {

	
	RecycleRequestDto addRequest(RecycleRequestDto recycleRequestDto , String userId);

	java.util.List<com.learn.ecotrack.Dtos.RecycleRequestDto> getAllRequests();
	java.util.List<com.learn.ecotrack.Dtos.RecycleRequestDto> getRequestsByUser(String userId);
	RecycleRequestDto rejectRequest(int requestId,String reason);
	RecycleRequestDto  approvedRequest(int requestId);
	void deleteRequest(int requestId);
	 String setRequestImage(String image,int id);
}
