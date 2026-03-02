package com.folia.server.tree;

import com.folia.server.common.messages.MessageKey;
import com.folia.server.exceptions.TreeNotFoundException;
import com.folia.server.stats.UserStatsService;
import com.folia.server.user.User;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TreeService {

    private final TreeRepository treeRepository;
    private final UserStatsService statsService;

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    public List<Tree> findTreesNearby(double lat, double lng, int radiusMeters) {
        return treeRepository.findNearby(lat, lng, radiusMeters);
    }

    public Tree createTree(CreateTreeRequest request, User registerer) {
        Tree tree = Tree.builder()
                .species(request.species())
                .commonName(request.commonName())
                .location(point(request.lng(), request.lat()))
                .soilMoistureLevel(request.soilMoistureLevel())
                .healthStatus(request.healthStatus())
                .metadata(request.metadata())
                .registeredBy(registerer)
                .build();

        statsService.onRegistered(registerer);
        tree.setNextWateringDue(calculateNextWateringDue(request.soilMoistureLevel(), LocalDateTime.now()));
        return treeRepository.save(tree);
    }

    public Tree getTreeByPublicId(UUID publicId) {
        return treeRepository.findByPublicId(publicId)
                .orElseThrow(() -> new TreeNotFoundException(MessageKey.TREE_NOT_FOUND, publicId));
    }

    public Tree updateTree(UUID publicId, UpdateTreeRequest request) {
        Tree tree = getTreeByPublicId(publicId);

        request.optionalSpecies().ifPresent(tree::setSpecies);
        request.optionalCommonName().ifPresent(tree::setCommonName);
        request.optionalSoilMoistureLevel().ifPresent(tree::setSoilMoistureLevel);
        request.optionalHealthStatus().ifPresent(tree::setHealthStatus);
        request.optionalMetadata().ifPresent(tree::setMetadata);
        var optLat = request.optionalLat();
        var optLng = request.optionalLng();
        if (optLat.isPresent() && optLng.isPresent()) {
            tree.setLocation(point(optLng.get(), optLat.get()));
        }

        return treeRepository.save(tree);
    }

    public void deleteTree(UUID publicId) {
        Tree tree = getTreeByPublicId(publicId);
        treeRepository.delete(tree);
    }

    public Tree waterTree(UUID publicId, WaterTreeRequest request, User user) {
        Tree tree = getTreeByPublicId(publicId);

        LocalDateTime wateredAt = request.optionalWateredAt().orElse(LocalDateTime.now());
        tree.setLastWateredAt(wateredAt);
        tree.setNextWateringDue(calculateNextWateringDue(tree.getSoilMoistureLevel(), wateredAt));

        // Record a simple note if provided
        request.optionalNotes().ifPresent(note -> tree.getMetadata().put("lastWaterNote", note));
        request.optionalWaterAmountLiters()
                .ifPresent(amount -> tree.getMetadata().put("lastWaterAmountLiters", amount));

        statsService.onWatered(user, tree);

        return treeRepository.save(tree);
    }

    public List<Tree> getTreesNeedingWater(double lat, double lng, int radiusMeters) {
        return treeRepository.findTreesNeedingWater(lat, lng, radiusMeters, LocalDateTime.now());
    }

    public List<Tree> searchTrees(TreeSearchCriteria criteria) {
        return treeRepository.searchTrees(
                criteria.species(),
                criteria.healthStatus() != null ? criteria.healthStatus().name() : null,
                criteria.soilMoistureLevel() != null ? criteria.soilMoistureLevel().name() : null);
    }

    public TreeStats getTreeStats(double lat, double lng, int radiusMeters) {
        List<Tree> trees = treeRepository.findNearby(lat, lng, radiusMeters);

        long total = trees.size();
        var bySpecies = trees.stream().collect(Collectors.groupingBy(Tree::getSpecies, Collectors.counting()));
        var byHealth = trees.stream().collect(Collectors.groupingBy(Tree::getHealthStatus, Collectors.counting()));
        var bySoil = trees.stream().collect(Collectors.groupingBy(Tree::getSoilMoistureLevel, Collectors.counting()));
        long needingWater = trees.stream()
                .filter(t -> t.getNextWateringDue() == null || !t.getNextWateringDue().isAfter(LocalDateTime.now()))
                .count();

        return new TreeStats(total, bySpecies, byHealth, bySoil, needingWater, LocalDateTime.now());
    }

    private static Point point(double lng, double lat) {
        return GEOMETRY_FACTORY.createPoint(new Coordinate(lng, lat));
    }

    private static LocalDateTime calculateNextWateringDue(SoilMoistureLevel level, LocalDateTime from) {
        int days;
        if (level == null) {
            days = 7;
        } else {
            switch (level) {
                case DRY -> days = 3;
                case MODERATE -> days = 6;
                case WET -> days = 12;
                default -> days = 7;
            }
        }
        return from.plusDays(days);
    }

    public List<Tree> getMyTrees(User user) {
        return treeRepository.findByRegisteredBy(user);
    }
}
