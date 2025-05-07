package com.alania.alania_backend.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping
    public String ping() {
        return "Le backend est accessible 🎉";
    }
}
