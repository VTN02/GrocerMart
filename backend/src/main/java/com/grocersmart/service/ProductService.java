package com.grocersmart.service;

import com.grocersmart.dto.ProductDto;
import com.grocersmart.dto.StockConversionDto;
import com.grocersmart.entity.Product;
import com.grocersmart.entity.StockConversion;
import com.grocersmart.repository.ProductRepository;
import com.grocersmart.repository.StockConversionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final StockConversionRepository stockConversionRepository;
    private final TrashProductService trashProductService;
    private final PublicIdGeneratorService publicIdGeneratorService;

    public ProductDto createProduct(ProductDto dto) {
        Product product = new Product();
        mapToEntity(dto, product);
        product.setStatus(Product.Status.ACTIVE);
        product.setPublicId(publicIdGeneratorService.nextId(com.grocersmart.common.EntityType.PRODUCT));
        return mapToDto(productRepository.save(product));
    }

    public Page<ProductDto> getProducts(String search, String category, Product.Status status, Pageable pageable) {
        return productRepository.findAll(
                com.grocersmart.specification.ProductSpecification.filterBy(search, category, status),
                pageable).map(this::mapToDto);
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findByStatus(Product.Status.ACTIVE).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProductDto getProductById(Long id) {
        return productRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
    }

    public ProductDto getProductByPublicId(String publicId) {
        return productRepository.findByPublicId(publicId)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with publicId: " + publicId));
    }

    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        mapToEntity(dto, product);
        return mapToDto(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        // Use trash system to archive and delete
        trashProductService.archiveAndDelete(id, "Deleted via API", null);
    }

    @Transactional
    public void convertStock(StockConversionDto dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        if (product.getBulkQty() < dto.getFromBulkQty()) {
            throw new IllegalArgumentException("Insufficient bulk quantity");
        }

        product.setBulkQty(product.getBulkQty() - dto.getFromBulkQty());
        product.setUnitQty(product.getUnitQty() + dto.getToUnitQty());
        productRepository.save(product);

        StockConversion conversion = new StockConversion();
        conversion.setProductId(dto.getProductId());
        conversion.setFromBulkQty(dto.getFromBulkQty());
        conversion.setToUnitQty(dto.getToUnitQty());
        conversion.setNote(dto.getNote());
        conversion.setConversionDate(LocalDateTime.now());
        stockConversionRepository.save(conversion);
    }

    private ProductDto mapToDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setCategory(p.getCategory());
        dto.setUnitType(p.getUnitType());
        dto.setBulkQty(p.getBulkQty());
        dto.setUnitQty(p.getUnitQty());
        dto.setReorderLevel(p.getReorderLevel());
        dto.setUnitsPerBulk(p.getUnitsPerBulk());
        dto.setUnitPrice(p.getUnitPrice());
        dto.setBulkPrice(p.getBulkPrice());
        dto.setPurchasePrice(p.getPurchasePrice());
        dto.setStatus(p.getStatus());
        dto.setStatus(p.getStatus());
        dto.setPublicId(p.getPublicId());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }

    private void mapToEntity(ProductDto dto, Product p) {
        p.setName(dto.getName());
        p.setCategory(dto.getCategory());
        if (dto.getUnitType() != null)
            p.setUnitType(dto.getUnitType());
        if (dto.getBulkQty() != null)
            p.setBulkQty(dto.getBulkQty());
        if (dto.getUnitQty() != null)
            p.setUnitQty(dto.getUnitQty());
        if (dto.getUnitPrice() != null)
            p.setUnitPrice(dto.getUnitPrice());
        if (dto.getBulkPrice() != null)
            p.setBulkPrice(dto.getBulkPrice());
        if (dto.getPurchasePrice() != null)
            p.setPurchasePrice(dto.getPurchasePrice());
        if (dto.getReorderLevel() != null)
            p.setReorderLevel(dto.getReorderLevel());
        if (dto.getUnitsPerBulk() != null)
            p.setUnitsPerBulk(dto.getUnitsPerBulk());
    }
}
