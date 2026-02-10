package com.grocersmart.config;

import com.grocersmart.entity.User;
import com.grocersmart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        userRepository.findByUsername("VTNV").ifPresentOrElse(
                admin -> {
                    log.info("Default admin 'VTNV' found. Resetting password to 'vtnv' to ensure access...");
                    admin.setPasswordHash(passwordEncoder.encode("vtnv"));
                    admin.setStatus(User.Status.ACTIVE);
                    admin.setRole(User.Role.ADMIN);
                    userRepository.save(admin);
                },
                () -> {
                    log.info("Default admin 'VTNV' not found. Creating default admin account...");
                    User admin = new User();
                    admin.setFullName("GrocerSmart Admin");
                    admin.setUsername("VTNV");
                    admin.setPasswordHash(passwordEncoder.encode("vtnv"));
                    admin.setPhone("0000000000");
                    admin.setRole(User.Role.ADMIN);
                    admin.setStatus(User.Status.ACTIVE);
                    userRepository.save(admin);
                    log.info("Default admin account created: VTNV / vtnv");
                });
    }
}
