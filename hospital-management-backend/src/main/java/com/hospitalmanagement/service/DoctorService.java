package com.hospitalmanagement.service;

import java.util.List;
import java.util.Optional;

import com.hospitalmanagement.entity.Doctor;

public interface DoctorService {
    Doctor createDoctor(Doctor doctor);

    Doctor getDoctorById(Long id);

    Optional<Doctor> findByEmail(String email);

    List<Doctor> getAllDoctors();

    Doctor updateDoctor(Long id, Doctor doctor);

    void deleteDoctor(Long id);
}
