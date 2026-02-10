package com.grocersmart.service;

import com.grocersmart.dto.PurchaseOrderDto;
import com.grocersmart.dto.PurchaseOrderItemDto;
import com.grocersmart.entity.Product;
import com.grocersmart.entity.PurchaseOrder;
import com.grocersmart.entity.PurchaseOrderItem;
import com.grocersmart.repository.ProductRepository;
import com.grocersmart.repository.PurchaseOrderItemRepository;
import com.grocersmart.repository.PurchaseOrderRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepository;
    private final PurchaseOrderItemRepository poiRepository;
    private final ProductRepository productRepository;

    public PurchaseOrderDto createPO(PurchaseOrderDto dto) {
        PurchaseOrder po = new PurchaseOrder();
        po.setSupplierId(dto.getSupplierId());
        po.setPoDate(LocalDateTime.now());
        po.setStatus(PurchaseOrder.Status.CREATED);
        return mapToDto(poRepository.save(po));
    }

    public List<PurchaseOrderDto> getAllPOs() {
        return poRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PurchaseOrderDto getPOById(Long id) {
        return poRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("PO not found"));
    }

    public PurchaseOrderItemDto addItem(Long poId, PurchaseOrderItemDto itemDto) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new EntityNotFoundException("PO not found"));

        PurchaseOrderItem item = new PurchaseOrderItem();
        item.setPurchaseOrder(po);
        item.setProductId(itemDto.getProductId());
        item.setQty(itemDto.getQty());
        item.setUnitCost(itemDto.getUnitCost());
        item.setLineTotal(item.getQty() * item.getUnitCost());

        return mapToItemDto(poiRepository.save(item));
    }

    public List<PurchaseOrderItemDto> getItems(Long poId) {
        return poiRepository.findByPurchaseOrderId(poId).stream()
                .map(this::mapToItemDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PurchaseOrderDto receivePO(Long id) {
        PurchaseOrder po = poRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PO not found"));

        if (po.getStatus() == PurchaseOrder.Status.RECEIVED) {
            throw new IllegalStateException("PO already received");
        }

        double total = 0;
        for (PurchaseOrderItem item : po.getItems()) {
            total += item.getLineTotal();

            // Increase Stock
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found: " + item.getProductId()));

            product.setUnitQty(product.getUnitQty() + item.getQty());
            productRepository.save(product);
        }

        po.setTotalAmount(total);
        po.setStatus(PurchaseOrder.Status.RECEIVED);
        return mapToDto(poRepository.save(po));
    }

    private PurchaseOrderDto mapToDto(PurchaseOrder po) {
        PurchaseOrderDto dto = new PurchaseOrderDto();
        dto.setId(po.getId());
        dto.setSupplierId(po.getSupplierId());
        dto.setPoDate(po.getPoDate());
        dto.setStatus(po.getStatus());
        dto.setTotalAmount(po.getTotalAmount());
        if (po.getItems() != null) {
            dto.setItems(po.getItems().stream().map(this::mapToItemDto).collect(Collectors.toList()));
        }
        dto.setCreatedAt(po.getCreatedAt());
        dto.setUpdatedAt(po.getUpdatedAt());
        return dto;
    }

    private PurchaseOrderItemDto mapToItemDto(PurchaseOrderItem item) {
        PurchaseOrderItemDto dto = new PurchaseOrderItemDto();
        dto.setId(item.getId());
        dto.setPurchaseOrderId(item.getPurchaseOrder().getId());
        dto.setProductId(item.getProductId());
        dto.setQty(item.getQty());
        dto.setUnitCost(item.getUnitCost());
        dto.setLineTotal(item.getLineTotal());
        return dto;
    }
}
