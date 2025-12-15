package com.ffive.pos_system.service.validation;

import java.util.List;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.service.validation.rules.ValidationRule;

@Component
public class OrderValidator extends Validator<Order> {

    public OrderValidator(List<ValidationRule<Order>> rules) {
        super(rules);
        // TODO Auto-generated constructor stub
    }
}
