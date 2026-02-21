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

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<java.util.Map<String, Double>>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(creditService.getSummary(), "Summary retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CreditCustomerDto>> createCustomer(@RequestBody CreditCustomerDto dto) {
        CreditCustomerDto created = creditService.createCustomer(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "Customer created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<CreditCustomerDto>>> getAllCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String publicId,
            @RequestParam(required = false) com.grocersmart.entity.CreditCustomer.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        if (publicId != null) {
            try {
                CreditCustomerDto customer = creditService.getCustomerByPublicId(publicId);
                org.springframework.data.domain.Page<CreditCustomerDto> result = new org.springframework.data.domain.PageImpl<>(
                        java.util.Collections.singletonList(customer),
                        org.springframework.data.domain.PageRequest.of(0, 1), 1);
                return ResponseEntity.ok(ApiResponse.success(result, "Customer retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity
                        .ok(ApiResponse.success(org.springframework.data.domain.Page.empty(), "Customer not found"));
            }
        }

        String[] sortParts = sort.split(",");
        org.springframework.data.domain.Sort sortObj = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc")
                ? org.springframework.data.domain.Sort.by(sortParts[0]).descending()
                : org.springframework.data.domain.Sort.by(sortParts[0]).ascending();

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sortObj);
        org.springframework.data.jpa.domain.Specification<com.grocersmart.entity.CreditCustomer> spec = com.grocersmart.specification.CreditCustomerSpecification
                .filterBy(search, status);

        return ResponseEntity.ok(
                ApiResponse.success(creditService.getCustomers(spec, pageable), "Customers retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CreditCustomerDto>> getCustomer(@PathVariable Long id) {
        return ResponseEntity
                .ok(ApiResponse.success(creditService.getCustomerById(id), "Customer retrieved successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<CreditCustomerDto>> searchCustomer(@RequestParam(required = false) Long id,
            @RequestParam(required = false) String publicId) {
        CreditCustomerDto customer = null;
        if (id != null) {
            customer = creditService.getCustomerById(id);
        } else if (publicId != null) {
            customer = creditService.getCustomerByPublicId(publicId);
        }
        if (customer == null) {
            throw new jakarta.persistence.EntityNotFoundException("Customer not found");
        }
        return ResponseEntity.ok(ApiResponse.success(customer, "Customer found"));
    }

    @GetMapping("/{id}/balance")
    public ResponseEntity<ApiResponse<java.util.Map<String, Double>>> getCustomerBalance(@PathVariable Long id) {
        CreditCustomerDto customer = creditService.getCustomerById(id);
        java.util.Map<String, Double> balance = new java.util.HashMap<>();
        double limit = customer.getCreditLimit() != null ? customer.getCreditLimit() : 0.0;
        double outstanding = customer.getOutstandingBalance() != null ? Math.abs(customer.getOutstandingBalance())
                : 0.0;
        balance.put("creditLimit", limit);
        balance.put("outstandingBalance", outstanding);
        balance.put("availableCredit", Math.max(0.0, limit - outstanding));
        return ResponseEntity.ok(ApiResponse.success(balance, "Balance retrieved successfully"));
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
    public ResponseEntity<ApiResponse<com.grocersmart.dto.CreditPaymentResponseDto>> addPayment(@PathVariable Long id,
            @RequestBody CreditPaymentDto dto) {
        com.grocersmart.dto.CreditPaymentResponseDto payment = creditService.addPayment(id, dto);
        return ResponseEntity.ok(ApiResponse.success(payment, "Payment added successfully"));
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<List<CreditPaymentDto>>> getPayments(@PathVariable Long id) {
        List<CreditPaymentDto> payments = creditService.getCustomerPayments(id);
        return ResponseEntity.ok(ApiResponse.success(payments, "Customer payments retrieved successfully"));
    }

    @GetMapping("/{id}/sales")
    public ResponseEntity<ApiResponse<List<com.grocersmart.dto.SalesRecordDto>>> getCustomerSales(
            @PathVariable Long id) {
        return ResponseEntity
                .ok(ApiResponse.success(creditService.getCustomerSales(id), "Customer purchase history retrieved"));
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getCustomerSummary(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(creditService.getCustomerSummary(id), "Customer summary retrieved"));
    }

    @GetMapping("/{id}/invoices")
    public ResponseEntity<ApiResponse<List<com.grocersmart.dto.SalesRecordDto>>> getInvoices(
            @PathVariable Long id,
            @RequestParam(required = false) com.grocersmart.entity.SalesRecord.PaymentStatus status) {
        return ResponseEntity.ok(ApiResponse.success(creditService.getCustomerInvoices(id, status), "Customer invoices retrieved"));
    }
}
