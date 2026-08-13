# Cognizant Interview Guide

## 1. Project Objective
Build a simple web-based Hospital Management System to manage patients, doctors, departments, appointments, medical records, and billing.

## 2. Why This Project
It demonstrates CRUD operations, layered architecture, REST APIs, JPA relationships, validation, exception handling, and React integration in a realistic business domain.

## 3. Technologies Used
- Java 11
- Spring Boot
- Spring Web
- Spring Data JPA
- Hibernate
- MySQL
- Bean Validation
- React
- Axios
- React Router
- CSS

## 4. Architecture
Controller -> Service -> Repository -> Entity -> MySQL.

## 5. Frontend-Backend Communication
React sends HTTP requests using Axios to Spring Boot REST endpoints. The backend returns JSON responses.

## 6. REST API Behavior
Each resource has standard CRUD endpoints using GET, POST, PUT, and DELETE methods.

## 7. How Spring Boot Is Used
It bootstraps the application, auto-configures components, and provides the REST API layer.

## 8. How Spring Data JPA Is Used
It provides repository interfaces so we can perform database operations without writing SQL.

## 9. JpaRepository
`JpaRepository` provides ready-made methods like `save()`, `findById()`, `findAll()`, and `deleteById()`.

## 10. Hibernate
Hibernate is the JPA implementation that translates Java entities into database tables and handles CRUD SQL generation.

## 11. Entity Relationships
- Department has many Doctors
- Patient has many Appointments
- Doctor has many Appointments
- Patient has many Medical Records
- Doctor has many Medical Records
- Patient has many Bills
- Appointment is linked to Bill

## 12. MySQL Connection
Configured in `application.properties` using the datasource URL, username, and password.

## 13. CRUD Operations
Create, read, update, and delete are implemented for the major hospital entities.

## 14. Exception Handling
`@RestControllerAdvice` handles exceptions globally and returns proper HTTP status codes.

## 15. Validation
DTOs use Bean Validation annotations to check request data before saving.

## 16. DTOs
DTOs keep request and response structures simple and prevent exposing entity relationships directly.

## 17. CORS
CORS allows the React frontend on `http://localhost:5173` to call the Spring Boot backend on `http://localhost:8080`.

## 18. React Components
The frontend is split into reusable components like layout and stat cards, plus separate pages for each module.

## 19. Axios
Axios is used for HTTP requests from React to the backend.

## 20. React Router
React Router handles navigation between Dashboard, Patients, Doctors, Departments, Appointments, Medical Records, and Billing.

## 21. Complete Request Flow
React form -> Axios -> Controller -> Service -> Repository -> Hibernate/JPA -> MySQL.

## Likely Cognizant Interview Questions
1. Why did you choose this project?
2. Why did you use DTOs instead of entities directly?
3. What is the role of the service layer?
4. How does `JpaRepository` help you?
5. Explain the difference between `@OneToMany` and `@ManyToOne`.
6. How did you handle validation errors?
7. How did you configure CORS?
8. How does React talk to the backend?
9. What happens when a patient is not found?
10. Why is this project beginner/intermediate level?
11. What are the advantages of Spring Boot over plain Spring?
12. How does Hibernate map entities to tables?
13. How did you avoid infinite JSON recursion?
14. Why did you keep the architecture layered?
15. How would you extend this project in the future?
