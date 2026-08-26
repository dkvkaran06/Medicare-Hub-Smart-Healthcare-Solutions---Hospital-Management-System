package com.hospitalmanagement.controller;

import java.util.List;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hospitalmanagement.dto.BillDTO;
import com.hospitalmanagement.entity.Bill;
import com.hospitalmanagement.security.SecurityUtils;
import com.hospitalmanagement.service.AppointmentService;
import com.hospitalmanagement.service.BillService;
import com.hospitalmanagement.service.PatientService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;
    private final PatientService patientService;
    private final AppointmentService appointmentService;

    @GetMapping
    public ResponseEntity<List<BillDTO>> getAllBills(
            @RequestParam(required = false) Long patientId,
            Authentication authentication) {
        // Non-admins may only see their own bills. A patient resolves to their own
        // patient id; any other non-admin role gets an intentionally empty result.
        if (!SecurityUtils.isAdmin(authentication)) {
            patientId = SecurityUtils.isPatient(authentication)
                    ? patientService.findByEmail(SecurityUtils.email(authentication))
                            .map(p -> p.getId()).orElse(-1L)
                    : -1L;
        }
        List<Bill> bills = (patientId != null)
                ? billService.getBillsByPatientId(patientId)
                : billService.getAllBills();
        List<BillDTO> dtos = bills.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillDTO> getBillById(@PathVariable Long id, Authentication authentication) {
        Bill bill = billService.getBillById(id);
        if (!SecurityUtils.isAdmin(authentication)) {
            Long ownId = SecurityUtils.isPatient(authentication)
                    ? patientService.findByEmail(SecurityUtils.email(authentication))
                            .map(p -> p.getId()).orElse(-1L)
                    : -1L;
            if (bill.getPatient() == null || !ownId.equals(bill.getPatient().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return ResponseEntity.ok(toDto(bill));
    }

    @PostMapping
    public ResponseEntity<BillDTO> createBill(@Valid @RequestBody BillDTO billDTO) {
        Bill savedBill = billService.createBill(toEntity(billDTO));
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(savedBill));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillDTO> updateBill(@PathVariable Long id, @Valid @RequestBody BillDTO billDTO) {
        Bill updatedBill = billService.updateBill(id, toEntity(billDTO));
        return ResponseEntity.ok(toDto(updatedBill));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return ResponseEntity.noContent().build();
    }

    private BillDTO toDto(Bill bill) {
        return BillDTO.builder()
                .id(bill.getId())
                .amount(bill.getAmount())
                .billDate(bill.getBillDate())
                .paymentStatus(bill.getPaymentStatus())
                .patientId(bill.getPatient() != null ? bill.getPatient().getId() : null)
                .appointmentId(bill.getAppointment() != null ? bill.getAppointment().getId() : null)
                .build();
    }

    private Bill toEntity(BillDTO billDTO) {
        return Bill.builder()
                .amount(billDTO.getAmount())
                .billDate(billDTO.getBillDate())
                .paymentStatus(billDTO.getPaymentStatus())
                .patient(patientService.getPatientById(billDTO.getPatientId()))
                .appointment(appointmentService.getAppointmentById(billDTO.getAppointmentId()))
                .build();
    }
}
