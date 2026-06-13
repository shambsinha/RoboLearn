package com.robolearn.core.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

public interface CloudinaryService {
    String uploadImage(MultipartFile file) throws IOException;

    String uploadContentImage(MultipartFile file) throws IOException;

    void deleteImageByUrl(String url);
}
