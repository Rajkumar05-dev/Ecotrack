package com.learn.ecotrack.Services.impl;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learn.ecotrack.Services.FileService;

@Service
public class FileserviceImple implements FileService {

	@Override
	public String uploadfile(MultipartFile multipartFile, String path) throws IOException {
		
		String originalFilename = multipartFile.getOriginalFilename();
		String fileName = UUID.randomUUID().toString();
		String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
		 String newName=fileName+extension;
		 if(extension.equalsIgnoreCase(".png")||extension.equalsIgnoreCase(".jpeg")||extension.equalsIgnoreCase(".jpg")) {
			 File folder = new File(path);
			 if(!folder.exists()) {
				 folder.mkdirs();
			 }
			 Files.copy(multipartFile.getInputStream(), Paths.get(path, newName));
			 
		 }else {
			 throw new RuntimeException("file  with"+extension+"is not allowed ");
		 }
		return newName;
	}

	@Override
	public InputStream getResource(String path, String name) throws FileNotFoundException {
		InputStream inputStream = new FileInputStream(Paths.get(path, name).toFile());
		return inputStream;
	}

}
