package com.ats.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        System.out.println(">>> Registering Resource Handler for /uploads/**");
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
