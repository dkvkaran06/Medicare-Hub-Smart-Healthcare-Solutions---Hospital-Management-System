package com.hospitalmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hospitalmanagement.entity.Bill;
import com.hospitalmanagement.entity.PaymentStatus;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByPaymentStatus(PaymentStatus paymentStatus);

    List<Bill> findByPatientId(Long patientId);
}
