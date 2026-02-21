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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CreditService {

    private final CreditCustomerRepository customerRepository;
    private final CreditPaymentRepository paymentRepository;
    private final TrashCreditCustomerService trashCreditCustomerService;
    private final com.grocersmart.repository.SalesRecordRepository salesRecordRepository;
    private final PublicIdGeneratorService publicIdGeneratorService;

    public CreditCustomerDto createCustomer(CreditCustomerDto dto) {
        CreditCustomer customer = new CreditCustomer();
        mapToEntity(dto, customer);

        if (customer.getOutstandingBalance() > customer.getCreditLimit()) {
            throw new IllegalArgumentException("Outstanding balance cannot exceed credit limit during creation");
        }

        customer.setStatus(CreditCustomer.Status.ACTIVE);
        customer.setPublicId(publicIdGeneratorService.nextId(com.grocersmart.common.EntityType.CREDIT_CUSTOMER));
        return mapToDto(customerRepository.save(customer));
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<CreditCustomerDto> getCustomers(
            org.springframework.data.jpa.domain.Specification<CreditCustomer> spec,
            org.springframework.data.domain.Pageable pageable) {
        return customerRepository.findAll(spec, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<CreditCustomerDto> getAllCustomers(CreditCustomer.Status status) {
        List<CreditCustomer> customers;
        if (status != null) {
            customers = customerRepository.findByStatus(status);
        } else {
            customers = customerRepository.findAll();
        }
        return customers.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CreditCustomerDto getCustomerById(Long id) {
        return customerRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
    }

    @Transactional(readOnly = true)
    public CreditCustomerDto getCustomerByPublicId(String publicId) {
        return customerRepository.findByPublicId(publicId)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with publicId: " + publicId));
    }

    public CreditCustomerDto updateCustomer(Long id, CreditCustomerDto dto) {
        CreditCustomer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
        mapToEntity(dto, customer);

        if (customer.getOutstandingBalance() > customer.getCreditLimit()) {
            throw new IllegalArgumentException("Outstanding balance cannot exceed credit limit");
        }

        return mapToDto(customerRepository.save(customer));
    }

    public void deleteCustomer(Long id) {
        CreditCustomer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));

        if (customer.getOutstandingBalance() != null && customer.getOutstandingBalance() != 0) {
            throw new IllegalStateException(
                    "Cannot delete. Customer has unsettled balance (₹" + customer.getOutstandingBalance() + ")");
        }

        // Check for unsettled invoices
        long unsettledCount = salesRecordRepository.countByCreditCustomerIdAndPaymentStatusIn(
                id, List.of(com.grocersmart.entity.SalesRecord.PaymentStatus.UNPAID,
                        com.grocersmart.entity.SalesRecord.PaymentStatus.PARTIAL));

        if (unsettledCount > 0) {
            throw new IllegalStateException("Cannot delete. Customer has " + unsettledCount + " unsettled invoices.");
        }

        // Use trash system to archive and delete
        trashCreditCustomerService.archiveAndDelete(id, "Deleted via API", null);
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getCustomerSummary(Long id) {
        CreditCustomer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));

        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("creditLimit", customer.getCreditLimit());
        summary.put("outstandingBalance", customer.getOutstandingBalance());
        summary.put("availableCredit", customer.getAvailableCredit());
        summary.put("totalPaid", customer.getTotalPaid());
        summary.put("totalPurchases", customer.getTotalPurchases());
        summary.put("lastPaymentDate", customer.getLastPaymentDate());
        summary.put("paymentTermsDays", customer.getPaymentTermsDays());
        summary.put("authorizedThreshold", customer.getAuthorizedThreshold());
        summary.put("status", customer.getStatus());

        return summary;
    }

    @Transactional(readOnly = true)
    public List<com.grocersmart.dto.SalesRecordDto> getCustomerInvoices(Long customerId,
            com.grocersmart.entity.SalesRecord.PaymentStatus status) {
        List<com.grocersmart.entity.SalesRecord> records;
        if (status != null) {
            records = salesRecordRepository.findByCreditCustomerIdAndPaymentStatus(customerId, status);
        } else {
            records = salesRecordRepository.findByCreditCustomerId(customerId);
        }
        return records.stream().map(this::mapToSalesDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CreditPaymentDto> getCustomerPayments(Long customerId) {
        return paymentRepository.findByCustomerId(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public com.grocersmart.dto.CreditPaymentResponseDto addPayment(Long customerId, CreditPaymentDto dto) {
        CreditCustomer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));

        if (dto.getAmount() == null || dto.getAmount() <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }

        double previousBalance = customer.getOutstandingBalance() != null ? customer.getOutstandingBalance() : 0.0;

        if (dto.getAmount() > previousBalance) {
            throw new IllegalArgumentException(
                    "Payment amount cannot exceed outstanding balance (₹" + previousBalance + ")");
        }

        CreditPayment payment = new CreditPayment();
        payment.setCustomerId(customerId);
        payment.setAmount(dto.getAmount());
        payment.setNote(dto.getNote());
        payment.setPaymentDate(LocalDateTime.now());

        paymentRepository.save(payment);

        // Update balance (Payment reduces debt)
        customer.updateBalance(previousBalance - dto.getAmount());

        // Update total paid and last payment date
        double totalPaid = (customer.getTotalPaid() != null ? customer.getTotalPaid() : 0.0) + dto.getAmount();
        customer.setTotalPaid(totalPaid);
        customer.setLastPaymentDate(java.time.LocalDate.now());

        // Update linked invoice if provided
        if (dto.getInvoiceId() != null) {
            com.grocersmart.entity.SalesRecord invoice = salesRecordRepository.findById(dto.getInvoiceId())
                    .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + dto.getInvoiceId()));

            BigDecimal currentPaid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO;
            BigDecimal newPaid = currentPaid.add(BigDecimal.valueOf(dto.getAmount()));
            invoice.setPaidAmount(newPaid);

            if (newPaid.compareTo(invoice.getTotalRevenue()) >= 0) {
                invoice.setPaymentStatus(com.grocersmart.entity.SalesRecord.PaymentStatus.PAID);
            } else if (newPaid.compareTo(BigDecimal.ZERO) > 0) {
                invoice.setPaymentStatus(com.grocersmart.entity.SalesRecord.PaymentStatus.PARTIAL);
            }
            salesRecordRepository.save(invoice);
        }

        customerRepository.save(customer);

        return com.grocersmart.dto.CreditPaymentResponseDto.builder()
                .customerId(customer.getId())
                .paidAmount(dto.getAmount())
                .previousOutstanding(previousBalance)
                .newOutstanding(customer.getOutstandingBalance())
                .message("Payment recorded successfully" + (dto.getInvoiceId() != null ? " and invoice updated" : ""))
                .build();
    }

    @Transactional(readOnly = true)
    public List<com.grocersmart.dto.SalesRecordDto> getCustomerSales(Long customerId) {
        return salesRecordRepository.findByCreditCustomerId(customerId).stream()
                .map(this::mapToSalesDto)
                .collect(Collectors.toList());
    }

    private com.grocersmart.dto.SalesRecordDto mapToSalesDto(com.grocersmart.entity.SalesRecord s) {
        com.grocersmart.dto.SalesRecordDto dto = new com.grocersmart.dto.SalesRecordDto();
        dto.setId(s.getId());
        dto.setInvoiceId(s.getInvoiceId());
        dto.setSalesDate(s.getSalesDate());
        dto.setTotalRevenue(s.getTotalRevenue());
        dto.setTotalItemsSold(s.getTotalItemsSold());
        dto.setPaymentMethod(s.getPaymentMethod());
        dto.setNote(s.getNote());
        return dto;
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Double> getSummary() {
        List<CreditCustomer> customers = customerRepository.findAll();
        double totalLimit = customers.stream().mapToDouble(c -> c.getCreditLimit() != null ? c.getCreditLimit() : 0.0)
                .sum();
        double totalOutstanding = customers.stream()
                .mapToDouble(c -> c.getOutstandingBalance() != null ? c.getOutstandingBalance() : 0.0).sum();

        java.util.Map<String, Double> summary = new java.util.HashMap<>();
        summary.put("totalLimit", totalLimit);
        summary.put("totalOutstanding", totalOutstanding);
        summary.put("totalAvailable", Math.max(0.0, totalLimit - totalOutstanding));
        return summary;
    }

    private CreditCustomerDto mapToDto(CreditCustomer c) {
        CreditCustomerDto dto = new CreditCustomerDto();
        dto.setId(c.getId());
        dto.setPublicId(c.getPublicId());
        dto.setName(c.getName());
        dto.setPhone(c.getPhone());
        dto.setAddress(c.getAddress());
        dto.setCreditLimit(c.getCreditLimit());
        dto.setOutstandingBalance(c.getOutstandingBalance());

        // Safety: Calculate correctly: limit - balance, min 0
        double limit = c.getCreditLimit() != null ? c.getCreditLimit() : 0.0;
        double balance = c.getOutstandingBalance() != null ? c.getOutstandingBalance() : 0.0;
        dto.setAvailableCredit(Math.max(0.0, limit - balance));

        dto.setStatus(c.getStatus());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());

        // Professional Finance Fields
        dto.setPaymentTermsDays(c.getPaymentTermsDays());
        dto.setAuthorizedThreshold(c.getAuthorizedThreshold());
        dto.setTotalPurchases(c.getTotalPurchases());
        dto.setTotalPaid(c.getTotalPaid());
        dto.setLastPaymentDate(c.getLastPaymentDate());
        dto.setCustomerType(c.getCustomerType());

        return dto;
    }

    private void mapToEntity(CreditCustomerDto dto, CreditCustomer c) {
        c.setName(dto.getName());
        c.setPhone(dto.getPhone());
        c.setAddress(dto.getAddress());
        if (dto.getCreditLimit() != null)
            c.setCreditLimit(dto.getCreditLimit());
        if (dto.getOutstandingBalance() != null)
            c.setOutstandingBalance(dto.getOutstandingBalance());

        // Sync availableCredit correctly: limit - balance, min 0
        double limit = c.getCreditLimit() != null ? c.getCreditLimit() : 0.0;
        double balance = c.getOutstandingBalance() != null ? c.getOutstandingBalance() : 0.0;
        c.setAvailableCredit(Math.max(0.0, limit - balance));

        if (dto.getStatus() != null)
            c.setStatus(dto.getStatus());

        if (dto.getPaymentTermsDays() != null)
            c.setPaymentTermsDays(dto.getPaymentTermsDays());
        if (dto.getAuthorizedThreshold() != null)
            c.setAuthorizedThreshold(dto.getAuthorizedThreshold());
        if (dto.getCustomerType() != null)
            c.setCustomerType(dto.getCustomerType());
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
