package com.folia.server.tree;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record WaterTreeRequest(
        @Size(max = 500) String notes,
        @Min(0) Double waterAmountLiters,
        LocalDateTime wateredAt
) {
    public java.util.Optional<String> optionalNotes() { return java.util.Optional.ofNullable(notes); }
    public java.util.Optional<Double> optionalWaterAmountLiters() { return java.util.Optional.ofNullable(waterAmountLiters); }
    public java.util.Optional<LocalDateTime> optionalWateredAt() { return java.util.Optional.ofNullable(wateredAt); }
}
