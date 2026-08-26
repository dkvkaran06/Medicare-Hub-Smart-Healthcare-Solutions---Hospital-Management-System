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

import com.hospitalmanagement.dto.PatientDTO;
import com.hospitalmanagement.entity.Patient;
import com.hospitalmanagement.service.PatientService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        List<PatientDTO> patients = patientService.getAllPatients().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/by-email")
    public ResponseEntity<PatientDTO> getPatientByEmail(@RequestParam String email) {
        return patientService.findByEmail(email)
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(toDto(patientService.getPatientById(id)));
    }

    @PostMapping
    public ResponseEntity<PatientDTO> createPatient(@Valid @RequestBody PatientDTO patientDTO) {
        Patient savedPatient = patientService.createPatient(toEntity(patientDTO));
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(savedPatient));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientDTO> updatePatient(@PathVariable Long id, @Valid @RequestBody PatientDTO patientDTO) {
        Patient updatedPatient = patientService.updatePatient(id, toEntity(patientDTO));
        return ResponseEntity.ok(toDto(updatedPatient));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }

    private PatientDTO toDto(Patient patient) {
        return PatientDTO.builder()
                .id(patient.getId())
                .name(patient.getName())
                .age(patient.getAge())
                .gender(patient.getGender())
                .phone(patient.getPhone())
                .email(patient.getEmail())
                .address(patient.getAddress())
                .bloodGroup(patient.getBloodGroup())
                .build();
    }

    private Patient toEntity(PatientDTO patientDTO) {
        return Patient.builder()
                .name(patientDTO.getName())
                .age(patientDTO.getAge())
                .gender(patientDTO.getGender())
                .phone(patientDTO.getPhone())
                .email(patientDTO.getEmail())
                .address(patientDTO.getAddress())
                .bloodGroup(patientDTO.getBloodGroup())
                .build();
    }
}
