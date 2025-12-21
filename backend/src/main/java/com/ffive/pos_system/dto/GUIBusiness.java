package com.ffive.pos_system.dto;

import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUIBusiness implements GUIObject {
    private UUID id;
    private GUIEmployee owner;
    private String name;
    private String address;
    private String contactInfo;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<GUIEmployee> employees;
    private BusinessType businessType;
}
