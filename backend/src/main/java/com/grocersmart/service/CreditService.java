package com.grocersmart.service;

import com.grocersmart.dto.CreditCustomerDto;
import com.grocersmart.dto.CreditPaymentDto;
import com.grocersmart.entity.CreditCustomer;
import com.grocersmart.entity.CreditPayment;
import com.grocersmart.repository.CreditCustomerRepository;
import com.grocersmart.repository.CreditPaymentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CreditService {

    private final CreditCustomerRepository customerRepository;
    private final CreditPaymentRepository paymentRepository;

    public CreditCustomerDto createCustomer(CreditCustomerDto dto) {
        CreditCustomer customer = new CreditCustomer();
        mapToEntity(dto, customer);
        customer.setStatus(CreditCustomer.Status.ACTIVE);
        return mapToDto(customerRepository.save(customer));
    }

    public List<CreditCustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CreditCustomerDto getCustomerById(Long id) {
        return customerRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
    }

    public CreditCustomerDto updateCustomer(Long id, CreditCustomerDto dto) {
        CreditCustomer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
        mapToEntity(dto, customer);
        // Note: typically balance shouldn't be updated directly via updateCustomer, but
        // here we allow basic updates
        return mapToDto(customerRepository.save(customer));
    }

    public void deleteCustomer(Long id) {
        CreditCustomer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
        customer.setStatus(CreditCustomer.Status.INACTIVE);
        customerRepository.save(customer);
    }

    public List<CreditPaymentDto> getCustomerPayments(Long customerId) {
        return paymentRepository.findByCustomerId(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CreditPaymentDto addPayment(Long customerId, CreditPaymentDto dto) {
        CreditCustomer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));

        if (dto.getAmount() == null || dto.getAmount() <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }

        CreditPayment payment = new CreditPayment();
        payment.setCustomerId(customerId);
        payment.setAmount(dto.getAmount());
        payment.setNote(dto.getNote());
        payment.setPaymentDate(LocalDateTime.now());

        paymentRepository.save(payment);

        // Update balance (Payment reduces debt)
        double currentBalance = customer.getOutstandingBalance() != null ? customer.getOutstandingBalance() : 0.0;
        customer.setOutstandingBalance(currentBalance - dto.getAmount());
        customerRepository.save(customer);

        return mapToDto(payment);
    }

    private CreditCustomerDto mapToDto(CreditCustomer c) {
        CreditCustomerDto dto = new CreditCustomerDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setPhone(c.getPhone());
        dto.setAddress(c.getAddress());
        dto.setCreditLimit(c.getCreditLimit());
        dto.setOutstandingBalance(c.getOutstandingBalance());
        dto.setStatus(c.getStatus());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }

    private void mapToEntity(CreditCustomerDto dto, CreditCustomer c) {
        c.setName(dto.getName());
        c.setPhone(dto.getPhone());
        c.setAddress(dto.getAddress());
        if (dto.getCreditLimit() != null)
            c.setCreditLimit(dto.getCreditLimit());
        // Balance is usually managed by transactions, but for initial creation maybe
    }

    private CreditPaymentDto mapToDto(CreditPayment p) {
        CreditPaymentDto dto = new CreditPaymentDto();
        dto.setId(p.getId());
        dto.setCustomerId(p.getCustomerId());
        dto.setAmount(p.getAmount());
        dto.setPaymentDate(p.getPaymentDate());
        dto.setNote(p.getNote());
        return dto;
    }
}
