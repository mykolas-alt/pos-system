package com.ffive.pos_system.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ReservationStatus {
    OPEN((byte) 1),
    IN_PROGRESS((byte) 2),
    PAID((byte) 3),
    REFUNDED((byte) 4),
    CANCELLED((byte) 5),
    PARTIALLY_PAID((byte) 6);

    private final byte key;
}