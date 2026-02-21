package com.grocersmart.service;

import com.grocersmart.dto.SupplierDto;
import com.grocersmart.entity.Supplier;
import com.grocersmart.repository.SupplierRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final TrashSupplierService trashSupplierService;
    private final PublicIdGeneratorService publicIdGeneratorService;

    public SupplierDto createSupplier(SupplierDto dto) {
        Supplier supplier = new Supplier();
        mapToEntity(dto, supplier);
        supplier.setPublicId(publicIdGeneratorService.nextId(com.grocersmart.common.EntityType.SUPPLIER));
        supplier.setStatus(Supplier.Status.ACTIVE);
        return mapToDto(supplierRepository.save(supplier));
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<SupplierDto> getSuppliers(
            org.springframework.data.jpa.domain.Specification<Supplier> spec,
            org.springframework.data.domain.Pageable pageable) {
        return supplierRepository.findAll(spec, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<SupplierDto> getAllSuppliers(Supplier.Status status) {
        Supplier.Status filterStatus = (status != null) ? status : Supplier.Status.ACTIVE;
        return supplierRepository.findByStatus(filterStatus).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SupplierDto updateSupplier(Long id, SupplierDto dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found"));
        mapToEntity(dto, supplier);
        if (dto.getStatus() != null) {
            supplier.setStatus(dto.getStatus());
        }
        return mapToDto(supplierRepository.save(supplier));
    }

    @Transactional(readOnly = true)
    public SupplierDto getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found"));
    }

    @Transactional(readOnly = true)
    public SupplierDto getSupplierByPublicId(String publicId) {
        return supplierRepository.findByPublicId(publicId)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with publicId: " + publicId));
    }

    public void deleteSupplier(Long id) {
        // Use trash system to archive and delete
        trashSupplierService.archiveAndDelete(id, "Deleted via API", null);
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Long> getSummary() {
        java.util.Map<String, Long> summary = new java.util.HashMap<>();
        summary.put("total", supplierRepository.count());
        summary.put("active",
                supplierRepository.findAll().stream().filter(s -> s.getStatus() == Supplier.Status.ACTIVE).count());
        summary.put("inactive",
                supplierRepository.findAll().stream().filter(s -> s.getStatus() == Supplier.Status.INACTIVE).count());
        return summary;
    }

    private SupplierDto mapToDto(Supplier s) {
        SupplierDto dto = new SupplierDto();
        dto.setId(s.getId());
        dto.setPublicId(s.getPublicId());
        dto.setName(s.getName());
        dto.setPhone(s.getPhone());
        dto.setAddress(s.getAddress());
        dto.setEmail(s.getEmail());
        dto.setStatus(s.getStatus());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());
        return dto;
    }

    private void mapToEntity(SupplierDto dto, Supplier s) {
        s.setName(dto.getName());
        s.setPhone(dto.getPhone());
        s.setAddress(dto.getAddress());
        s.setEmail(dto.getEmail());
    }
}
