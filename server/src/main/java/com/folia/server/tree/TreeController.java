package com.folia.server.tree;

import com.folia.server.common.ApiResponse;
import com.folia.server.common.messages.MessageKey;
import com.folia.server.common.messages.MessageService;
import com.folia.server.common.util.ResponseUtils;
import com.folia.server.user.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/trees")
@Validated
@RequiredArgsConstructor
public class TreeController {

    private final TreeService treeService;
    private final MessageService ms;

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<TreeDto>>> nearby(
            @RequestParam @NotNull @Min(-90) @Max(90) Double lat,
            @RequestParam @NotNull @Min(-180) @Max(180) Double lng,
            @RequestParam(defaultValue = "250") @Min(1) @Max(30000) Integer radiusMeters,
            Locale locale) {
        List<Tree> trees = treeService.findTreesNearby(lat, lng, radiusMeters);
        return ResponseUtils.ok(
                trees.stream()
                        .map(TreeDto::from)
                        .toList(),
                ms.get(MessageKey.TREES_NEARBY_RETRIEVED_SUCCESSFULLY, locale));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TreeDto>>> myTrees(
        Locale locale,
        @AuthenticationPrincipal User user
    ) {
        List<Tree> trees = treeService.getMyTrees(user);
        return ResponseUtils.ok(
            trees.stream().map(TreeDto::from).toList(),
            ms.get(MessageKey.TREES_RETRIEVED_SUCCESSFULLY, locale)
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TreeDto>> create(
        @RequestBody @Valid CreateTreeRequest request,
        @AuthenticationPrincipal User user,
        Locale locale

    ) {
        Tree tree = treeService.createTree(request, user);
        return ResponseUtils.created(
                TreeDto.from(tree),
                ms.get(MessageKey.TREE_CREATED_SUCCESSFULLY, locale));
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<TreeDto>> findById(@PathVariable UUID publicId, Locale locale) {
        Tree tree = treeService.getTreeByPublicId(publicId);
        return ResponseUtils.ok(TreeDto.from(tree), ms.get(MessageKey.TREE_RETRIEVED_SUCCESSFULLY, locale));
    }

    @PutMapping("/{publicId}")
    public ResponseEntity<ApiResponse<TreeDto>> update(
            @PathVariable UUID publicId,
            @RequestBody @Valid UpdateTreeRequest request,
            Locale locale) {
        Tree tree = treeService.updateTree(publicId, request);
        return ResponseUtils.ok(TreeDto.from(tree), ms.get(MessageKey.TREE_UPDATED_SUCCESSFULLY, locale));
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<ApiResponse<Void>> delete(
        @PathVariable UUID publicId,
        Locale locale
    ) {
        treeService.deleteTree(publicId);
        return ResponseUtils.ok(null, ms.get(MessageKey.TREE_DELETED_SUCCESSFULLY, locale));
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
