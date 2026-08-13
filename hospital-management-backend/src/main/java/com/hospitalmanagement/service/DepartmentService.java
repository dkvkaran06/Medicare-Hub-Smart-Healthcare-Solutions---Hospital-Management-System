package com.hospitalmanagement.service;

import java.util.List;

import com.hospitalmanagement.entity.Department;

public interface DepartmentService {
    Department createDepartment(Department department);

    Department getDepartmentById(Long id);

    List<Department> getAllDepartments();

    Department updateDepartment(Long id, Department department);

    void deleteDepartment(Long id);
}
