package com.robolearn.core.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class ApiLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Log the incoming request details
        String method = request.getMethod();
        String requestURI = request.getRequestURI();
        String queryString = request.getQueryString();
        String clientIp = request.getRemoteAddr();

        Map<String, String> headers = new HashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        if (headerNames != null) {
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                // Exclude sensitive headers if necessary, or log everything. Usually exclude Authorization.
                if (!headerName.equalsIgnoreCase("authorization")) {
                    headers.put(headerName, request.getHeader(headerName));
                } else {
                    headers.put(headerName, "[PROTECTED]");
                }
            }
        }

        String fullPath = queryString == null ? requestURI : requestURI + "?" + queryString;
        log.info("Incoming API Request | Method: {} | Path: {} | IP: {} | Headers: {}", 
                 method, fullPath, clientIp, headers);

        long startTime = System.currentTimeMillis();

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = response.getStatus();
            
            if (status >= 400 && status < 500) {
                log.warn("API Response | Method: {} | Path: {} | Status: {} | Time: {}ms", 
                         method, requestURI, status, duration);
            } else if (status >= 500) {
                log.error("API Error Response | Method: {} | Path: {} | Status: {} | Time: {}ms", 
                          method, requestURI, status, duration);
            } else {
                log.info("API Response | Method: {} | Path: {} | Status: {} | Time: {}ms", 
                         method, requestURI, status, duration);
            }
        }
    }
}
