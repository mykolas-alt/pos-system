package com.ffive.pos_system.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum OrderStatus {
    OPEN((byte) 1),
    IN_PROGRESS((byte) 2),
    PAID((byte) 3),
    CANCELLED((byte) 4);

    private final byte key;
}
