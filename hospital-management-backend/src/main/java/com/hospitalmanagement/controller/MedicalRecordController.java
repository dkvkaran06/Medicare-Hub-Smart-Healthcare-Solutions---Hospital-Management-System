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

import com.hospitalmanagement.dto.MedicalRecordDTO;
import com.hospitalmanagement.entity.MedicalRecord;
import com.hospitalmanagement.service.DoctorService;
import com.hospitalmanagement.service.MedicalRecordService;
import com.hospitalmanagement.service.PatientService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;
    private final PatientService patientService;
    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<MedicalRecordDTO>> getAllMedicalRecords(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId) {
        List<MedicalRecord> records;
        if (patientId != null) {
            records = medicalRecordService.getMedicalRecordsByPatientId(patientId);
        } else if (doctorId != null) {
            records = medicalRecordService.getMedicalRecordsByDoctorId(doctorId);
        } else {
            records = medicalRecordService.getAllMedicalRecords();
        }
        List<MedicalRecordDTO> dtos = records.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecordDTO> getMedicalRecordById(@PathVariable Long id) {
        return ResponseEntity.ok(toDto(medicalRecordService.getMedicalRecordById(id)));
    }

    @PostMapping
    public ResponseEntity<MedicalRecordDTO> createMedicalRecord(@Valid @RequestBody MedicalRecordDTO medicalRecordDTO) {
        MedicalRecord savedMedicalRecord = medicalRecordService.createMedicalRecord(toEntity(medicalRecordDTO));
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(savedMedicalRecord));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalRecordDTO> updateMedicalRecord(@PathVariable Long id,
            @Valid @RequestBody MedicalRecordDTO medicalRecordDTO) {
        MedicalRecord updatedMedicalRecord = medicalRecordService.updateMedicalRecord(id, toEntity(medicalRecordDTO));
        return ResponseEntity.ok(toDto(updatedMedicalRecord));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicalRecord(@PathVariable Long id) {
        medicalRecordService.deleteMedicalRecord(id);
        return ResponseEntity.noContent().build();
    }

    private MedicalRecordDTO toDto(MedicalRecord medicalRecord) {
        return MedicalRecordDTO.builder()
                .id(medicalRecord.getId())
                .diagnosis(medicalRecord.getDiagnosis())
                .treatment(medicalRecord.getTreatment())
                .prescription(medicalRecord.getPrescription())
                .recordDate(medicalRecord.getRecordDate())
                .patientId(medicalRecord.getPatient() != null ? medicalRecord.getPatient().getId() : null)
                .doctorId(medicalRecord.getDoctor() != null ? medicalRecord.getDoctor().getId() : null)
                .build();
    }

    private MedicalRecord toEntity(MedicalRecordDTO medicalRecordDTO) {
        return MedicalRecord.builder()
                .diagnosis(medicalRecordDTO.getDiagnosis())
                .treatment(medicalRecordDTO.getTreatment())
                .prescription(medicalRecordDTO.getPrescription())
                .recordDate(medicalRecordDTO.getRecordDate())
                .patient(patientService.getPatientById(medicalRecordDTO.getPatientId()))
                .doctor(doctorService.getDoctorById(medicalRecordDTO.getDoctorId()))
                .build();
    }
}
