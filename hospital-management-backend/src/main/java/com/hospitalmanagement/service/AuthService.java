package com.hospitalmanagement.service;

import java.util.Map;

public interface AuthService {

    Map<String, Object> register(Map<String, String> request);

    Map<String, Object> login(String email, String password);
}
