package com.grocersmart.common;

public enum EntityType {
    USER("U"),
    PRODUCT("P"),
    SALE("S"),
    ORDER("O"),
    CREDIT_CUSTOMER("CC"),
    CHEQUE("C"),
    PURCHASE_ORDER("PO"),
    SUPPLIER("SUP");

    private final String prefix;

    EntityType(String prefix) {
        this.prefix = prefix;
    }

    public String getPrefix() {
        return prefix;
    }
}
