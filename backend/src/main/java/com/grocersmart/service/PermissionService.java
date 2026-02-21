package com.grocersmart.service;

import com.grocersmart.common.ModuleKey;
import com.grocersmart.entity.RoleModulePermission;
import com.grocersmart.repository.RoleModulePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final RoleModulePermissionRepository repository;

    public Map<ModuleKey, Boolean> getCashierPermissions() {
        return repository.findByRole("CASHIER").stream()
                .collect(Collectors.toMap(RoleModulePermission::getModuleKey, RoleModulePermission::isAllowed));
    }

    @Transactional
    public void setCashierPermission(ModuleKey moduleKey, boolean allowed) {
        RoleModulePermission permission = repository.findByRoleAndModuleKey("CASHIER", moduleKey)
                .orElseGet(() -> {
                    RoleModulePermission p = new RoleModulePermission();
                    p.setRole("CASHIER");
                    p.setModuleKey(moduleKey);
                    return p;
                });
        permission.setAllowed(allowed);
        repository.save(permission);
    }

    @Transactional
    public void setBulkCashierPermissions(Map<ModuleKey, Boolean> permissions) {
        permissions.forEach(this::setCashierPermission);
    }

    public boolean hasPermission(String role, ModuleKey moduleKey) {
        if ("ADMIN".equalsIgnoreCase(role)) {
            return true;
        }
        return repository.findByRoleAndModuleKey(role, moduleKey)
                .map(RoleModulePermission::isAllowed)
                .orElse(false);
    }
}
