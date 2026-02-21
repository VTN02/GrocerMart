package com.grocersmart.controller;

import com.grocersmart.dto.DeletedItemDto;
import com.grocersmart.dto.RestoreResponse;
import com.grocersmart.service.TrashCreditCustomerService;
import com.grocersmart.service.TrashProductService;
import com.grocersmart.service.TrashSupplierService;
import com.grocersmart.service.TrashUserService;
// Add new services (implementations assumed generic or specific)
import com.grocersmart.service.TrashOrderService;
import com.grocersmart.service.TrashSalesService;
import com.grocersmart.service.TrashChequeService;
import com.grocersmart.service.TrashPurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trash")
@RequiredArgsConstructor
public class TrashController {

    private final TrashUserService trashUserService;
    private final TrashProductService trashProductService;
    private final TrashSupplierService trashSupplierService;
    private final TrashCreditCustomerService trashCreditCustomerService;
    private final TrashOrderService trashOrderService;
    private final TrashSalesService trashSalesService;
    private final TrashChequeService trashChequeService;
    private final TrashPurchaseOrderService trashPurchaseOrderService;

    // Users
    @GetMapping("/users")
    public ResponseEntity<List<DeletedItemDto>> getDeletedUsers() {
        return ResponseEntity.ok(trashUserService.getAllDeleted());
    }

    @PostMapping("/users/{id}/restore")
    public ResponseEntity<RestoreResponse> restoreUser(@PathVariable Long id) {
        return ResponseEntity.ok(trashUserService.restore(id));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUserPermanent(@PathVariable Long id) {
        trashUserService.permanentDelete(id);
        return ResponseEntity.noContent().build();
    }

    // Products
    @GetMapping("/products")
    public ResponseEntity<List<DeletedItemDto>> getDeletedProducts() {
        return ResponseEntity.ok(trashProductService.getAllDeleted());
    }

    @PostMapping("/products/{id}/restore")
    public ResponseEntity<RestoreResponse> restoreProduct(@PathVariable Long id) {
        return ResponseEntity.ok(trashProductService.restore(id));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProductPermanent(@PathVariable Long id) {
        trashProductService.permanentDelete(id);
        return ResponseEntity.noContent().build();
    }

    // Suppliers
    @GetMapping("/suppliers")
    public ResponseEntity<List<DeletedItemDto>> getDeletedSuppliers() {
        return ResponseEntity.ok(trashSupplierService.getAllDeleted());
    }

    @PostMapping("/suppliers/{id}/restore")
    public ResponseEntity<RestoreResponse> restoreSupplier(@PathVariable Long id) {
        return ResponseEntity.ok(trashSupplierService.restore(id));
    }

    @DeleteMapping("/suppliers/{id}")
    public ResponseEntity<Void> deleteSupplierPermanent(@PathVariable Long id) {
        trashSupplierService.permanentDelete(id);
        return ResponseEntity.noContent().build();
    }

    // Credit Customers
    @GetMapping("/credit-customers")
    public ResponseEntity<List<DeletedItemDto>> getDeletedCustomers() {
        return ResponseEntity.ok(trashCreditCustomerService.getAllDeleted());
    }

    @PostMapping("/credit-customers/{id}/restore")
    public ResponseEntity<RestoreResponse> restoreCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(trashCreditCustomerService.restore(id));
    }

    @DeleteMapping("/credit-customers/{id}")
    public ResponseEntity<Void> deleteCustomerPermanent(@PathVariable Long id) {
        trashCreditCustomerService.permanentDelete(id);
        return ResponseEntity.noContent().build();
    }

    // Orders
    @GetMapping("/orders")
    public ResponseEntity<List<DeletedItemDto>> getDeletedOrders() {
        return ResponseEntity.ok(trashOrderService.getAllDeleted());
    }

    @PostMapping("/orders/{id}/restore")
    public ResponseEntity<RestoreResponse> restoreOrder(@PathVariable Long id) {
        return ResponseEntity.ok(trashOrderService.restore(id));
    }

    @DeleteMapping("/orders/{id}/permanent")
    public ResponseEntity<Void> deleteOrderPermanent(@PathVariable Long id) {
        trashOrderService.permanentDelete(id);
        return ResponseEntity.noContent().build();
    }

    // Sales
    @GetMapping("/sales")
    public ResponseEntity<List<DeletedItemDto>> getDeletedSales() {
        return ResponseEntity.ok(trashSalesService.getAllDeleted());
    }

    @PostMapping("/sales/{id}/restore")
    public ResponseEntity<RestoreResponse> restoreSale(@PathVariable Long id) {
        return ResponseEntity.ok(trashSalesService.restore(id));
    }

    @DeleteMapping("/sales/{id}/permanent")
    public ResponseEntity<Void> deleteSalePermanent(@PathVariable Long id) {
        trashSalesService.permanentDelete(id);
        return ResponseEntity.noContent().build();
    }

    // Cheques
    @GetMapping("/cheques")
    public ResponseEntity<List<DeletedItemDto>> getDeletedCheques() {
        return ResponseEntity.ok(trashChequeService.getAllDeleted());
    }

    @PostMapping("/cheques/{id}/restore")
    public ResponseEntity<RestoreResponse> restoreCheque(@PathVariable Long id) {
        return ResponseEntity.ok(trashChequeService.restore(id));
    }

    @DeleteMapping("/cheques/{id}/permanent")
    public ResponseEntity<Void> deleteChequePermanent(@PathVariable Long id) {
        trashChequeService.permanentDelete(id);
        return ResponseEntity.noContent().build();
    }

    // Purchase Orders
    @GetMapping("/purchase-orders")
    public ResponseEntity<List<DeletedItemDto>> getDeletedPurchaseOrders() {
        return ResponseEntity.ok(trashPurchaseOrderService.getAllDeleted());
    }

    @PostMapping("/purchase-orders/{id}/restore")
    public ResponseEntity<RestoreResponse> restorePurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(trashPurchaseOrderService.restore(id));
    }

    @DeleteMapping("/purchase-orders/{id}/permanent")
    public ResponseEntity<Void> deletePurchaseOrderPermanent(@PathVariable Long id) {
        trashPurchaseOrderService.permanentDelete(id);
        return ResponseEntity.noContent().build();
    }
}
