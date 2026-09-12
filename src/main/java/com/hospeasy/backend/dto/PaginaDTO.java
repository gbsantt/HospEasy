package com.hospeasy.backend.dto;
import org.springframework.data.domain.Page;
import java.util.List;
public record PaginaDTO<T>(List<T> content,int number,int size,long totalElements,int totalPages) {
    public static <T> PaginaDTO<T> de(Page<T> p) { return new PaginaDTO<>(p.getContent(),p.getNumber(),p.getSize(),p.getTotalElements(),p.getTotalPages()); }
}
