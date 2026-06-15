package com.learn.ecotrack.Controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.learn.ecotrack.Dtos.RecycleRequestDto;
import com.learn.ecotrack.Services.FileService;
import com.learn.ecotrack.Services.RecycleRequestService;

@RestController
@RequestMapping("/request")
public class RecycleRequestController {
@Autowired
	private RecycleRequestService recycleRequestService;
@Autowired
private FileService fileService;
@Value("${request.images}")
private String image;
	
@PostMapping("/{userId}")
	public ResponseEntity<RecycleRequestDto> addRequest( @PathVariable String userId, @RequestBody RecycleRequestDto recycleRequestDto){
		
		return new ResponseEntity<RecycleRequestDto>(recycleRequestService.addRequest(recycleRequestDto, userId),HttpStatus.CREATED);
		
	}

@GetMapping("/user/{userId}")
public ResponseEntity<java.util.List<RecycleRequestDto>> getRequestsByUser(@PathVariable String userId){
    return new ResponseEntity<java.util.List<RecycleRequestDto>>(recycleRequestService.getRequestsByUser(userId), HttpStatus.OK);
}

@GetMapping
public ResponseEntity<java.util.List<RecycleRequestDto>> getAllRequests(){
	return new ResponseEntity<java.util.List<RecycleRequestDto>>(recycleRequestService.getAllRequests(), HttpStatus.OK);
}
@PutMapping("/reject/{id}")
public ResponseEntity<RecycleRequestDto> rejectRequest(@PathVariable int id,@RequestParam String reason){
	return new ResponseEntity<RecycleRequestDto>(recycleRequestService.rejectRequest(id, reason),HttpStatus.OK);
}

@PutMapping("/approve/{id}")
public ResponseEntity< RecycleRequestDto> approvedRequest(@PathVariable int id){
	return new ResponseEntity<RecycleRequestDto>(recycleRequestService.approvedRequest(id),HttpStatus.OK);
}

@DeleteMapping("/{id}")
public ResponseEntity<Map<String,String>> deleteRequest(@PathVariable int id){
	recycleRequestService.deleteRequest(id);
	Map<String,String> response = new HashMap<String, String>();
	response.put("Message", id + "-request deleted");
	return ResponseEntity.ok(response);
}

@PostMapping("upload-image/{id}") 
public ResponseEntity<Map<String,String>> uploadImage(@PathVariable int id, @RequestParam("requestImage")MultipartFile file) throws IOException{
	String imageName = fileService.uploadfile(file, image);
	String imageUploaded = recycleRequestService.setRequestImage(imageName, id);
	Map<String,String>  response=new HashMap<String, String>();
	response.put("imageName", imageUploaded);
	response.put("Message","Image upload successfully");
	return new ResponseEntity<Map<String,String>>(response,HttpStatus.OK);
	
}

@GetMapping("/image/{imageName:.+}")
public ResponseEntity<byte[]> getRequestImage(@PathVariable String imageName) throws IOException {
	Path imagePath = Path.of(image, imageName);
	if (!Files.exists(imagePath)) {
		imagePath = Path.of("{request.images}", imageName);
	}
	if (!Files.exists(imagePath)) {
		imagePath = Path.of("{request.images}" + imageName);
	}

	if (!Files.exists(imagePath)) {
		return ResponseEntity.notFound().build();
	}

	String contentType = Files.probeContentType(imagePath);
	if (contentType == null) {
		contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
	}

	return ResponseEntity.ok()
			.contentType(MediaType.parseMediaType(contentType))
			.body(Files.readAllBytes(imagePath));
}
}
