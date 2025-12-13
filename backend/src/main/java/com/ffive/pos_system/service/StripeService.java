package com.ffive.pos_system.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripeService {

    @Value("${stripe.api.key}") // need to add it to properties somewhere
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public String chargeCard(String token, BigDecimal amount) throws StripeException {
        // stripe deals in cents
        int centsAmount = amount.multiply(BigDecimal.valueOf(100)).intValue();

        Map<String, Object> chargeParams = new HashMap<>();
        chargeParams.put("amount", centsAmount);
        chargeParams.put("currency", "eur");
        chargeParams.put("source", token); // this token represents the "card"
        chargeParams.put("description", "Point-of-Sale Transaction");

        Charge charge = Charge.create(chargeParams);
        return charge.getId(); // returning stripe's transaction ID
    }
}