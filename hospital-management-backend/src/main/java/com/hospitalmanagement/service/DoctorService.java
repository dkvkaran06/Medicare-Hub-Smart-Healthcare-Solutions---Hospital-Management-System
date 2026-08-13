package com.hospitalmanagement.service;

import java.util.List;

import com.hospitalmanagement.entity.Doctor;

public interface DoctorService {
    Doctor createDoctor(Doctor doctor);

    Doctor getDoctorById(Long id);

    List<Doctor> getAllDoctors();

    Doctor updateDoctor(Long id, Doctor doctor);

    void deleteDoctor(Long id);
}
