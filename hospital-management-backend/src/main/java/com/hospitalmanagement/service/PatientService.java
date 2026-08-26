package com.hospitalmanagement.service;

import java.util.List;
import java.util.Optional;

import com.hospitalmanagement.entity.Patient;

public interface PatientService {
    Patient createPatient(Patient patient);

    Patient getPatientById(Long id);

    Optional<Patient> findByEmail(String email);

    List<Patient> getAllPatients();

    Patient updatePatient(Long id, Patient patient);

    void deletePatient(Long id);
}
