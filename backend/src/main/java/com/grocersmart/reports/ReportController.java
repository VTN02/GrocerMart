package com.grocersmart.reports;

import com.grocersmart.entity.Cheque;
import com.grocersmart.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/sales/pdf")
    public ResponseEntity<byte[]> getSalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        byte[] pdf = reportService.generateSalesReport(from, to);
        return createPdfResponse(pdf, "sales_report.pdf");
    }

    @GetMapping("/sales/{salesId}/invoice.pdf")
    public ResponseEntity<byte[]> getInvoice(@PathVariable Long salesId) {
        byte[] pdf = reportService.generateInvoicePdf(salesId);
        return createPdfResponse(pdf, "invoice_" + salesId + ".pdf");
    }

    @GetMapping("/credit-customers/{id}/pdf")
    public ResponseEntity<byte[]> getCreditCustomerDetailsPdf(@PathVariable Long id) {
        byte[] pdf = reportService.generateCreditCustomerDetailsPdf(id);
        return createPdfResponse(pdf, "customer_profile_" + id + ".pdf");
    }

    @GetMapping("/credit-customers/{id}/ledger.pdf")
    public ResponseEntity<byte[]> getCustomerLedger(@PathVariable Long id) {
        byte[] pdf = reportService.generateCreditLedger(id);
        return createPdfResponse(pdf, "customer_ledger_" + id + ".pdf");
    }

    @GetMapping("/cheques/pdf")
    public ResponseEntity<byte[]> getChequeReport(@RequestParam(required = false) Cheque.Status status) {
        byte[] pdf = reportService.generateChequeReport(status);
        return createPdfResponse(pdf, "cheque_report.pdf");
    }

    @GetMapping("/products/{id}/pdf")
    public ResponseEntity<byte[]> getProductDetailsPdf(@PathVariable Long id) {
        byte[] pdf = reportService.generateProductDetailsPdf(id);
        return createPdfResponse(pdf, "product_details_" + id + ".pdf");
    }

    @GetMapping("/products/pdf")
    public ResponseEntity<byte[]> getInventoryReport(@RequestParam(required = false) Product.Status status) {
        byte[] pdf = reportService.generateInventoryReport(status);
        return createPdfResponse(pdf, "inventory_report.pdf");
    }

    @GetMapping("/suppliers/{id}/purchase-history.pdf")
    public ResponseEntity<byte[]> getSupplierReport(@PathVariable Long id) {
        byte[] pdf = reportService.generateSupplierPurchaseReport(id);
        return createPdfResponse(pdf, "supplier_purchase_history_" + id + ".pdf");
    }

    @GetMapping("/suppliers/{id}/pdf")
    public ResponseEntity<byte[]> getSupplierDetailsPdf(@PathVariable Long id) {
        byte[] pdf = reportService.generateSupplierDetailsPdf(id);
        return createPdfResponse(pdf, "supplier_profile_" + id + ".pdf");
    }

    @GetMapping("/users/{id}/pdf")
    public ResponseEntity<byte[]> getUserDetailsPdf(@PathVariable Long id) {
        byte[] pdf = reportService.generateUserDetailsPdf(id);
        return createPdfResponse(pdf, "user_details_" + id + ".pdf");
    }

    @GetMapping("/users/pdf")
    public ResponseEntity<byte[]> getUserReport() {
        byte[] pdf = reportService.generateUserReport();
        return createPdfResponse(pdf, "users_directory.pdf");
    }

    @GetMapping("/credit-customers/pdf")
    public ResponseEntity<byte[]> getCreditCustomerReport() {
        byte[] pdf = reportService.generateCreditCustomerReport();
        return createPdfResponse(pdf, "credit_customers_report.pdf");
    }

    @GetMapping("/suppliers/pdf")
    public ResponseEntity<byte[]> getSupplierListReport() {
        byte[] pdf = reportService.generateSupplierReport();
        return createPdfResponse(pdf, "suppliers_list.pdf");
    }

    @GetMapping("/purchase-orders/pdf")
    public ResponseEntity<byte[]> getPurchaseOrderReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        byte[] pdf = reportService.generatePurchaseOrderReport(from, to);
        return createPdfResponse(pdf, "purchase_orders_report.pdf");
    }

    @GetMapping("/purchase-orders/{id}/pdf")
    public ResponseEntity<byte[]> getPurchaseOrderPdf(@PathVariable Long id) {
        byte[] pdf = reportService.generatePurchaseOrderPdf(id);
        return createPdfResponse(pdf, "purchase_order_" + id + ".pdf");
    }

    private ResponseEntity<byte[]> createPdfResponse(byte[] pdf, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}
