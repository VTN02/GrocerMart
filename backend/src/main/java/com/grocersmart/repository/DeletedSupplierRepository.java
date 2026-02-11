package com.grocersmart.repository;

import com.grocersmart.entity.DeletedSupplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeletedSupplierRepository extends JpaRepository<DeletedSupplier, Long> {
    List<DeletedSupplier> findByRestoredOrderByDeletedAtDesc(Boolean restored);

    List<DeletedSupplier> findByOriginalId(Long originalId);
}
