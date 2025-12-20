package com.ffive.pos_system.converter.gui;

import java.util.function.Function;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import com.ffive.pos_system.dto.GUIObject;
import com.ffive.pos_system.dto.GUIPage;

@Component
public class GUIPageConverter {

    public <T extends GUIObject, U> GUIPage<T> convertToGUIPage(Page<U> page, Function<U, T> contentMapper) {
        return GUIPage.<T>builder()
                .content(page.getContent().stream().map(contentMapper).toList())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }
}
