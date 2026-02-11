package com.grocersmart.repository;

import com.grocersmart.entity.DeletedCreditCustomer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeletedCreditCustomerRepository extends JpaRepository<DeletedCreditCustomer, Long> {
    List<DeletedCreditCustomer> findByRestoredOrderByDeletedAtDesc(Boolean restored);

    List<DeletedCreditCustomer> findByOriginalId(Long originalId);
}
