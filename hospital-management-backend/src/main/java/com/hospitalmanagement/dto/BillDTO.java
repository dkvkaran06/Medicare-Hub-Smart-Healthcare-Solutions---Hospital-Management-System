package com.hospitalmanagement.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import javax.validation.constraints.NotNull;

import com.hospitalmanagement.entity.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillDTO {
    private Long id;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @NotNull(message = "Bill date is required")
    private LocalDate billDate;

    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;

    @NotNull(message = "Patient id is required")
    private Long patientId;

    @NotNull(message = "Appointment id is required")
    private Long appointmentId;
}
