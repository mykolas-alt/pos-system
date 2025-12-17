package com.ffive.pos_system.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PaymentType {
    CASH((byte) 0),
    CARD((byte) 1),
    GIFT_CARD((byte) 2);
    private final byte key;
}
