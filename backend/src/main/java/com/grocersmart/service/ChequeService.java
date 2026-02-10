package com.grocersmart.service;

import com.grocersmart.dto.ChequeDto;
import com.grocersmart.entity.Cheque;
import com.grocersmart.entity.CreditCustomer;
import com.grocersmart.repository.ChequeRepository;
import com.grocersmart.repository.CreditCustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChequeService {

    private final ChequeRepository chequeRepository;
    private final CreditCustomerRepository customerRepository;

    public ChequeDto createCheque(ChequeDto dto) {
        Cheque cheque = new Cheque();
        mapToEntity(dto, cheque);
        cheque.setStatus(Cheque.Status.PENDING); // Default
        if (dto.getStatus() != null)
            cheque.setStatus(dto.getStatus());
        return mapToDto(chequeRepository.save(cheque));
    }

    public List<ChequeDto> getAllCheques() {
        return chequeRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ChequeDto getChequeById(Long id) {
        return chequeRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Cheque not found"));
    }

    public ChequeDto updateCheque(Long id, ChequeDto dto) {
        Cheque cheque = chequeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cheque not found"));
        mapToEntity(dto, cheque);
        return mapToDto(chequeRepository.save(cheque));
    }

    @Transactional
    public ChequeDto updateStatus(Long id, Cheque.Status newStatus) {
        Cheque cheque = chequeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cheque not found"));

        // Business logic: if becoming BOUNCED and customerId exists
        if (newStatus == Cheque.Status.BOUNCED && cheque.getCustomerId() != null) {
            // Only update balance if it wasn't already bounced (avoid double charge)
            if (cheque.getStatus() != Cheque.Status.BOUNCED) {
                CreditCustomer customer = customerRepository.findById(cheque.getCustomerId())
                        .orElseThrow(() -> new EntityNotFoundException("Customer not found for cheque"));

                double current = customer.getOutstandingBalance() != null ? customer.getOutstandingBalance() : 0.0;
                customer.setOutstandingBalance(current + cheque.getAmount());
                customerRepository.save(customer);
            }
        }

        cheque.setStatus(newStatus);
        return mapToDto(chequeRepository.save(cheque));
    }

    public void deleteCheque(Long id) {
        Cheque cheque = chequeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cheque not found"));

        if (cheque.getStatus() != Cheque.Status.PENDING) {
            throw new IllegalStateException("Cannot delete cheque unless status is PENDING");
        }
        chequeRepository.delete(cheque);
    }

    private ChequeDto mapToDto(Cheque c) {
        ChequeDto dto = new ChequeDto();
        dto.setId(c.getId());
        dto.setChequeNumber(c.getChequeNumber());
        dto.setCustomerId(c.getCustomerId());
        dto.setBankName(c.getBankName());
        dto.setAmount(c.getAmount());
        dto.setIssueDate(c.getIssueDate());
        dto.setDueDate(c.getDueDate());
        dto.setStatus(c.getStatus());
        dto.setNote(c.getNote());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }

    private void mapToEntity(ChequeDto dto, Cheque c) {
        c.setChequeNumber(dto.getChequeNumber());
        c.setCustomerId(dto.getCustomerId());
        c.setBankName(dto.getBankName());
        if (dto.getAmount() != null)
            c.setAmount(dto.getAmount());
        c.setIssueDate(dto.getIssueDate());
        c.setDueDate(dto.getDueDate());
        if (dto.getNote() != null)
            c.setNote(dto.getNote());
    }
}
