package com.ffive.pos_system.dto;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Data;

@Data
@Builder(toBuilder = true)
public class GUIEmployee {
    private UUID id;
    private String name;
    private String email;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private GUIEmployee manager;
}
