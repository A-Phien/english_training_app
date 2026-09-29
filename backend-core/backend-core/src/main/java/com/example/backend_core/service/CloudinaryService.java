package com.example.backend_core.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload ảnh lên Cloudinary, lưu vào folder "avatars"
     * @param file  file ảnh từ request
     * @param publicId  tên file trên Cloudinary (ví dụ: "user_5")
     * @return URL công khai của ảnh sau khi upload
     */
    public String uploadAvatar(MultipartFile file, String publicId) throws IOException {
        @SuppressWarnings("unchecked")
        Map<String, Object> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "public_id", "avatars/" + publicId,
                        "overwrite", true,          // ghi đè nếu cùng publicId
                        "resource_type", "image",
                        "transformation", "w_300,h_300,c_fill,g_face"  // crop 300x300 căn mặt
                )
        );
        return (String) result.get("secure_url");
    }

    /**
     * Xóa ảnh khỏi Cloudinary theo publicId
     * @param publicId  ví dụ "avatars/user_5"
     */
    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
