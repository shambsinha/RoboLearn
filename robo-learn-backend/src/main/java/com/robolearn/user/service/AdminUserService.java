package com.robolearn.user.service;

import com.robolearn.user.dto.response.AdminUserResponse;
import com.robolearn.user.dto.response.UserProfileResponse;
import com.robolearn.user.entity.User;
import com.robolearn.user.repository.UserRepository;
import com.robolearn.core.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

public interface AdminUserService {
    List<AdminUserResponse> getAllUsers();

    UserProfileResponse getUserProfile(Long userId);

    AdminUserResponse toggleSuspendStatus(Long userId);
}
