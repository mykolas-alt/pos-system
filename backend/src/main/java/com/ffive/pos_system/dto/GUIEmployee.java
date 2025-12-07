package com.ffive.pos_system.dto;

import java.util.UUID;

import com.ffive.pos_system.model.Employee;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUIEmployee {
    private UUID id;
    private String name;
    private String email;
    private Employee manager;
}
