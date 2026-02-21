package com.grocersmart.reports;

import com.grocersmart.entity.*;
import com.grocersmart.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

        private final SalesRecordRepository salesRepository;
        private final ProductRepository productRepository;
        private final CreditCustomerRepository creditCustomerRepository;
        private final CreditPaymentRepository creditPaymentRepository;
        private final ChequeRepository chequeRepository;
        private final SupplierRepository supplierRepository;
        private final PurchaseOrderRepository purchaseOrderRepository;
        private final UserRepository userRepository;

        private String safe(Object val) {
                return val != null ? val.toString() : "-";
        }

        private String safeMoney(BigDecimal val) {
                return val != null ? val.toString() : "0.00";
        }

        private String safeMoney(Double val) {
                return val != null ? String.format("%.2f", val) : "0.00";
        }

        public byte[] generateSalesReport(LocalDate from, LocalDate to) {
                List<SalesRecord> sales = salesRepository.findAll();
                if (from != null && to != null) {
                        sales = sales.stream()
                                        .filter(s -> !s.getSalesDate().isBefore(from) && !s.getSalesDate().isAfter(to))
                                        .collect(Collectors.toList());
                }

                String[] headers = { "Invoice", "Date", "Customer", "Pay Method", "Status", "Due Date", "Days Late",
                                "Total", "Paid", "Balance" };
                List<String[]> data = new ArrayList<>();
                BigDecimal totalRevenue = BigDecimal.ZERO;
                BigDecimal totalOutstanding = BigDecimal.ZERO;

                for (SalesRecord s : sales) {
                        String customerName = "Walk-in";
                        if (s.getCreditCustomer() != null) {
                                customerName = s.getCreditCustomer().getName();
                        }

                        BigDecimal paid = s.getPaidAmount() != null ? s.getPaidAmount() : BigDecimal.ZERO;
                        if (s.getPaymentMethod() == SalesRecord.PaymentMethod.CASH
                                        && paid.compareTo(BigDecimal.ZERO) == 0) {
                                paid = s.getTotalRevenue();
                        }

                        BigDecimal balance = s.getTotalRevenue().subtract(paid);
                        if (balance.compareTo(BigDecimal.ZERO) < 0)
                                balance = BigDecimal.ZERO;

                        data.add(new String[] {
                                        safe(s.getInvoiceId()),
                                        safe(s.getSalesDate()),
                                        customerName,
                                        safe(s.getPaymentMethod()),
                                        safe(s.getPaymentStatus()),
                                        safe(s.getDueDate()),
                                        safe(s.getDaysOverdue()),
                                        safeMoney(s.getTotalRevenue()),
                                        safeMoney(paid),
                                        safeMoney(balance)
                        });
                        totalRevenue = totalRevenue
                                        .add(s.getTotalRevenue() != null ? s.getTotalRevenue() : BigDecimal.ZERO);
                        totalOutstanding = totalOutstanding.add(balance);
                }

                return PdfGeneratorUtil.generatePdf(
                                "Sales Report (" + (from != null ? from : "All") + " to " + (to != null ? to : "All")
                                                + ")",
                                headers, data,
                                "Grand Total Revenue: INR " + safeMoney(totalRevenue) + "\nTotal Outstanding: INR "
                                                + safeMoney(totalOutstanding));
        }

        public byte[] generateInvoicePdf(Long salesId) {
                SalesRecord sales = salesRepository.findById(salesId)
                                .orElseThrow(() -> new EntityNotFoundException("Sale not found"));

                String[] headers = { "Item", "Category", "Qty", "Type", "Unit Price", "Total" };
                List<String[]> data = new ArrayList<>();

                for (SalesItem item : sales.getItems()) {
                        String productName = item.getProductNameSnapshot() != null ? item.getProductNameSnapshot()
                                        : (item.getProduct() != null ? item.getProduct().getName() : "Unknown");
                        String category = item.getCategorySnapshot() != null ? item.getCategorySnapshot()
                                        : (item.getProduct() != null ? item.getProduct().getCategory() : "-");

                        data.add(new String[] {
                                        productName,
                                        category,
                                        safe(item.getQtySold()),
                                        safe(item.getUnitOrBulk()),
                                        safeMoney(item.getUnitPrice()),
                                        safeMoney(item.getLineTotal())
                        });
                }

                String customerInfo = "Walk-in Customer";
                if (sales.getCreditCustomer() != null) {
                        customerInfo = "Customer: " + sales.getCreditCustomer().getName() +
                                        "\nPhone: " + sales.getCreditCustomer().getPhone();
                }

                BigDecimal paid = sales.getPaidAmount() != null ? sales.getPaidAmount() : BigDecimal.ZERO;
                if (sales.getPaymentMethod() == SalesRecord.PaymentMethod.CASH
                                && paid.compareTo(BigDecimal.ZERO) == 0) {
                        paid = sales.getTotalRevenue();
                }
                BigDecimal balance = sales.getTotalRevenue().subtract(paid);

                String statusInfo = "Status: " + safe(sales.getPaymentStatus());
                if (sales.getPaymentMethod() == SalesRecord.PaymentMethod.CREDIT && sales.getDueDate() != null) {
                        statusInfo += "\nDue Date: " + sales.getDueDate().toString();
                }

                String title = "INVOICE: " + sales.getInvoiceId() + "\nDate: " + sales.getSalesDate() + "\n"
                                + customerInfo + "\n" + statusInfo;

                return PdfGeneratorUtil.generatePdf(title, headers, data,
                                "Total Amount: INR " + safeMoney(sales.getTotalRevenue()) +
                                                "\nPaid Amount: INR " + safeMoney(paid) +
                                                "\nBalance Due: INR " + safeMoney(balance));
        }

        public byte[] generateInventoryReport(Product.Status status) {
                List<Product> products = status != null ? productRepository.findByStatus(status)
                                : productRepository.findAll();

                String[] headers = { "ID", "Name", "Category", "Unit Qty", "Bulk Qty", "Unit Price", "Bulk Price",
                                "Status" };
                List<String[]> data = new ArrayList<>();

                for (Product p : products) {
                        data.add(new String[] {
                                        p.getPublicId() != null ? p.getPublicId() : safe(p.getId()),
                                        safe(p.getName()),
                                        safe(p.getCategory()),
                                        safe(p.getUnitQty()),
                                        safe(p.getBulkQty()),
                                        safeMoney(p.getUnitPrice()),
                                        safeMoney(p.getBulkPrice()),
                                        safe(p.getStatus())
                        });
                }

                return PdfGeneratorUtil.generatePdf("Inventory Stock Report - " + (status != null ? status : "ALL"),
                                headers, data, "Total Items: " + products.size());
        }

        public byte[] generateCreditCustomerReport() {
                List<CreditCustomer> customers = creditCustomerRepository.findAll();
                // Added "Address" and "Last Payment"
                // Added "AI Risk Prediction" as requested empty placeholder
                String[] headers = { "ID", "Name", "Phone", "Address", "Limit", "Balance", "Available",
                                "Last Payment" };
                List<String[]> data = new ArrayList<>();
                Double totalBalance = 0.0;

                for (CreditCustomer c : customers) {
                        data.add(new String[] {
                                        c.getPublicId() != null ? c.getPublicId() : safe(c.getId()),
                                        safe(c.getName()),
                                        safe(c.getPhone()),
                                        c.getAddress() != null ? (c.getAddress().length() > 20
                                                        ? c.getAddress().substring(0, 17) + "..."
                                                        : c.getAddress()) : "-",
                                        safeMoney(c.getCreditLimit()),
                                        safeMoney(c.getOutstandingBalance()),
                                        safeMoney(c.getAvailableCredit()),
                                        safe(c.getLastPaymentDate())
                        });
                        if (c.getOutstandingBalance() != null)
                                totalBalance += c.getOutstandingBalance();
                }

                return PdfGeneratorUtil.generatePdf("Credit Customer Summary", headers, data,
                                "Total Outstanding Debt: INR " + safeMoney(totalBalance));
        }

        public byte[] generateCreditLedger(Long customerId) {
                CreditCustomer customer = creditCustomerRepository.findById(customerId)
                                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));

                List<SalesRecord> sales = salesRepository.findByCreditCustomerId(customerId);
                List<CreditPayment> payments = creditPaymentRepository.findByCustomerId(customerId);

                // Entry class for combining
                class LedgerEntry {
                        LocalDate date;
                        String description;
                        String type; // DEBIT (Sale), CREDIT (Payment)
                        Double amount;

                        LedgerEntry(LocalDate d, String desc, String t, Double a) {
                                date = d;
                                description = desc;
                                type = t;
                                amount = a;
                        }
                }

                List<LedgerEntry> entries = new ArrayList<>();
                for (SalesRecord s : sales) {
                        entries.add(new LedgerEntry(s.getSalesDate(), "Sale: " + s.getInvoiceId(), "DEBIT",
                                        s.getTotalRevenue().doubleValue()));
                }
                for (CreditPayment p : payments) {
                        entries.add(new LedgerEntry(p.getPaymentDate().toLocalDate(), "Payment: " + safe(p.getNote()),
                                        "CREDIT", p.getAmount()));
                }

                entries.sort((a, b) -> a.date.compareTo(b.date));

                String[] headers = { "Date", "Description", "Debit (+)", "Credit (-)", "Balance" };
                List<String[]> data = new ArrayList<>();
                Double runningBalance = 0.0;

                for (LedgerEntry e : entries) {
                        if (e.type.equals("DEBIT"))
                                runningBalance += e.amount;
                        else
                                runningBalance -= e.amount;

                        data.add(new String[] {
                                        safe(e.date),
                                        e.description,
                                        e.type.equals("DEBIT") ? safeMoney(e.amount) : "-",
                                        e.type.equals("CREDIT") ? safeMoney(e.amount) : "-",
                                        safeMoney(runningBalance)
                        });
                }

                String title = "Customer Ledger: " + customer.getName() + " (" + safe(customer.getPublicId()) + ")";
                return PdfGeneratorUtil.generatePdf(title, headers, data,
                                "Current Outstanding Balance: INR " + safeMoney(customer.getOutstandingBalance()));
        }

        public byte[] generateProductDetailsPdf(Long productId) {
                Product p = productRepository.findById(productId)
                                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

                String[] headers = { "Specification", "Detail" };
                List<String[]> data = new ArrayList<>();

                data.add(new String[] { "Public ID", safe(p.getPublicId()) });
                data.add(new String[] { "Name", safe(p.getName()) });
                data.add(new String[] { "Category", safe(p.getCategory()) });
                data.add(new String[] { "Unit Price", safeMoney(p.getUnitPrice()) });
                data.add(new String[] { "Bulk Price", safeMoney(p.getBulkPrice()) });
                data.add(new String[] { "Purchase Price", safeMoney(p.getPurchasePrice()) });
                data.add(new String[] { "Unit Qty in Stock", safe(p.getUnitQty()) });
                data.add(new String[] { "Bulk Qty in Stock", safe(p.getBulkQty()) });
                data.add(new String[] { "Units per Bulk", safe(p.getUnitsPerBulk()) });
                data.add(new String[] { "Min Stock Level", safe(p.getReorderLevel()) });
                data.add(new String[] { "Status", safe(p.getStatus()) });

                return PdfGeneratorUtil.generatePdf("Product Data Sheet: " + p.getName(), headers, data,
                                "Generated on: " + LocalDate.now());
        }

        public byte[] generateCreditCustomerDetailsPdf(Long customerId) {
                CreditCustomer c = creditCustomerRepository.findById(customerId)
                                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));

                String[] headers = { "Account Field", "Information" };
                List<String[]> data = new ArrayList<>();

                data.add(new String[] { "Customer ID", safe(c.getPublicId()) });
                data.add(new String[] { "Full Name", safe(c.getName()) });
                data.add(new String[] { "Phone Number", safe(c.getPhone()) });
                data.add(new String[] { "Address", safe(c.getAddress()) });
                data.add(new String[] { "Credit Limit", safeMoney(c.getCreditLimit()) });
                data.add(new String[] { "Outstanding Balance", safeMoney(c.getOutstandingBalance()) });
                data.add(new String[] { "Available Credit", safeMoney(c.getAvailableCredit()) });
                data.add(new String[] { "Customer Type", safe(c.getCustomerType()) });
                data.add(new String[] { "Total Purchases", safeMoney(c.getTotalPurchases()) });
                data.add(new String[] { "Total Paid", safeMoney(c.getTotalPaid()) });
                data.add(new String[] { "Last Payment Date", safe(c.getLastPaymentDate()) });
                data.add(new String[] { "Status", safe(c.getStatus()) });

                return PdfGeneratorUtil.generatePdf("Customer Credit Profile: " + c.getName(), headers, data, "");
        }

        public byte[] generateChequeReport(Cheque.Status status) {
                List<Cheque> cheques = chequeRepository.findAll();
                if (status != null) {
                        cheques = cheques.stream().filter(c -> c.getStatus() == status).collect(Collectors.toList());
                }

                String[] headers = { "Cheque #", "Bank", "Customer", "Due Date", "Amount", "Status", "Bounce Reason" };
                List<String[]> data = new ArrayList<>();

                for (Cheque c : cheques) {
                        String customerName = "Unknown";
                        if (c.getCustomerId() != null) {
                                customerName = creditCustomerRepository.findById(c.getCustomerId())
                                                .map(CreditCustomer::getName).orElse("-");
                        }

                        data.add(new String[] {
                                        safe(c.getChequeNumber()),
                                        safe(c.getBankName()),
                                        customerName,
                                        safe(c.getDueDate()),
                                        safeMoney(c.getAmount()),
                                        safe(c.getStatus()),
                                        safe(c.getBounceReason())
                        });
                }

                return PdfGeneratorUtil.generatePdf("Cheque Report - " + (status != null ? status : "ALL"), headers,
                                data, "Total Count: " + cheques.size());
        }

        public byte[] generateSupplierReport() {
                List<Supplier> suppliers = supplierRepository.findAll();
                String[] headers = { "ID", "Name", "Phone", "Address", "Status" };
                List<String[]> data = new ArrayList<>();

                for (Supplier s : suppliers) {
                        data.add(new String[] {
                                        safe(s.getId()),
                                        safe(s.getName()),
                                        safe(s.getPhone()),
                                        safe(s.getAddress()),
                                        safe(s.getStatus())
                        });
                }

                return PdfGeneratorUtil.generatePdf("Supplier Directory", headers, data,
                                "Total Suppliers: " + suppliers.size());
        }

        public byte[] generatePurchaseOrderReport(LocalDate from, LocalDate to) {
                List<PurchaseOrder> orders = purchaseOrderRepository.findAll();
                if (from != null && to != null) {
                        orders = orders.stream()
                                        .filter(o -> !o.getPoDate().toLocalDate().isBefore(from)
                                                        && !o.getPoDate().toLocalDate().isAfter(to))
                                        .collect(Collectors.toList());
                }

                String[] headers = { "PO ID", "Supplier", "Date", "Status", "Total Amount" };
                List<String[]> data = new ArrayList<>();
                Double total = 0.0;

                for (PurchaseOrder o : orders) {
                        String supplierName = supplierRepository.findById(o.getSupplierId()).map(Supplier::getName)
                                        .orElse("Unknown");
                        data.add(new String[] {
                                        safe(o.getId()),
                                        supplierName,
                                        safe(o.getPoDate() != null ? o.getPoDate().toLocalDate() : null),
                                        safe(o.getStatus()),
                                        safeMoney(o.getTotalAmount())
                        });
                        if (o.getTotalAmount() != null)
                                total += o.getTotalAmount();
                }

                return PdfGeneratorUtil.generatePdf("Purchase Orders Report", headers, data,
                                "Total Purchases: INR " + safeMoney(total));
        }

        public byte[] generateUserReport() {
                List<User> users = userRepository.findAll();
                String[] headers = { "ID", "Username", "Full Name", "Role", "Phone", "Status", "Joined" };
                List<String[]> data = new ArrayList<>();

                for (User u : users) {
                        data.add(new String[] {
                                        safe(u.getId()),
                                        safe(u.getUsername()),
                                        safe(u.getFullName()),
                                        safe(u.getRole()),
                                        safe(u.getPhone()),
                                        safe(u.getStatus()),
                                        safe(u.getCreatedAt() != null ? u.getCreatedAt().toLocalDate() : null)
                        });
                }
                return PdfGeneratorUtil.generatePdf("User Directory", headers, data, "Total Users: " + users.size());
        }

        public byte[] generateUserDetailsPdf(Long userId) {
                // Detailed single user report
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new EntityNotFoundException("User not found"));

                String[] headers = { "Field", "Value" };
                List<String[]> data = new ArrayList<>();

                data.add(new String[] { "ID", safe(user.getId()) });
                data.add(new String[] { "Username", safe(user.getUsername()) });
                data.add(new String[] { "Full Name", safe(user.getFullName()) });
                data.add(new String[] { "Role", safe(user.getRole()) });
                data.add(new String[] { "Phone", safe(user.getPhone()) });
                data.add(new String[] { "Status", safe(user.getStatus()) });
                data.add(new String[] { "Created", safe(user.getCreatedAt()) });
                data.add(new String[] { "Last Updated", safe(user.getUpdatedAt()) });

                return PdfGeneratorUtil.generatePdf("User Details: " + user.getFullName(), headers, data, "");
        }

        public byte[] generateSupplierPurchaseReport(Long supplierId) {
                Supplier supplier = supplierRepository.findById(supplierId)
                                .orElseThrow(() -> new EntityNotFoundException("Supplier not found"));

                List<PurchaseOrder> orders = purchaseOrderRepository.findAll().stream()
                                .filter(o -> o.getSupplierId().equals(supplierId))
                                .collect(Collectors.toList());

                String[] headers = { "Order ID", "Date", "Status", "Items", "Total (INR)" };
                List<String[]> data = new ArrayList<>();
                Double total = 0.0;

                for (PurchaseOrder o : orders) {
                        data.add(new String[] {
                                        safe(o.getId()),
                                        safe(o.getPoDate() != null ? o.getPoDate().toLocalDate() : null),
                                        safe(o.getStatus()),
                                        safe(o.getItems() != null ? o.getItems().size() : 0),
                                        safeMoney(o.getTotalAmount())
                        });
                        if (o.getTotalAmount() != null)
                                total += o.getTotalAmount();
                }

                String title = "Purchase History: " + supplier.getName() +
                                "\nPhone: " + safe(supplier.getPhone()) + " | Address: " + safe(supplier.getAddress());

                return PdfGeneratorUtil.generatePdf(title, headers, data,
                                "Total Purchase Value: INR " + safeMoney(total));
        }

        public byte[] generateSupplierDetailsPdf(Long supplierId) {
                Supplier s = supplierRepository.findById(supplierId)
                                .orElseThrow(() -> new EntityNotFoundException("Supplier not found"));

                String[] headers = { "Field", "Detail" };
                List<String[]> data = new ArrayList<>();

                data.add(new String[] { "Public ID", safe(s.getPublicId()) });
                data.add(new String[] { "Supplier Name", safe(s.getName()) });
                data.add(new String[] { "Phone", safe(s.getPhone()) });
                data.add(new String[] { "Email", safe(s.getEmail()) });
                data.add(new String[] { "Address", safe(s.getAddress()) });
                data.add(new String[] { "Status", safe(s.getStatus()) });
                data.add(new String[] { "Member Since",
                                safe(s.getCreatedAt() != null ? s.getCreatedAt().toLocalDate() : null) });

                return PdfGeneratorUtil.generatePdf("Supplier Profile: " + s.getName(), headers, data,
                                "Generated on: " + LocalDate.now());
        }

        public byte[] generatePurchaseOrderPdf(Long id) {
                PurchaseOrder po = purchaseOrderRepository.findById(id)
                                .orElseThrow(() -> new EntityNotFoundException("Purchase Order not found"));

                String supplierName = supplierRepository.findById(po.getSupplierId())
                                .map(Supplier::getName).orElse("Unknown");

                String[] headers = { "Product", "Qty", "Unit Cost", "Line Total" };
                List<String[]> data = new ArrayList<>();

                for (PurchaseOrderItem item : po.getItems()) {
                        String pName = productRepository.findById(item.getProductId()).map(Product::getName)
                                        .orElse("-");
                        data.add(new String[] {
                                        pName,
                                        safe(item.getQty()),
                                        safeMoney(item.getUnitCost()),
                                        safeMoney(item.getLineTotal())
                        });
                }

                String title = "PURCHASE ORDER #" + po.getId() + "\nSupplier: " + supplierName + "\nDate: "
                                + safe(po.getPoDate().toLocalDate());
                return PdfGeneratorUtil.generatePdf(title, headers, data,
                                "Grand Total: INR " + safeMoney(po.getTotalAmount()));
        }
}
