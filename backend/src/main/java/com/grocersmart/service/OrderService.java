package com.grocersmart.service;

import com.grocersmart.dto.OrderDto;
import com.grocersmart.dto.OrderItemDto;
import com.grocersmart.dto.SalesItemDto;
import com.grocersmart.dto.SalesRecordDto;
import com.grocersmart.entity.CreditCustomer;
import com.grocersmart.entity.Order;
import com.grocersmart.entity.OrderItem;
import com.grocersmart.entity.Product;
import com.grocersmart.entity.SalesRecord;
import com.grocersmart.repository.CreditCustomerRepository;
import com.grocersmart.repository.OrderItemRepository;
import com.grocersmart.repository.OrderRepository;
import com.grocersmart.repository.ProductRepository;
import com.grocersmart.repository.SalesRecordRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final CreditCustomerRepository creditCustomerRepository;
    private final SalesService salesService;
    private final SalesRecordRepository salesRecordRepository;
    private final TrashOrderService trashOrderService; // Add TrashService
    private final PublicIdGeneratorService publicIdGeneratorService;

    @Transactional
    public OrderDto createOrder(OrderDto dto) {
        Order order = new Order();
        order.setInvoiceNo(dto.getInvoiceNo());
        order.setPublicId(publicIdGeneratorService.nextId(com.grocersmart.common.EntityType.ORDER));
        order.setPaymentType(dto.getPaymentType());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Order.Status.DRAFT);

        if (dto.getPaymentType() == Order.PaymentType.CREDIT) {
            if (dto.getCreditCustomerId() == null) {
                throw new IllegalArgumentException("Credit Customer is required for CREDIT payments");
            }
            CreditCustomer customer = creditCustomerRepository.findById(dto.getCreditCustomerId())
                    .orElseThrow(() -> new EntityNotFoundException("Credit Customer not found"));
            order.setCreditCustomer(customer);
        }

        Order savedOrder = orderRepository.save(order);

        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            for (OrderItemDto itemDto : dto.getItems()) {
                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new EntityNotFoundException("Product not found: " + itemDto.getProductId()));

                OrderItem item = new OrderItem();
                item.setOrder(savedOrder);
                item.setProductId(itemDto.getProductId());
                item.setQty(itemDto.getQty());
                item.setUnitPrice(itemDto.getUnitPrice());
                item.setLineTotal(item.getQty() * item.getUnitPrice());
                orderItemRepository.save(item);
            }
        }

        return mapToDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long id) {
        return orderRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderByPublicId(String publicId) {
        return orderRepository.findByPublicId(publicId)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with publicId: " + publicId));
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getOrders(String search, Order.Status status, Order.PaymentType paymentType,
            Pageable pageable) {
        return orderRepository.findAll(
                com.grocersmart.specification.OrderSpecification.filterBy(search, status, paymentType),
                pageable).map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderItemDto addItem(Long orderId, OrderItemDto itemDto) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        if (order.getStatus() != Order.Status.DRAFT) {
            throw new IllegalStateException("Cannot add items to non-DRAFT order");
        }

        Product product = productRepository.findById(itemDto.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        if (product.getUnitQty() < itemDto.getQty()) {
            throw new IllegalArgumentException("Insufficient stock. Available: " + product.getUnitQty());
        }

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProductId(itemDto.getProductId());
        // item.setProduct(product); // Link if needed in entity
        item.setQty(itemDto.getQty());
        item.setUnitPrice(itemDto.getUnitPrice());
        item.setLineTotal(item.getQty() * item.getUnitPrice());

        return mapToItemDto(orderItemRepository.save(item));
    }

    @Transactional(readOnly = true)
    public List<OrderItemDto> getOrderItems(Long orderId) {
        return orderItemRepository.findByOrderId(orderId).stream()
                .map(this::mapToItemDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDto confirmOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with ID: " + id));

        if (order.getStatus() != Order.Status.DRAFT) {
            throw new IllegalStateException("Order already confirmed or void");
        }

        double totalAmount = 0;
        List<OrderItem> items = order.getItems();
        if (items.isEmpty()) {
            throw new IllegalStateException("Cannot confirm empty order");
        }

        for (OrderItem item : items) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found: " + item.getProductId()));

            if (product.getUnitQty() < item.getQty()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }

            product.setUnitQty(product.getUnitQty() - item.getQty());
            productRepository.save(product);

            totalAmount += item.getLineTotal();
        }

        order.setTotalAmount(totalAmount);
        order.setStatus(Order.Status.CONFIRMED);

        SalesRecordDto salesDto = new SalesRecordDto();
        salesDto.setSalesDate(order.getOrderDate().toLocalDate());
        salesDto.setNote("Auto-created from Order #" + order.getInvoiceNo());
        salesDto.setPaymentMethod(order.getPaymentType() == Order.PaymentType.CREDIT
                ? SalesRecord.PaymentMethod.CREDIT
                : SalesRecord.PaymentMethod.CASH);

        if (order.getCreditCustomer() != null) {
            salesDto.setCreditCustomerId(order.getCreditCustomer().getId());
        }

        List<SalesItemDto> salesItems = items.stream().map(oit -> {
            SalesItemDto sit = new SalesItemDto();
            sit.setProductId(oit.getProductId());
            sit.setQtySold(oit.getQty());
            sit.setUnitPrice(BigDecimal.valueOf(oit.getUnitPrice()));
            return sit;
        }).collect(Collectors.toList());
        salesDto.setItems(salesItems);

        SalesRecordDto createdSale = salesService.createSalesRecord(salesDto);

        SalesRecord saleEntity = salesRecordRepository.findById(createdSale.getId()).orElseThrow();
        order.setSalesRecord(saleEntity);

        return mapToDto(orderRepository.save(order));
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with ID: " + id));

        // Revert credit balance if confirmed and credit
        if (order.getStatus() == Order.Status.CONFIRMED &&
                order.getPaymentType() == Order.PaymentType.CREDIT &&
                order.getCreditCustomer() != null) {

            CreditCustomer customer = order.getCreditCustomer();
            customer.updateBalance(customer.getOutstandingBalance() - order.getTotalAmount());
            creditCustomerRepository.save(customer);
        }

        // Use trash service to move to recycle bin
        trashOrderService.moveToTrash(order);
    }

    private OrderDto mapToDto(Order o) {
        OrderDto dto = new OrderDto();
        dto.setId(o.getId());
        dto.setPublicId(o.getPublicId());
        dto.setInvoiceNo(o.getInvoiceNo());
        dto.setOrderDate(o.getOrderDate());
        dto.setPaymentType(o.getPaymentType());
        dto.setStatus(o.getStatus());
        dto.setTotalAmount(o.getTotalAmount());

        if (o.getSalesRecord() != null) {
            dto.setSalesRecordId(o.getSalesRecord().getId());
        }

        if (o.getCreditCustomer() != null) {
            dto.setCreditCustomerId(o.getCreditCustomer().getId());
            dto.setCreditCustomerName(o.getCreditCustomer().getName());
        }

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
