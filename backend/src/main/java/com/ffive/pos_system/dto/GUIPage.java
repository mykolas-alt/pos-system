package com.ffive.pos_system.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUIPage<T extends GUIObject> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
}
