package com.robolearn.user.service;

import com.robolearn.dashboard.service.DashboardService;
import com.robolearn.core.service.EmailService;
import com.robolearn.user.dto.request.UpdateProfileRequest;
import com.robolearn.user.dto.response.AdminUserResponse;
import com.robolearn.user.dto.response.UserProfileResponse;
import com.robolearn.user.entity.User;
import com.robolearn.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import com.robolearn.auth.dto.request.ChangePasswordRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import com.robolearn.auth.dto.request.SetPasswordRequest;

public interface UserService {
    User getUserByEmail(String email);

    void requestProfileOtp(String email);

    void setPassword(String email, SetPasswordRequest request);

    void changePassword(String email, ChangePasswordRequest request);

    void enrollInCourse(String email, String courseId);

    List<AdminUserResponse> getAllUsers();

    UserProfileResponse getUserProfile(String email);

    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
}
