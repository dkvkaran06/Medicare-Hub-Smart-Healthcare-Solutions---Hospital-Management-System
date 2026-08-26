package com.hospitalmanagement.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

/**
 * Small helpers for reading the authenticated caller's identity and role inside
 * controllers when enforcing "own-data-only" access. Identity comes from the
 * JWT that {@link JwtAuthenticationFilter} placed in the SecurityContext: the
 * principal name is the user's email and authorities look like ROLE_ADMIN.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static String email(Authentication authentication) {
        return authentication != null ? authentication.getName() : null;
    }

    public static boolean hasRole(Authentication authentication, String role) {
        if (authentication == null) {
            return false;
        }
        String target = "ROLE_" + role;
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (target.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    public static boolean isAdmin(Authentication authentication) {
        return hasRole(authentication, "ADMIN");
    }

    public static boolean isDoctor(Authentication authentication) {
        return hasRole(authentication, "DOCTOR");
    }

    public static boolean isPatient(Authentication authentication) {
        return hasRole(authentication, "PATIENT");
    }
}
