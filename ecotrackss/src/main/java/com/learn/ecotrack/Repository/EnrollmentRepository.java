package com.learn.ecotrack.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learn.ecotrack.Entities.Enrollments;
import java.util.List;
import java.util.Optional;


public interface EnrollmentRepository extends JpaRepository<Enrollments, Integer> {
  Optional<Enrollments> findByUserIdAndWorkShopId(String userId, int workShopId);
  Optional<Enrollments> findByRazorpayOrderId(String razorpayOrderId);
  List<Enrollments> findByUserIdOrderByEnrolledAtDesc(String userId);
}
