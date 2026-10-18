package com.learn.ecotrack.Services.impl;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.learn.ecotrack.Dtos.EnrollmentsDto;
import com.learn.ecotrack.Entities.Enrollments;
import com.learn.ecotrack.Entities.User;
import com.learn.ecotrack.Entities.WorkShop;
import com.learn.ecotrack.Enum.PaymentStatus;
import com.learn.ecotrack.Exception.NotFoundException;
import com.learn.ecotrack.Repository.EnrollmentRepository;
import com.learn.ecotrack.Repository.UserRespository;
import com.learn.ecotrack.Repository.WorkShopRespository;
import com.learn.ecotrack.Services.EmailService;
import com.learn.ecotrack.Services.EnrollmentService;
import com.learn.ecotrack.Services.RazorpayService;
import com.razorpay.Order;
import com.razorpay.RazorpayException;

@Service
public class EnrollmentsServiceImpl  implements EnrollmentService{
	@Autowired 
	
 private EnrollmentRepository enrollmentRepository;
	@Autowired
	private UserRespository userRespository;
	@Autowired
	private WorkShopRespository workShopRespository;
	@Autowired 
	private ModelMapper modelMapper;
	@Autowired
	private EmailService emailService; 
	@Autowired
	private RazorpayService razorpayService;
	@Override
	public EnrollmentsDto enroll(String userId, int workShopId) {
	User user = userRespository.findById(userId).orElseThrow(()-> new NotFoundException("User  Not found"));
	WorkShop  workshop = workShopRespository.findById(workShopId).orElseThrow(()-> new NotFoundException("Workshop   not found"));

	Optional<Enrollments> existingEnrollment =
			enrollmentRepository.findByUserIdAndWorkShopId(userId, workShopId);
	if (existingEnrollment.isPresent()) {
		Enrollments existing = existingEnrollment.get();
		if (existing.getPaymentStatus() == PaymentStatus.SUCCESS) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "You are already enrolled in this workshop");
		}
		if (existing.getPaymentStatus() == PaymentStatus.CREATED
				&& existing.getRazorpayOrderId() != null
				&& !existing.getRazorpayOrderId().isBlank()) {
			return modelMapper.map(existing, EnrollmentsDto.class);
		}
	}
	
	Order order;
	try {
		order = razorpayService.createOrder(workshop.getPrice());
	} catch (RazorpayException e) {
		throw new RuntimeException("Unable to create razorpay order", e);
	}
	
	
	
	Enrollments enrollments = existingEnrollment.orElseGet(Enrollments::new);
	enrollments.setUser(user);
	enrollments.setWorkShop(workshop);
	enrollments.setAmount(workshop.getPrice());
	enrollments.setPaymentStatus(PaymentStatus.CREATED);
	enrollments.setRazorpayOrderId(order.get("id"));
	
	
	Enrollments savedEnrollment = enrollmentRepository.save(enrollments);
		return modelMapper.map(savedEnrollment, EnrollmentsDto.class);
	}
	@Override
	public void ConfrimPayment(String orderId, String paymentId) {
		Enrollments enrollment = enrollmentRepository.findByRazorpayOrderId(orderId).orElseThrow(() -> new NotFoundException("Enrollment Not Found"));
		if (enrollment.getPaymentStatus() == PaymentStatus.SUCCESS) {
			return;
		}
		enrollment.setRazorpayPaymentId(paymentId);
		enrollment.setPaymentStatus(PaymentStatus.SUCCESS);
		
		Enrollments confirmedEnrollment = enrollmentRepository.save(enrollment);
		emailService.sendEmail(
				confirmedEnrollment.getUser().getEmail(),
				"Workshop enrollment confirmed",
				"Your payment is confirmed for " + confirmedEnrollment.getWorkShop().getName() + ".");
		
	}

	@Override
	public List<EnrollmentsDto> getUserEnrollments(String userId) {
		return enrollmentRepository.findByUserIdOrderByEnrolledAtDesc(userId)
				.stream()
				.map(enrollment -> modelMapper.map(enrollment, EnrollmentsDto.class))
				.collect(Collectors.toList());
	}

}
