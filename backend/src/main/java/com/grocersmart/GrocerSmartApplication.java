package com.grocersmart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GrocerSmartApplication {

    public static void main(String[] args) {
        SpringApplication.run(GrocerSmartApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}
