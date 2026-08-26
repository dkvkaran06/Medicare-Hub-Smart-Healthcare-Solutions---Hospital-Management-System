package com.hospitalmanagement.controller;

import java.util.List;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hospitalmanagement.dto.AppointmentDTO;
import com.hospitalmanagement.entity.Appointment;
import com.hospitalmanagement.service.AppointmentService;
import com.hospitalmanagement.service.DoctorService;
import com.hospitalmanagement.service.PatientService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final PatientService patientService;
    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId) {
        List<Appointment> appointments;
        if (patientId != null) {
            appointments = appointmentService.getAppointmentsByPatientId(patientId);
        } else if (doctorId != null) {
            appointments = appointmentService.getAppointmentsByDoctorId(doctorId);
        } else {
            appointments = appointmentService.getAllAppointments();
        }
        List<AppointmentDTO> dtos = appointments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(toDto(appointmentService.getAppointmentById(id)));
    }

    @PostMapping
    public ResponseEntity<AppointmentDTO> createAppointment(@Valid @RequestBody AppointmentDTO appointmentDTO) {
        Appointment savedAppointment = appointmentService.createAppointment(toEntity(appointmentDTO));
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(savedAppointment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointment(@PathVariable Long id,
            @Valid @RequestBody AppointmentDTO appointmentDTO) {
        Appointment updatedAppointment = appointmentService.updateAppointment(id, toEntity(appointmentDTO));
        return ResponseEntity.ok(toDto(updatedAppointment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }

    private AppointmentDTO toDto(Appointment appointment) {
        return AppointmentDTO.builder()
                .id(appointment.getId())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus())
                .patientId(appointment.getPatient() != null ? appointment.getPatient().getId() : null)
                .doctorId(appointment.getDoctor() != null ? appointment.getDoctor().getId() : null)
                .build();
    }

    private Appointment toEntity(AppointmentDTO appointmentDTO) {
        return Appointment.builder()
                .appointmentDate(appointmentDTO.getAppointmentDate())
                .appointmentTime(appointmentDTO.getAppointmentTime())
                .status(appointmentDTO.getStatus())
                .patient(patientService.getPatientById(appointmentDTO.getPatientId()))
                .doctor(doctorService.getDoctorById(appointmentDTO.getDoctorId()))
                .build();
    }
}
