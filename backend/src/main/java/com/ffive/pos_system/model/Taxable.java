package com.ffive.pos_system.model;

import java.math.BigDecimal;

public interface Taxable {
    Tax getTax();

    String getNameSnapshot();

    BigDecimal getRateSnapshot();
}
