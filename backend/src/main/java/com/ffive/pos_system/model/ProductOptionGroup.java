package com.ffive.pos_system.model;

import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@Audited
@NoArgsConstructor
@SQLDelete(sql = "UPDATE productoptiongroup SET deletedat = now() WHERE id = ?")
@Table(name = "productoptiongroup")
public class ProductOptionGroup extends SoftDeletable {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String name;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ProductOptionType type;

    @Column(name = "minselect")
    private int minSelect;

    @Column(name = "maxselect")
    private int maxSelect;

    @OneToMany(mappedBy = "optionGroup")
    private List<ProductOptionValue> optionValues;

}
