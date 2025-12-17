package com.ffive.pos_system.dto;

import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUIBusiness {
    private UUID id;
    private GUIEmployee owner;
    private String name;
    private String address;
    private String contactInfo;
    private List<GUIEmployee> employees;
}
