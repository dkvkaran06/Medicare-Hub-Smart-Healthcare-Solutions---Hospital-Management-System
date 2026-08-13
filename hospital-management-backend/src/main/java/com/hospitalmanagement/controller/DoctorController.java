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
import org.springframework.web.bind.annotation.RestController;

import com.hospitalmanagement.dto.DoctorDTO;
import com.hospitalmanagement.entity.Doctor;
import com.hospitalmanagement.service.DepartmentService;
import com.hospitalmanagement.service.DoctorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<DoctorDTO>> getAllDoctors() {
        List<DoctorDTO> doctors = doctorService.getAllDoctors().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorDTO> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(toDto(doctorService.getDoctorById(id)));
    }

    @PostMapping
    public ResponseEntity<DoctorDTO> createDoctor(@Valid @RequestBody DoctorDTO doctorDTO) {
        Doctor savedDoctor = doctorService.createDoctor(toEntity(doctorDTO));
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(savedDoctor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorDTO> updateDoctor(@PathVariable Long id, @Valid @RequestBody DoctorDTO doctorDTO) {
        Doctor updatedDoctor = doctorService.updateDoctor(id, toEntity(doctorDTO));
        return ResponseEntity.ok(toDto(updatedDoctor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }

    private DoctorDTO toDto(Doctor doctor) {
        return DoctorDTO.builder()
                .id(doctor.getId())
                .name(doctor.getName())
                .specialization(doctor.getSpecialization())
                .phone(doctor.getPhone())
                .email(doctor.getEmail())
                .departmentId(doctor.getDepartment() != null ? doctor.getDepartment().getId() : null)
                .build();
    }

    private Doctor toEntity(DoctorDTO doctorDTO) {
        return Doctor.builder()
                .name(doctorDTO.getName())
                .specialization(doctorDTO.getSpecialization())
                .phone(doctorDTO.getPhone())
                .email(doctorDTO.getEmail())
                .department(departmentService.getDepartmentById(doctorDTO.getDepartmentId()))
                .build();
    }
}
