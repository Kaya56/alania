package com.alania.alania_backend.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SdpStorage {
    private String sdp;
    private LocalDateTime expiration;

    public SdpStorage(String sdp, LocalDateTime expiration) {
        this.sdp = sdp;
        this.expiration = expiration;
    }
}
