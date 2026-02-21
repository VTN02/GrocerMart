package com.grocersmart.exception;

import lombok.Getter;

@Getter
public class CreditLimitExceededException extends RuntimeException {
    private final double creditLimit;
    private final double currentOutstanding;
    private final double attemptedCharge;

    public CreditLimitExceededException(String message, double creditLimit, double currentOutstanding,
            double attemptedCharge) {
        super(message);
        this.creditLimit = creditLimit;
        this.currentOutstanding = currentOutstanding;
        this.attemptedCharge = attemptedCharge;
    }
}
