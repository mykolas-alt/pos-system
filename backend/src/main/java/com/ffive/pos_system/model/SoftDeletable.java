package com.ffive.pos_system.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class SoftDeletable {

    @Column(name = "deletedat")
    protected LocalDateTime deletedAt;

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
