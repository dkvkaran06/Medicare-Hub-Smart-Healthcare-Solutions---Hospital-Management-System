import client from './client';

// Auth
export const registerUser = (payload) => client.post('/auth/register', payload);
export const loginUser = (payload) => client.post('/auth/login', payload);

export const getPatients = () => client.get('/patients');
export const getPatientById = (id) => client.get(`/patients/${id}`);
export const createPatient = (payload) => client.post('/patients', payload);
export const updatePatient = (id, payload) => client.put(`/patients/${id}`, payload);
export const deletePatient = (id) => client.delete(`/patients/${id}`);

export const getDoctors = () => client.get('/doctors');
export const getDoctorById = (id) => client.get(`/doctors/${id}`);
export const createDoctor = (payload) => client.post('/doctors', payload);
export const updateDoctor = (id, payload) => client.put(`/doctors/${id}`, payload);
export const deleteDoctor = (id) => client.delete(`/doctors/${id}`);

export const getDepartments = () => client.get('/departments');
export const getDepartmentById = (id) => client.get(`/departments/${id}`);
export const createDepartment = (payload) => client.post('/departments', payload);
export const updateDepartment = (id, payload) => client.put(`/departments/${id}`, payload);
export const deleteDepartment = (id) => client.delete(`/departments/${id}`);

export const getAppointments = () => client.get('/appointments');
export const createAppointment = (payload) => client.post('/appointments', payload);
export const updateAppointment = (id, payload) => client.put(`/appointments/${id}`, payload);
export const deleteAppointment = (id) => client.delete(`/appointments/${id}`);

export const getMedicalRecords = () => client.get('/medical-records');
export const createMedicalRecord = (payload) => client.post('/medical-records', payload);
export const updateMedicalRecord = (id, payload) => client.put(`/medical-records/${id}`, payload);
export const deleteMedicalRecord = (id) => client.delete(`/medical-records/${id}`);

export const getBills = () => client.get('/bills');
export const createBill = (payload) => client.post('/bills', payload);
export const updateBill = (id, payload) => client.put(`/bills/${id}`, payload);
export const deleteBill = (id) => client.delete(`/bills/${id}`);
