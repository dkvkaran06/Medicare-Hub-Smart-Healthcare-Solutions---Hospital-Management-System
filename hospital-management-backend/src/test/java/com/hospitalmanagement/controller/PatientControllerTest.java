package com.hospitalmanagement.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospitalmanagement.dto.PatientDTO;
import com.hospitalmanagement.entity.Patient;
import com.hospitalmanagement.exception.GlobalExceptionHandler;
import com.hospitalmanagement.exception.ResourceNotFoundException;
import com.hospitalmanagement.service.PatientService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PatientController.class)
@Import(GlobalExceptionHandler.class)
class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PatientService patientService;

    @Test
    void shouldCreatePatient() throws Exception {
        PatientDTO request = PatientDTO.builder()
                .name("John Doe")
                .age(32)
                .gender("Male")
                .phone("9876543210")
                .email("john@example.com")
                .address("Mumbai")
                .bloodGroup("O+")
                .build();

        Patient savedPatient = Patient.builder()
                .id(1L)
                .name(request.getName())
                .age(request.getAge())
                .gender(request.getGender())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .bloodGroup(request.getBloodGroup())
                .build();

        given(patientService.createPatient(any(Patient.class))).willReturn(savedPatient);

        mockMvc.perform(post("/api/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    void shouldGetPatientById() throws Exception {
        Patient patient = Patient.builder()
                .id(1L)
                .name("Jane Doe")
                .age(28)
                .gender("Female")
                .phone("9999999999")
                .email("jane@example.com")
                .address("Pune")
                .bloodGroup("A+")
                .build();

        given(patientService.getPatientById(eq(1L))).willReturn(patient);

        mockMvc.perform(get("/api/patients/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Jane Doe"));
    }

    @Test
    void shouldReturnNotFoundForMissingPatient() throws Exception {
        given(patientService.getPatientById(eq(5L)))
                .willThrow(new ResourceNotFoundException("Patient not found with id: 5"));

        mockMvc.perform(get("/api/patients/5"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Patient not found with id: 5"));
    }
}
