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
    public ResponseEntity<ApiResponse<List<OrderDto>>> getAllOrders(@RequestParam(required = false) Long id) {
        if (id != null) {
            try {
                OrderDto order = orderService.getOrderById(id);
                return ResponseEntity.ok(ApiResponse.success(java.util.Collections.singletonList(order),
                        "Order retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity.ok(ApiResponse.success(java.util.Collections.emptyList(), "Order not found"));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders(), "Orders retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id), "Order retrieved successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<OrderDto>> searchOrder(@RequestParam Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id), "Order found"));
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
