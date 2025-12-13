
package com.ffive.pos_system.model.conteverter;

import com.ffive.pos_system.model.OrderStatus;

import jakarta.persistence.AttributeConverter;

public class OderStatusConverter implements AttributeConverter<OrderStatus, Byte> {

    @Override
    public Byte convertToDatabaseColumn(OrderStatus status) {
        if (status == null) {
            return null;
        }

        return status.getKey();
    }

    @Override
    public OrderStatus convertToEntityAttribute(Byte dbData) {
        if (dbData == null) {
            return null;
        }

        for (OrderStatus status : OrderStatus.values()) {
            if (status.getKey() == dbData) {
                return status;
            }
        }

        throw new IllegalArgumentException("Unknown database value: " + dbData);
    }
}
