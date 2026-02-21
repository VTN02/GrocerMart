package com.grocersmart.service;

import com.grocersmart.dto.*;
import com.grocersmart.entity.CreditCustomer;
import com.grocersmart.entity.Product;
import com.grocersmart.entity.SalesItem;
import com.grocersmart.entity.SalesRecord;
import com.grocersmart.repository.CreditCustomerRepository;
import com.grocersmart.repository.ProductRepository;
import com.grocersmart.repository.SalesItemRepository;
import com.grocersmart.repository.SalesRecordRepository;
import com.grocersmart.exception.CreditLimitExceededException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalesService {

    private final SalesRecordRepository salesRecordRepository;
    private final SalesItemRepository salesItemRepository;
    private final ProductRepository productRepository;
    private final CreditCustomerRepository creditCustomerRepository;
    private final TrashSalesService trashSalesService; // Added trash service
    private final PublicIdGeneratorService publicIdGeneratorService;

    @Autowired
    public SalesService(SalesRecordRepository salesRecordRepository,
            SalesItemRepository salesItemRepository,
            ProductRepository productRepository,
            CreditCustomerRepository creditCustomerRepository,
            TrashSalesService trashSalesService,
            PublicIdGeneratorService publicIdGeneratorService) {
        this.salesRecordRepository = salesRecordRepository;
        this.salesItemRepository = salesItemRepository;
        this.productRepository = productRepository;
        this.creditCustomerRepository = creditCustomerRepository;
        this.trashSalesService = trashSalesService;
        this.publicIdGeneratorService = publicIdGeneratorService;
    }

    // CREATE (Unchanged)
    @Transactional
    public SalesRecordDto createSalesRecord(SalesRecordDto dto) {
        SalesRecord record = new SalesRecord();

        // Generate Invoice ID
        Long nextVal = salesRecordRepository.getNextInvoiceSequence();
        salesRecordRepository.incrementInvoiceSequence();
        String invoiceId = String.format("#%04d", nextVal);
        record.setInvoiceId(invoiceId);
        record.setPublicId(publicIdGeneratorService.nextId(com.grocersmart.common.EntityType.SALE));

        record.setSalesDate(dto.getSalesDate());
        record.setNote(dto.getNote());

        SalesRecord.PaymentMethod method = dto.getPaymentMethod() != null ? dto.getPaymentMethod()
                : SalesRecord.PaymentMethod.CASH;
        record.setPaymentMethod(method);

        List<SalesItem> items = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        int totalItemsSold = 0;

        if (dto.getItems() != null) {
            for (SalesItemDto itemDto : dto.getItems()) {
                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new EntityNotFoundException(
                                "Product not found with ID: " + itemDto.getProductId()));

                SalesItem item = new SalesItem();
                item.setProduct(product);
                item.setQtySold(itemDto.getQtySold());
                item.setUnitPrice(itemDto.getUnitPrice());

                BigDecimal lineTotal = itemDto.getUnitPrice().multiply(new BigDecimal(itemDto.getQtySold()));
                item.setLineTotal(lineTotal);

                item.setSalesRecord(record);
                items.add(item);

                totalRevenue = totalRevenue.add(lineTotal);
                totalItemsSold += itemDto.getQtySold();
            }
        }

        record.setItems(items);
        record.setTotalRevenue(totalRevenue);
        record.setTotalItemsSold(totalItemsSold);

        if (method == SalesRecord.PaymentMethod.CREDIT) {
            if (dto.getCreditCustomerId() != null) {
                CreditCustomer customer = creditCustomerRepository.findById(dto.getCreditCustomerId())
                        .orElseThrow(() -> new EntityNotFoundException("Credit Customer not found"));

                double currentBalance = customer.getOutstandingBalance() != null ? customer.getOutstandingBalance()
                        : 0.0;
                double newBalance = currentBalance + totalRevenue.doubleValue();

                if (newBalance > customer.getCreditLimit()) {
                    throw new CreditLimitExceededException(
                            "Credit limit exceeded",
                            customer.getCreditLimit(),
                            currentBalance,
                            totalRevenue.doubleValue());
                }

                record.setCreditCustomer(customer);
                customer.updateBalance(newBalance);
                creditCustomerRepository.save(customer);
            } else {
                throw new IllegalArgumentException("Credit Customer is required for CREDIT sales");
            }
        }

        SalesRecord savedRecord = salesRecordRepository.save(record);
        return mapToDto(savedRecord);
    }

    // UPDATE (Unchanged)
    @Transactional
    public SalesRecordDto updateSalesRecord(Long id, SalesRecordDto dto) {
        SalesRecord record = salesRecordRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sales record not found with ID: " + id));

        BigDecimal oldRevenue = record.getTotalRevenue();
        SalesRecord.PaymentMethod oldMethod = record.getPaymentMethod();
        CreditCustomer oldCustomer = record.getCreditCustomer();

        record.setSalesDate(dto.getSalesDate());
        record.setNote(dto.getNote());
        if (dto.getPaymentMethod() != null) {
            record.setPaymentMethod(dto.getPaymentMethod());
        }

        record.getItems().clear();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        int totalItemsSold = 0;

        if (dto.getItems() != null) {
            for (SalesItemDto itemDto : dto.getItems()) {
                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new EntityNotFoundException(
                                "Product not found with ID: " + itemDto.getProductId()));

                SalesItem item = new SalesItem();
                item.setProduct(product);
                item.setQtySold(itemDto.getQtySold());
                item.setUnitPrice(itemDto.getUnitPrice());

                BigDecimal lineTotal = itemDto.getUnitPrice().multiply(new BigDecimal(itemDto.getQtySold()));
                item.setLineTotal(lineTotal);

                item.setSalesRecord(record);
                record.getItems().add(item);

                totalRevenue = totalRevenue.add(lineTotal);
                totalItemsSold += itemDto.getQtySold();
            }
        }

        record.setTotalRevenue(totalRevenue);
        record.setTotalItemsSold(totalItemsSold);

        if (oldMethod == SalesRecord.PaymentMethod.CREDIT && oldCustomer != null) {
            oldCustomer.updateBalance(oldCustomer.getOutstandingBalance() - oldRevenue.doubleValue());
            creditCustomerRepository.save(oldCustomer);
        }

        if (record.getPaymentMethod() == SalesRecord.PaymentMethod.CREDIT) {
            Long customerId = dto.getCreditCustomerId() != null ? dto.getCreditCustomerId()
                    : (oldCustomer != null ? oldCustomer.getId() : null);

            if (customerId != null) {
                CreditCustomer newCustomer = creditCustomerRepository.findById(customerId)
                        .orElseThrow(() -> new EntityNotFoundException("Credit Customer not found"));

                double currentBalance = newCustomer.getOutstandingBalance() != null
                        ? newCustomer.getOutstandingBalance()
                        : 0.0;
                double newBalance = currentBalance + totalRevenue.doubleValue();

                if (newBalance > newCustomer.getCreditLimit()) {
                    throw new CreditLimitExceededException(
                            "Credit limit exceeded",
                            newCustomer.getCreditLimit(),
                            currentBalance,
                            totalRevenue.doubleValue());
                }

                record.setCreditCustomer(newCustomer);
                newCustomer.updateBalance(newBalance);
                creditCustomerRepository.save(newCustomer);
            } else {
                throw new IllegalArgumentException("Credit Customer is required for CREDIT sales");
            }
        } else {
            record.setCreditCustomer(null);
        }

        SalesRecord updatedRecord = salesRecordRepository.save(record);
        return mapToDto(updatedRecord);
    }

    // DELETE (Modified for Recycle Bin)
    @Transactional
    public void deleteSalesRecord(Long id) {
        SalesRecord record = salesRecordRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sales record not found with ID: " + id));

        // Revert Credit Balance BEFORE moving to trash
        if (record.getPaymentMethod() == SalesRecord.PaymentMethod.CREDIT && record.getCreditCustomer() != null) {
            CreditCustomer customer = record.getCreditCustomer();
            customer.updateBalance(customer.getOutstandingBalance() - record.getTotalRevenue().doubleValue());
            creditCustomerRepository.save(customer);
        }

        // Move to Trash using new service logic
        trashSalesService.moveToTrash(record);
    }

    // READ ONE (Unchanged)
    @Transactional(readOnly = true)
    public SalesRecordDto getSalesRecord(Long id) {
        SalesRecord record = salesRecordRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sales record not found with ID: " + id));
        return mapToDto(record);
    }

    @Transactional(readOnly = true)
    public SalesRecordDto getSalesRecordByPublicId(String publicId) {
        SalesRecord record = salesRecordRepository.findByPublicId(publicId)
                .orElseThrow(() -> new EntityNotFoundException("Sales record not found with publicId: " + publicId));
        return mapToDto(record);
    }

    // READ ALL (Unchanged)
    // READ ALL (Modified)
    @Transactional(readOnly = true)
    public Page<SalesRecordDto> getSalesRecords(String search, SalesRecord.PaymentMethod method, LocalDate from,
            LocalDate to, Pageable pageable) {
        return salesRecordRepository.findAll(
                com.grocersmart.specification.SalesSpecification.filterBy(search, method, from, to),
                pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<SalesRecordDto> getAllSalesRecords() {
        return salesRecordRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // ANALYTICS (Unchanged)
    @Transactional(readOnly = true)
    public List<DailySalesStatsDto> getDailySalesStats(LocalDate from, LocalDate to) {
        return salesRecordRepository.getDailySalesStats(from, to);
    }

    @Transactional(readOnly = true)
    public List<TopProductStatsDto> getTopProducts(LocalDate from, LocalDate to, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return salesItemRepository.getTopSellingProducts(from, to, pageable);
    }

    private SalesRecordDto mapToDto(SalesRecord entity) {
        SalesRecordDto dto = new SalesRecordDto();
        dto.setId(entity.getId());
        dto.setPublicId(entity.getPublicId());
        dto.setInvoiceId(entity.getInvoiceId());
        dto.setSalesDate(entity.getSalesDate());
        dto.setTotalRevenue(entity.getTotalRevenue());
        dto.setTotalItemsSold(entity.getTotalItemsSold());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setNote(entity.getNote());

        if (entity.getCreditCustomer() != null) {
            dto.setCreditCustomerId(entity.getCreditCustomer().getId());
        }

        List<SalesItemDto> itemDtos = entity.getItems().stream().map(item -> {
            SalesItemDto itemDto = new SalesItemDto();
            itemDto.setId(item.getId());
            itemDto.setSalesRecordId(entity.getId());
            itemDto.setProductId(item.getProduct().getId());
            itemDto.setProductName(item.getProduct().getName());
            itemDto.setQtySold(item.getQtySold());
            itemDto.setUnitPrice(item.getUnitPrice());
            itemDto.setLineTotal(item.getLineTotal());
            return itemDto;
        }).collect(Collectors.toList());

        dto.setItems(itemDtos);
        return dto;
    }
}
