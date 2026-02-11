package com.grocersmart.service;

import com.grocersmart.dto.SupplierDto;
import com.grocersmart.entity.Supplier;
import com.grocersmart.repository.SupplierRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final TrashSupplierService trashSupplierService;

    public SupplierDto createSupplier(SupplierDto dto) {
        Supplier supplier = new Supplier();
        mapToEntity(dto, supplier);
        supplier.setStatus(Supplier.Status.ACTIVE);
        return mapToDto(supplierRepository.save(supplier));
    }

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

    public SupplierDto getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found"));
    }

    public void deleteSupplier(Long id) {
        // Use trash system to archive and delete
        trashSupplierService.archiveAndDelete(id, "Deleted via API", null);
    }

    private SupplierDto mapToDto(Supplier s) {
        SupplierDto dto = new SupplierDto();
        dto.setId(s.getId());
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
