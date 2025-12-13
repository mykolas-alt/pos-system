package com.ffive.pos_system.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PaymentType {
    CASH((byte) 1),
    CARD((byte) 2),
    GIFT_CARD((byte) 3);
    private final byte key;
}
