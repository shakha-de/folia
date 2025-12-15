package com.folia.server.tree;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/trees")
@RequiredArgsConstructor
public class TreeController {

    private final TreeService treeService;

    @GetMapping("/nearby")
    public List<TreeDto> nearby(
            @RequestParam @NotNull @Min(-90) @Max(90) Double lat,
            @RequestParam @NotNull @Min(-180) @Max(180) Double lng,
            @RequestParam(defaultValue = "250") @Min(1) @Max(20000) Integer radiusMeters
    ) {
        return treeService.findTreesNearby(lat, lng, radiusMeters)
                .stream()
                .map(TreeDto::from)
                .toList();
    }
}
