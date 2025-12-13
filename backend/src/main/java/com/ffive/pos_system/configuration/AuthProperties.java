package com.ffive.pos_system.configuration;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "auth")
@Data
public class AuthProperties {
    private List<String> unsecuredEndpoints;
}
