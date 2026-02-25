package com.folia.server.tree;

import com.folia.server.common.ApiResponse;
import com.folia.server.common.util.ResponseUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trees")
@Validated
@RequiredArgsConstructor
public class TreeController {

    private final TreeService treeService;

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<TreeDto>>> nearby(
            @RequestParam @NotNull @Min(-90) @Max(90) Double lat,
            @RequestParam @NotNull @Min(-180) @Max(180) Double lng,
            @RequestParam(defaultValue = "250") @Min(1) @Max(30000) Integer radiusMeters) {
        List<Tree> trees = treeService.findTreesNearby(lat, lng, radiusMeters);
        return ResponseUtils.ok(
                trees.stream()
                        .map(TreeDto::from)
                        .toList(),
                "Nearby trees retrieved successfully");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TreeDto>> create(@RequestBody @Valid CreateTreeRequest request) {
        Tree tree = treeService.createTree(request);
        return ResponseUtils.created(
                TreeDto.from(tree),
                "Tree created successfully");
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<TreeDto>> findById(@PathVariable UUID publicId) {
        Tree tree = treeService.getTreeByPublicId(publicId);
        return ResponseUtils.ok(TreeDto.from(tree), "Tree retrieved successfully");
    }

    @PutMapping("/{publicId}")
    public ResponseEntity<ApiResponse<TreeDto>> update(
            @PathVariable UUID publicId,
            @RequestBody @Valid UpdateTreeRequest request) {
        Tree tree = treeService.updateTree(publicId, request);
        return ResponseUtils.ok(TreeDto.from(tree), "Tree updated successfully");
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID publicId) {
        treeService.deleteTree(publicId);
        return ResponseUtils.noContent("Tree deleted successfully");
    }

    @PostMapping("/{publicId}/water")
    public ResponseEntity<ApiResponse<TreeDto>> water(
            @PathVariable UUID publicId,
            @RequestBody @Valid WaterTreeRequest request) {
        Tree tree = treeService.waterTree(publicId, request);
        return ResponseUtils.ok(TreeDto.from(tree), "Tree watered successfully");
    }

    @GetMapping("/needs-watering")
    public ResponseEntity<ApiResponse<List<TreeDto>>> needsWatering(
            @RequestParam @NotNull @Min(-90) @Max(90) Double lat,
            @RequestParam @NotNull @Min(-180) @Max(180) Double lng,
            @RequestParam(defaultValue = "1000") @Min(1) @Max(50000) Integer radiusMeters) {
        List<Tree> trees = treeService.getTreesNeedingWater(lat, lng, radiusMeters);
        return ResponseUtils.ok(
                trees.stream().map(TreeDto::from).toList(),
                "Trees needing water retrieved successfully");
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TreeDto>>> search(TreeSearchCriteria criteria) {
        List<Tree> trees = treeService.searchTrees(criteria);
        return ResponseUtils.ok(
                trees.stream().map(TreeDto::from).toList(),
                "Trees searched successfully");
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<TreeStats>> statistics(
            @RequestParam @NotNull @Min(-90) @Max(90) Double lat,
            @RequestParam @NotNull @Min(-180) @Max(180) Double lng,
            @RequestParam(defaultValue = "5000") @Min(1) @Max(100000) Integer radiusMeters) {
        TreeStats stats = treeService.getTreeStats(lat, lng, radiusMeters);
        return ResponseUtils.ok(stats, "Tree statistics retrieved successfully");
    }
}
