package com.grocersmart.entity;

import com.grocersmart.common.ModuleKey;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "role_module_permission")
@Getter
@Setter
public class RoleModulePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String role;

    @Enumerated(EnumType.STRING)
    @Column(name = "module_key", nullable = false)
    private ModuleKey moduleKey;

    @Column(nullable = false)
    private boolean allowed = false;
}
