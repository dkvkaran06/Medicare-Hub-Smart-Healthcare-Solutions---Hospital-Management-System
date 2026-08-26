package com.hospitalmanagement.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.hospitalmanagement.entity.MedicalRecord;
import com.hospitalmanagement.exception.ResourceNotFoundException;
import com.hospitalmanagement.repository.MedicalRecordRepository;
import com.hospitalmanagement.service.MedicalRecordService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;

    @Override
    public MedicalRecord createMedicalRecord(MedicalRecord medicalRecord) {
        return medicalRecordRepository.save(medicalRecord);
    }

    @Override
    public MedicalRecord getMedicalRecordById(Long id) {
        return medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with id: " + id));
    }

    @Override
    public List<MedicalRecord> getAllMedicalRecords() {
        return medicalRecordRepository.findAll();
    }

    @Override
    public List<MedicalRecord> getMedicalRecordsByPatientId(Long patientId) {
        return medicalRecordRepository.findByPatientId(patientId);
    }

    @Override
    public List<MedicalRecord> getMedicalRecordsByDoctorId(Long doctorId) {
        return medicalRecordRepository.findByDoctorId(doctorId);
    }

    @Override
    public MedicalRecord updateMedicalRecord(Long id, MedicalRecord medicalRecord) {
        MedicalRecord existingMedicalRecord = getMedicalRecordById(id);
        existingMedicalRecord.setDiagnosis(medicalRecord.getDiagnosis());
        existingMedicalRecord.setTreatment(medicalRecord.getTreatment());
        existingMedicalRecord.setPrescription(medicalRecord.getPrescription());
        existingMedicalRecord.setRecordDate(medicalRecord.getRecordDate());
        existingMedicalRecord.setPatient(medicalRecord.getPatient());
        existingMedicalRecord.setDoctor(medicalRecord.getDoctor());
        return medicalRecordRepository.save(existingMedicalRecord);
    }

    @Override
    public void deleteMedicalRecord(Long id) {
        MedicalRecord existingMedicalRecord = getMedicalRecordById(id);
        medicalRecordRepository.delete(existingMedicalRecord);
    }
}
