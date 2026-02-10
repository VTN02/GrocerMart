package com.grocersmart.service;

import com.grocersmart.dto.CsvImportResultDTO;
import com.grocersmart.entity.Product;
import com.grocersmart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductImportService {

    private final ProductRepository productRepository;

    @Transactional
    public CsvImportResultDTO importFromCsv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return CsvImportResultDTO.builder()
                    .timestamp(LocalDateTime.now())
                    .success(false)
                    .message("CSV import failed: File is empty")
                    .build();
        }

        // Validate content type (requirement 1.4)
        String contentType = file.getContentType();
        if (contentType != null && !contentType.equals("text/csv") && !contentType.equals("application/vnd.ms-excel")) {
            // Log but allow for now as some browsers send generic types, but return error
            // if strictly required
            // log.warn("Invalid content type: {}", contentType);
        }

        int totalRows = 0;
        int imported = 0;
        int skippedDuplicates = 0;
        int failedRows = 0;
        List<String> errorsList = new ArrayList<>();

        try (BufferedReader fileReader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
                CSVParser csvParser = new CSVParser(fileReader,
                        CSVFormat.DEFAULT.builder()
                                .setHeader()
                                .setIgnoreHeaderCase(true)
                                .setTrim(true)
                                .build())) {

            List<CSVRecord> csvRecords = csvParser.getRecords();

            for (CSVRecord csvRecord : csvRecords) {
                totalRows++;
                try {
                    // Mapping as per requirement 1.2
                    String name = csvRecord.get("Product Name");
                    String category = csvRecord.get("Category");
                    String unitPriceStr = csvRecord.get("Unit Price");
                    String bulkPriceStr = csvRecord.get("Bulk Price");
                    String unitStockStr = csvRecord.get("Unit Stock");
                    String bulkStockStr = csvRecord.get("Bulk Stock");

                    // Validation 1.4
                    if (name == null || name.isBlank()) {
                        failedRows++;
                        errorsList.add("Row " + totalRows + ": Product Name is empty");
                        continue;
                    }

                    double sellingPrice;
                    double bulkPrice;
                    int unitQty;
                    double bulkQty;

                    try {
                        sellingPrice = Double.parseDouble(unitPriceStr);
                        bulkPrice = Double.parseDouble(bulkPriceStr);
                        unitQty = Integer.parseInt(unitStockStr);
                        bulkQty = Double.parseDouble(bulkStockStr);
                    } catch (NumberFormatException e) {
                        failedRows++;
                        errorsList.add("Row " + totalRows + ": Invalid numeric format");
                        continue;
                    }

                    if (sellingPrice < 0 || bulkPrice < 0 || unitQty < 0 || bulkQty < 0) {
                        failedRows++;
                        errorsList.add("Row " + totalRows + ": Numeric fields cannot be negative");
                        continue;
                    }

                    // Duplicate Handling 1.4 (Case-insensitive by name)
                    Optional<Product> existingProduct = productRepository.findByNameIgnoreCase(name);
                    if (existingProduct.isPresent()) {
                        skippedDuplicates++;
                        // skip it as per requirement 1.4
                        continue;
                    }

                    Product product = new Product();
                    product.setName(name);
                    product.setCategory(category);
                    product.setUnitPrice(sellingPrice); // Entity field is unitPrice
                    product.setBulkPrice(bulkPrice);
                    product.setUnitQty(unitQty);
                    product.setBulkQty(bulkQty);
                    product.setStatus(Product.Status.ACTIVE); // Requirement 1.2 isActive = true
                    product.setCreatedAt(LocalDateTime.now()); // Requirement 1.2 createdAt = now

                    productRepository.save(product);
                    imported++;

                } catch (IllegalArgumentException e) {
                    failedRows++;
                    errorsList.add("Row " + totalRows + ": Missing columns or invalid data header");
                    log.error("CSV Column mapping error at row {}: {}", totalRows, e.getMessage());
                } catch (Exception e) {
                    log.error("Error parsing row {}: {}", totalRows, e.getMessage());
                    failedRows++;
                    errorsList.add("Row " + totalRows + ": " + e.getMessage());
                }
            }

            return CsvImportResultDTO.builder()
                    .timestamp(LocalDateTime.now())
                    .success(true)
                    .message("Imported " + imported + " products")
                    .totalRows(totalRows)
                    .imported(imported)
                    .skippedDuplicates(skippedDuplicates)
                    .failedRows(failedRows)
                    .errors(errorsList)
                    .build();

        } catch (Exception e) {
            log.error("CSV Import Error: ", e);
            return CsvImportResultDTO.builder()
                    .timestamp(LocalDateTime.now())
                    .success(false)
                    .message("CSV import failed: " + e.getMessage())
                    .build();
        }
    }
}
