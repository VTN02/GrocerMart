package com.grocersmart.service;

import com.grocersmart.dto.OrderDto;
import com.grocersmart.dto.OrderItemDto;
import com.grocersmart.entity.Order;
import com.grocersmart.entity.OrderItem;
import com.grocersmart.entity.Product;
import com.grocersmart.repository.OrderItemRepository;
import com.grocersmart.repository.OrderRepository;
import com.grocersmart.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    public OrderDto createOrder(OrderDto dto) {
        Order order = new Order();
        order.setInvoiceNo(dto.getInvoiceNo());
        order.setPaymentType(dto.getPaymentType());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Order.Status.DRAFT);
        // Items are typically added separately or could be processed here.
        // For simplicity, create empty order then add items.
        return mapToDto(orderRepository.save(order));
    }

    public OrderDto getOrderById(Long id) {
        return orderRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
    }

    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public OrderItemDto addItem(Long orderId, OrderItemDto itemDto) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        if (order.getStatus() != Order.Status.DRAFT) {
            throw new IllegalStateException("Cannot add items to non-DRAFT order");
        }

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProductId(itemDto.getProductId());
        item.setQty(itemDto.getQty());
        item.setUnitPrice(itemDto.getUnitPrice());
        item.setLineTotal(item.getQty() * item.getUnitPrice());

        return mapToItemDto(orderItemRepository.save(item));
    }

    public List<OrderItemDto> getOrderItems(Long orderId) {
        return orderItemRepository.findByOrderId(orderId).stream()
                .map(this::mapToItemDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDto confirmOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        if (order.getStatus() != Order.Status.DRAFT) {
            throw new IllegalStateException("Order already confirmed or void");
        }

        double total = 0;
        for (OrderItem item : order.getItems()) {
            total += item.getLineTotal();

            // Stock reduction logic (implied for professionalism)
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found: " + item.getProductId()));
            if (product.getUnitQty() < item.getQty()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }
            product.setUnitQty(product.getUnitQty() - item.getQty());
            productRepository.save(product);
        }

        order.setTotalAmount(total);
        order.setStatus(Order.Status.CONFIRMED);
        return mapToDto(orderRepository.save(order));
    }

    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        order.setStatus(Order.Status.VOID);
        orderRepository.save(order);
    }

    private OrderDto mapToDto(Order o) {
        OrderDto dto = new OrderDto();
        dto.setId(o.getId());
        dto.setInvoiceNo(o.getInvoiceNo());
        dto.setOrderDate(o.getOrderDate());
        dto.setPaymentType(o.getPaymentType());
        dto.setStatus(o.getStatus());
        dto.setTotalAmount(o.getTotalAmount());
        if (o.getItems() != null) {
            dto.setItems(o.getItems().stream().map(this::mapToItemDto).collect(Collectors.toList()));
        }
        dto.setCreatedAt(o.getCreatedAt());
        dto.setUpdatedAt(o.getUpdatedAt());
        return dto;
    }

    private OrderItemDto mapToItemDto(OrderItem i) {
        OrderItemDto dto = new OrderItemDto();
        dto.setId(i.getId());
        dto.setOrderId(i.getOrder().getId());
        dto.setProductId(i.getProductId());
        dto.setQty(i.getQty());
        dto.setUnitPrice(i.getUnitPrice());
        dto.setLineTotal(i.getLineTotal());
        return dto;
    }
}
