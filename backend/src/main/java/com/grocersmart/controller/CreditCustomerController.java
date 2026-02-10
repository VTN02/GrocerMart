package com.grocersmart.controller;

import com.grocersmart.dto.ApiResponse;
import com.grocersmart.dto.CreditCustomerDto;
import com.grocersmart.dto.CreditPaymentDto;
import com.grocersmart.service.CreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/credit-customers")
@RequiredArgsConstructor
public class CreditCustomerController {

    private final CreditService creditService;

    @PostMapping
    public ResponseEntity<ApiResponse<CreditCustomerDto>> createCustomer(@RequestBody CreditCustomerDto dto) {
        CreditCustomerDto created = creditService.createCustomer(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "Customer created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CreditCustomerDto>>> getAllCustomers(
            @RequestParam(required = false) Long id) {
        if (id != null) {
            try {
                CreditCustomerDto customer = creditService.getCustomerById(id);
                return ResponseEntity.ok(ApiResponse.success(java.util.Collections.singletonList(customer),
                        "Customer retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity.ok(ApiResponse.success(java.util.Collections.emptyList(), "Customer not found"));
            }
        }
        return ResponseEntity
                .ok(ApiResponse.success(creditService.getAllCustomers(), "Customers retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CreditCustomerDto>> getCustomer(@PathVariable Long id) {
        return ResponseEntity
                .ok(ApiResponse.success(creditService.getCustomerById(id), "Customer retrieved successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<CreditCustomerDto>> searchCustomer(@RequestParam Long id) {
        return ResponseEntity.ok(ApiResponse.success(creditService.getCustomerById(id), "Customer found"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CreditCustomerDto>> updateCustomer(@PathVariable Long id,
            @RequestBody CreditCustomerDto dto) {
        CreditCustomerDto updated = creditService.updateCustomer(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Customer updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Long id) {
        creditService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Customer deleted successfully"));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<CreditPaymentDto>> addPayment(@PathVariable Long id,
            @RequestBody CreditPaymentDto dto) {
        CreditPaymentDto payment = creditService.addPayment(id, dto);
        return ResponseEntity.ok(ApiResponse.success(payment, "Payment added successfully"));
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<List<CreditPaymentDto>>> getPayments(@PathVariable Long id) {
        List<CreditPaymentDto> payments = creditService.getCustomerPayments(id);
        return ResponseEntity.ok(ApiResponse.success(payments, "Customer payments retrieved successfully"));
    }
}
