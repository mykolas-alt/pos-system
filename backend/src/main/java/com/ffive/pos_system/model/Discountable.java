package com.ffive.pos_system.model;

import java.math.BigDecimal;

public interface Discountable {
    Discount getDiscount();

    String getNameSnapshot();

    BigDecimal getValueSnapshot();
}
