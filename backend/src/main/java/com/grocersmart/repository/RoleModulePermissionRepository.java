package com.grocersmart.repository;

import com.grocersmart.common.ModuleKey;
import com.grocersmart.entity.RoleModulePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleModulePermissionRepository extends JpaRepository<RoleModulePermission, Long> {
    List<RoleModulePermission> findByRole(String role);

    Optional<RoleModulePermission> findByRoleAndModuleKey(String role, ModuleKey moduleKey);
}
