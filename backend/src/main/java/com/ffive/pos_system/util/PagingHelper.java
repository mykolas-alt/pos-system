package com.ffive.pos_system.util;

import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class PagingHelper {

    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int DEFAULT_PAGE = 0;
    private static final int MAX_PAGE_SIZE = 200;

    public int calculateOffset(int pageNumber, int pageSize) {
        return (pageNumber - 1) * pageSize;
    }

    public int getValidPageNumber(Optional<Integer> pageNumber) {
        if (pageNumber == null) {
            return DEFAULT_PAGE;
        }

        return pageNumber
                .filter(num -> num >= 0)
                .orElse(DEFAULT_PAGE);
    }

    public int getValidPageSize(Optional<Integer> pageSize) {
        if (pageSize == null) {
            return DEFAULT_PAGE_SIZE;
        }

        return pageSize
                .filter(size -> size > 0 && size <= MAX_PAGE_SIZE)
                .orElse(DEFAULT_PAGE_SIZE);
    }
}
