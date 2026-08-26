package com.hospitalmanagement.service;

import java.util.List;

import com.hospitalmanagement.entity.Appointment;

public interface AppointmentService {
    Appointment createAppointment(Appointment appointment);

    Appointment getAppointmentById(Long id);

    List<Appointment> getAllAppointments();

    List<Appointment> getAppointmentsByPatientId(Long patientId);

    List<Appointment> getAppointmentsByDoctorId(Long doctorId);

    Appointment updateAppointment(Long id, Appointment appointment);

    void deleteAppointment(Long id);
}
