package com.hospitalmanagement.service;

import java.util.List;

import com.hospitalmanagement.entity.MedicalRecord;

public interface MedicalRecordService {
    MedicalRecord createMedicalRecord(MedicalRecord medicalRecord);

    MedicalRecord getMedicalRecordById(Long id);

    List<MedicalRecord> getAllMedicalRecords();

    List<MedicalRecord> getMedicalRecordsByPatientId(Long patientId);

    List<MedicalRecord> getMedicalRecordsByDoctorId(Long doctorId);

    MedicalRecord updateMedicalRecord(Long id, MedicalRecord medicalRecord);

    void deleteMedicalRecord(Long id);
}
