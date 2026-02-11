package com.grocersmart.repository;

import com.grocersmart.entity.DeletedUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeletedUserRepository extends JpaRepository<DeletedUser, Long> {
    List<DeletedUser> findByRestoredOrderByDeletedAtDesc(Boolean restored);

    List<DeletedUser> findByOriginalId(Long originalId);
}
