package com.hospeasy.backend.config;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.*;
@Configuration
public class FilterRegistrationConfig {
    @Bean FilterRegistrationBean<JwtAuthenticationFilter> jwtRegistration(JwtAuthenticationFilter f) {
        var b=new FilterRegistrationBean<>(f); b.setEnabled(false); return b;
    }
    @Bean FilterRegistrationBean<RequestRateLimitFilter> rateRegistration(RequestRateLimitFilter f) {
        var b=new FilterRegistrationBean<>(f); b.setEnabled(false); return b;
    }
}
