package com.robolearn.api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "robolearn_profiles"
        ));
        return uploadResult.get("secure_url").toString();
    }

    public String uploadContentImage(MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "robolearn_content",
                "resource_type", "image"
        ));
        return uploadResult.get("secure_url").toString();
    }

    public void deleteImageByUrl(String url) {
        if (url == null || url.isEmpty()) return;
        System.out.println("Attempting to delete Cloudinary image: " + url);
        try {
            // Extract public_id from Cloudinary URL
            // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234/folder/file.jpg -> folder/file
            String[] parts = url.split("/upload/");
            if (parts.length == 2) {
                String pathWithVersion = parts[1];
                // Remove version (e.g. v1234/) if present
                String path = pathWithVersion.replaceFirst("^v\\d+/", "");
                // Remove file extension
                int lastDotIndex = path.lastIndexOf('.');
                String publicId = (lastDotIndex != -1) ? path.substring(0, lastDotIndex) : path;
                
                System.out.println("Extracted publicId: " + publicId);
                Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("invalidate", true));
                System.out.println("Cloudinary destroy result: " + result);
            } else {
                System.out.println("Could not parse Cloudinary URL: " + url);
            }
        } catch (Exception e) {
            System.err.println("Failed to delete image from Cloudinary: " + url);
            e.printStackTrace();
        }
    }
}
