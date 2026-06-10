package com.robolearn.api.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;
    
    // Email -> OTP
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    
    // Email -> Expiry Time (Tracks emails that are verified and ready for registration)
    private final Map<String, Long> verifiedEmails = new ConcurrentHashMap<>();

    private static class OtpData {
        String otp;
        long expiry;

        OtpData(String otp, long ttlSeconds) {
            this.otp = otp;
            this.expiry = System.currentTimeMillis() + TimeUnit.SECONDS.toMillis(ttlSeconds);
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiry;
        }
    }

    public void sendOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, new OtpData(otp, 600)); // 10 minutes expiry

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            // CRITICAL FIX: Use the actual authenticated email as the technical 'from' address
            // but keep the 'RoboLearn Support' display name.
            helper.setFrom(senderEmail, "RoboLearn Support");
            helper.setTo(email);
            helper.setSubject("RoboLearn: Email Verification Code");
            
            String htmlContent = "<div style='font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px; border-radius: 12px;'>"
                    + "<h2 style='color: #6366f1;'>Email Verification</h2>"
                    + "<p>Welcome to RoboLearn! Use the following code to verify your email address and continue with registration:</p>"
                    + "<div style='background-color: #1e293b; border: 1px solid #334155; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; border-radius: 8px; color: #22d3ee; margin: 30px 0;'>"
                    + otp
                    + "</div>"
                    + "<p style='color: #94a3b8; font-size: 14px;'>This code will expire in 10 minutes.</p>"
                    + "</div>";
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("OTP sent successfully to: {}", email);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send email to {}", email, e);
            throw new RuntimeException("Failed to send verification email");
        }
    }

    public boolean verifyOtp(String email, String otp) {
        OtpData data = otpStorage.get(email);
        if (data == null || data.isExpired()) {
            otpStorage.remove(email);
            return false;
        }
        
        boolean isValid = data.otp.equals(otp);
        if (isValid) {
            otpStorage.remove(email); // One-time use
            verifiedEmails.put(email, System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(15)); // Valid for 15 mins
        }
        return isValid;
    }

    public boolean isEmailVerified(String email) {
        Long expiry = verifiedEmails.get(email);
        if (expiry == null || System.currentTimeMillis() > expiry) {
            verifiedEmails.remove(email);
            return false;
        }
        return true;
    }
}
