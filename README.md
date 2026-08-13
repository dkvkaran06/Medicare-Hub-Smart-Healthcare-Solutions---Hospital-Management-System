# Hospital Management System

A beginner-friendly Java full stack Hospital Management System built for a Cognizant Java Full Stack Engineer interview.

## Project Structure

- `hospital-management-backend` - Spring Boot REST API with MySQL, JPA, validation, and global exception handling
- `hospital-management-frontend` - React + Vite UI with Axios, React Router, and ESLint

## Tech Stack

### Backend
- Java 11
- Spring Boot 2.7.18
- Spring Web
- Spring Data JPA
- Hibernate
- Bean Validation
- MySQL
- Lombok
- Global exception handling with `@RestControllerAdvice`

### Frontend
- React 18
- Vite
- JavaScript
- React Router DOM
- Axios
- CSS
- ESLint

## Features

- Manage Patients
- Manage Doctors
- Manage Departments
- Manage Appointments
- Manage Medical Records
- Manage Bills
- Dashboard with live counts
- CRUD operations for all major entities
- Validation and error handling
- CORS configured for frontend-backend communication

## How to Run

### 1. Start MySQL
Create a database named `hospital_management`.

### 2. Run the backend
From `hospital-management-backend`:

```bash
mvn test
mvn spring-boot:run
```

If Maven is not on PATH on Windows, use the local Maven binary already present on this machine:

```powershell
& "C:\Users\Dev\Desktop\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd" spring-boot:run
```

### 3. Run the frontend
From `hospital-management-frontend`:

```bash
npm install
npm run dev
```

### 4. Open the app
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

## Architecture Flow

`React form -> Axios -> REST Controller -> Service -> Repository -> Hibernate/JPA -> MySQL`

## Major Entity Relationships

- Department -> Doctor: one-to-many
- Patient -> Appointment: one-to-many
- Doctor -> Appointment: one-to-many
- Patient -> MedicalRecord: one-to-many
- Doctor -> MedicalRecord: one-to-many
- Patient -> Bill: one-to-many
- Appointment -> Bill: many-to-one from Bill side

## API Endpoints

### Patients
- `GET /api/patients`
- `GET /api/patients/{id}`
- `POST /api/patients`
- `PUT /api/patients/{id}`
- `DELETE /api/patients/{id}`

### Doctors
- `GET /api/doctors`
- `GET /api/doctors/{id}`
- `POST /api/doctors`
- `PUT /api/doctors/{id}`
- `DELETE /api/doctors/{id}`

### Departments
- `GET /api/departments`
- `GET /api/departments/{id}`
- `POST /api/departments`
- `PUT /api/departments/{id}`
- `DELETE /api/departments/{id}`

### Appointments
- `GET /api/appointments`
- `GET /api/appointments/{id}`
- `POST /api/appointments`
- `PUT /api/appointments/{id}`
- `DELETE /api/appointments/{id}`

### Medical Records
- `GET /api/medical-records`
- `GET /api/medical-records/{id}`
- `POST /api/medical-records`
- `PUT /api/medical-records/{id}`
- `DELETE /api/medical-records/{id}`

### Bills
- `GET /api/bills`
- `GET /api/bills/{id}`
- `POST /api/bills`
- `PUT /api/bills/{id}`
- `DELETE /api/bills/{id}`

## Validation and Exception Handling

- Request DTOs use Bean Validation annotations like `@NotBlank`, `@NotNull`, `@Email`, `@Min`, and `@Max`
- `ResourceNotFoundException` is handled globally and returns `404 NOT FOUND`
- Validation errors return `400 BAD REQUEST`

## MySQL Configuration

Backend uses `hospital_management` with `spring.jpa.hibernate.ddl-auto=update` so tables are created and updated automatically during development.

## Testing

Backend test coverage currently includes:
- Patient creation
- Patient retrieval
- Patient not found scenario

Run tests with:

```bash
mvn test
```

## Interview Focus

This project is intentionally kept at a beginner/intermediate level so it is easy to explain in an interview:
- clean layered architecture
- simple DTO mapping
- direct REST APIs
- basic JPA relationships
- React CRUD forms with Axios
- no microservices, JWT, Redis, Kafka, or Docker
