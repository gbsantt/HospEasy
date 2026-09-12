package com.hospeasy.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration.class)
public class HospEasyApplication {

    public static void main(String[] args) {
        SpringApplication.run(HospEasyApplication.class, args);
    }

}
