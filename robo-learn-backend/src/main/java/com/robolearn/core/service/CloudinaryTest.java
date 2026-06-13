package com.robolearn.core.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.util.Map;
import java.util.HashMap;

public class CloudinaryTest {
    public static void main(String[] args) throws Exception {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "daohwmzl5");
        config.put("api_key", "976574796336827");
        config.put("api_secret", "lYkf821cut7125N3RJk9ej3zjm0");
        Cloudinary cloudinary = new Cloudinary(config);
        
        System.out.println("Uploading test image...");
        Map uploadResult = cloudinary.uploader().upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", ObjectUtils.asMap("folder", "robolearn_test"));
        
        String url = uploadResult.get("secure_url").toString();
        System.out.println("Uploaded: " + url);
        
        String[] parts = url.split("/upload/");
        String pathWithVersion = parts[1];
        String path = pathWithVersion.replaceFirst("^v\\d+/", "");
        int lastDotIndex = path.lastIndexOf('.');
        String publicId = (lastDotIndex != -1) ? path.substring(0, lastDotIndex) : path;
        
        System.out.println("Deleting publicId: " + publicId);
        Map deleteResult = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        System.out.println("Delete Result: " + deleteResult);
    }
}
