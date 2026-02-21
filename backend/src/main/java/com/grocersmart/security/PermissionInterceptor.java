package com.grocersmart.security;

import com.grocersmart.common.ModuleKey;
import com.grocersmart.service.PermissionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class PermissionInterceptor implements HandlerInterceptor {

    private final PermissionService permissionService;

    private static final Map<String, ModuleKey> URI_MODULE_MAP = new HashMap<>();

    static {
        URI_MODULE_MAP.put("/api/products", ModuleKey.PRODUCTS);
        URI_MODULE_MAP.put("/api/inventory-convert", ModuleKey.INVENTORY_CONVERT);
        URI_MODULE_MAP.put("/api/credit-customers", ModuleKey.CREDIT_CUSTOMERS);
        URI_MODULE_MAP.put("/api/cheques", ModuleKey.CHEQUES);
        URI_MODULE_MAP.put("/api/orders", ModuleKey.ORDERS);
        URI_MODULE_MAP.put("/api/sales", ModuleKey.SALES);
        URI_MODULE_MAP.put("/api/suppliers", ModuleKey.SUPPLIERS);
        URI_MODULE_MAP.put("/api/purchase-orders", ModuleKey.PURCHASE_ORDERS);
        URI_MODULE_MAP.put("/api/trash", ModuleKey.TRASH);
        URI_MODULE_MAP.put("/api/reports", ModuleKey.REPORTS);
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return true; // Let Spring Security handle unauthenticated requests
        }

        String role = authentication.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .findFirst()
                .orElse("UNKNOWN");

        if ("ADMIN".equalsIgnoreCase(role)) {
            return true;
        }

        String uri = request.getRequestURI();
        ModuleKey module = null;

        for (Map.Entry<String, ModuleKey> entry : URI_MODULE_MAP.entrySet()) {
            if (uri.startsWith(entry.getKey())) {
                module = entry.getValue();
                break;
            }
        }

        if (module != null) {
            if (!permissionService.hasPermission(role, module)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter()
                        .write("{\"success\":false, \"message\":\"Access denied for module: " + module + "\"}");
                return false;
            }
        }

        return true;
    }
}
