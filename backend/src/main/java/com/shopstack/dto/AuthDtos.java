package com.shopstack.dto;

public class AuthDtos {

    public static class RegisterRequest {
        public String name;
        public String email;
        public String password;
        public String role;
        public String businessName;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }

    public static class CheckEmailRequest {
        public String email;
    }

    public static class ResetPasswordRequest {
        public String email;
        public String newPassword;
    }
}