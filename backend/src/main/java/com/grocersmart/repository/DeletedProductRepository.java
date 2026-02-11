package com.grocersmart.repository;

import com.grocersmart.entity.DeletedProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeletedProductRepository extends JpaRepository<DeletedProduct, Long> {
    List<DeletedProduct> findByRestoredOrderByDeletedAtDesc(Boolean restored);

    List<DeletedProduct> findByOriginalId(Long originalId);
}
