package com.grocersmart.controller;

import com.grocersmart.dto.ApiResponse;
import com.grocersmart.dto.OrderDto;
import com.grocersmart.dto.OrderItemDto;
import com.grocersmart.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(@RequestBody OrderDto dto) {
        OrderDto created = orderService.createOrder(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "Order created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<OrderDto>>> getOrders(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String publicId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) com.grocersmart.entity.Order.Status status,
            @RequestParam(required = false) com.grocersmart.entity.Order.PaymentType paymentType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        String[] sortParts = sort.split(",");
        org.springframework.data.domain.Sort sortObj = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc")
                ? org.springframework.data.domain.Sort.by(sortParts[0]).descending()
                : org.springframework.data.domain.Sort.by(sortParts[0]).ascending();

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sortObj);

        if (id != null) {
            try {
                OrderDto order = orderService.getOrderById(id);
                return ResponseEntity.ok(ApiResponse.success(
                        new org.springframework.data.domain.PageImpl<>(java.util.Collections.singletonList(order),
                                pageable, 1),
                        "Order retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity.ok(
                        ApiResponse.success(org.springframework.data.domain.Page.empty(pageable), "Order not found"));
            }
        }
        if (publicId != null) {
            try {
                OrderDto order = orderService.getOrderByPublicId(publicId);
                return ResponseEntity.ok(ApiResponse.success(
                        new org.springframework.data.domain.PageImpl<>(java.util.Collections.singletonList(order),
                                pageable, 1),
                        "Order retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity.ok(
                        ApiResponse.success(org.springframework.data.domain.Page.empty(pageable), "Order not found"));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getOrders(search, status, paymentType, pageable),
                "Orders retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id), "Order retrieved successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<OrderDto>> searchOrder(@RequestParam(required = false) Long id,
            @RequestParam(required = false) String publicId) {
        OrderDto order = null;
        if (id != null) {
            order = orderService.getOrderById(id);
        } else if (publicId != null) {
            order = orderService.getOrderByPublicId(publicId);
        }
        if (order == null) {
            throw new jakarta.persistence.EntityNotFoundException("Order not found");
        }
        return ResponseEntity.ok(ApiResponse.success(order, "Order found"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Order deleted successfully"));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<ApiResponse<OrderItemDto>> addItem(@PathVariable Long id, @RequestBody OrderItemDto itemDto) {
        OrderItemDto added = orderService.addItem(id, itemDto);
        return ResponseEntity.ok(ApiResponse.success(added, "Item added successfully"));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<ApiResponse<List<OrderItemDto>>> getItems(@PathVariable Long id) {
        return ResponseEntity
                .ok(ApiResponse.success(orderService.getOrderItems(id), "Order items retrieved successfully"));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<OrderDto>> confirmOrder(@PathVariable Long id) {
        OrderDto confirmed = orderService.confirmOrder(id);
        return ResponseEntity.ok(ApiResponse.success(confirmed, "Order confirmed successfully"));
    }
}
