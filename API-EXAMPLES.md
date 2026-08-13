# API Examples

## Patient

### Create Patient
```json
{
  "name": "John Doe",
  "age": 32,
  "gender": "Male",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "Mumbai",
  "bloodGroup": "O+"
}
```

### Response
```json
{
  "id": 1,
  "name": "John Doe",
  "age": 32,
  "gender": "Male",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "Mumbai",
  "bloodGroup": "O+"
}
```

## Doctor

### Create Doctor
```json
{
  "name": "Dr. Smith",
  "specialization": "Cardiology",
  "phone": "9000000000",
  "email": "smith@example.com",
  "departmentId": 1
}
```

## Department

### Create Department
```json
{
  "name": "Cardiology",
  "description": "Heart related treatments"
}
```

## Appointment

### Create Appointment
```json
{
  "appointmentDate": "2026-08-12",
  "appointmentTime": "10:30:00",
  "status": "SCHEDULED",
  "patientId": 1,
  "doctorId": 1
}
```

## Medical Record

### Create Medical Record
```json
{
  "diagnosis": "Fever",
  "treatment": "Rest and fluids",
  "prescription": "Paracetamol",
  "recordDate": "2026-08-12",
  "patientId": 1,
  "doctorId": 1
}
```

## Bill

### Create Bill
```json
{
  "amount": 1500.0,
  "billDate": "2026-08-12",
  "paymentStatus": "PENDING",
  "patientId": 1,
  "appointmentId": 1
}
```
