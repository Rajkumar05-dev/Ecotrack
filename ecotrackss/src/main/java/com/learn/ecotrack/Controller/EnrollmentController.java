package com.learn.ecotrack.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learn.ecotrack.Dtos.EnrollmentsDto;
import com.learn.ecotrack.Services.EnrollmentService;
import com.learn.ecotrack.Services.RazorpayService;
import com.learn.ecotrack.Services.UserService;
import com.learn.ecotrack.Services.WorkShopService;
import com.razorpay.RazorpayException;


@RestController
@RequestMapping("/enroll")
@CrossOrigin
public class EnrollmentController {

	@Autowired
	private WorkShopService workShopService;
	
	@Autowired
	private RazorpayService razorpayService;
	
	@Autowired
	private UserService userService;
	@Autowired
	private EnrollmentService  enrollmentService;
	
	@PostMapping("/{userId}/enroll/{workShopId}")
	public ResponseEntity<EnrollmentsDto> addenroll( @PathVariable String userId, @PathVariable  int workShopId){
		return ResponseEntity.ok(enrollmentService.enroll(userId,workShopId));
	}

	@GetMapping("/user/{userId}")
	public ResponseEntity<List<EnrollmentsDto>> getUserEnrollments(@PathVariable String userId) {
		return ResponseEntity.ok(enrollmentService.getUserEnrollments(userId));
	}

	@PostMapping("/confirm")
	public ResponseEntity<String> confirmEnrollment(@RequestBody Map<String, String> payload)  throws RazorpayException {
		if (payload == null) {
			return ResponseEntity.badRequest().body("Payment verification details are required");
		}

		String orderId = payload.get("razorpayOrderId");
		String paymentId = payload.get("razorpayPaymentId");
		String signature = payload.get("razorpaySignature");
		if (orderId == null || orderId.isBlank()
				|| paymentId == null || paymentId.isBlank()
				|| signature == null || signature.isBlank()) {
			return ResponseEntity.badRequest().body("Payment verification details are required");
		}

		boolean verified = razorpayService.verifyPayment(orderId, paymentId, signature);
		
		if(!verified) {
			return ResponseEntity.badRequest().body("Payment verification failed");
		}
		
		enrollmentService.ConfrimPayment(orderId, paymentId);
		return ResponseEntity.ok("Enrollment succesfull");
	}
}
