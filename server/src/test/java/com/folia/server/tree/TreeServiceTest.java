package com.folia.server.tree;

import com.folia.server.common.messages.MessageKey;
import com.folia.server.exceptions.TreeNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TreeServiceTest {

    @Mock
    TreeRepository treeRepository;

    @InjectMocks
    TreeService treeService;

    @Test
    void findTreesNearby_delegatesToRepository() {
        List<Tree> expected = List.of(Tree.builder().species("Acer platanoides").build());
        when(treeRepository.findNearby(52.52, 13.405, 250)).thenReturn(expected);

        List<Tree> actual = treeService.findTreesNearby(52.52, 13.405, 250);

        assertThat(actual).isSameAs(expected);
        verify(treeRepository).findNearby(52.52, 13.405, 250);
    }

    @Test
    void createTree_populatesEntityAndSaves() {
        CreateTreeRequest request = new CreateTreeRequest(
                "Quercus robur",
                "English oak",
                52.52,
                13.405,
                SoilMoistureLevel.DRY,
                TreeHealthStatus.HEALTHY,
                Map.of("plantedBy", "alice")
        );

        when(treeRepository.save(any(Tree.class))).thenAnswer(invocation -> invocation.getArgument(0));
        LocalDateTime before = LocalDateTime.now();

        Tree created = treeService.createTree(request);

        assertThat(created.getSpecies()).isEqualTo("Quercus robur");
        assertThat(created.getCommonName()).isEqualTo("English oak");
        assertThat(created.getSoilMoistureLevel()).isEqualTo(SoilMoistureLevel.DRY);
        assertThat(created.getHealthStatus()).isEqualTo(TreeHealthStatus.HEALTHY);
        assertThat(created.getLocation().getX()).isEqualTo(13.405);
        assertThat(created.getLocation().getY()).isEqualTo(52.52);
        assertThat(created.getMetadata()).containsEntry("plantedBy", "alice");
        assertThat(created.getNextWateringDue()).isAfter(before.plusDays(2)).isBefore(before.plusDays(4));
    }

    @Test
    void getTreeByPublicId_missing_throwsNotFound() {
        UUID publicId = UUID.fromString("00000000-0000-0000-0000-000000000111");
        when(treeRepository.findByPublicId(publicId)).thenReturn(java.util.Optional.empty());

        assertThatThrownBy(() -> treeService.getTreeByPublicId(publicId))
                .isInstanceOf(TreeNotFoundException.class)
                .hasMessage(MessageKey.TREE_NOT_FOUND.name());
    }

    @Test
    void updateTree_appliesProvidedFields() {
        UUID publicId = UUID.fromString("00000000-0000-0000-0000-000000000222");
        Tree existing = Tree.builder()
                .publicId(publicId)
                .species("Old species")
                .commonName("Old common")
                .soilMoistureLevel(SoilMoistureLevel.MODERATE)
                .healthStatus(TreeHealthStatus.STRESSED)
                .location(point(13.0, 52.0))
                .metadata(new HashMap<>())
                .build();
        when(treeRepository.findByPublicId(publicId)).thenReturn(java.util.Optional.of(existing));
        when(treeRepository.save(any(Tree.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateTreeRequest request = new UpdateTreeRequest(
                "New species",
                "New common",
                SoilMoistureLevel.WET,
                TreeHealthStatus.HEALTHY,
                Map.of("note", "updated"),
                40.0,
                -74.0
        );

        Tree updated = treeService.updateTree(publicId, request);

        assertThat(updated.getSpecies()).isEqualTo("New species");
        assertThat(updated.getCommonName()).isEqualTo("New common");
        assertThat(updated.getSoilMoistureLevel()).isEqualTo(SoilMoistureLevel.WET);
        assertThat(updated.getHealthStatus()).isEqualTo(TreeHealthStatus.HEALTHY);
        assertThat(updated.getMetadata()).containsEntry("note", "updated");
        assertThat(updated.getLocation().getX()).isEqualTo(-74.0);
        assertThat(updated.getLocation().getY()).isEqualTo(40.0);
    }

    @Test
    void deleteTree_removesEntity() {
        UUID publicId = UUID.fromString("00000000-0000-0000-0000-000000000333");
        Tree existing = Tree.builder().publicId(publicId).build();
        when(treeRepository.findByPublicId(publicId)).thenReturn(java.util.Optional.of(existing));

        treeService.deleteTree(publicId);

        verify(treeRepository).delete(existing);
    }

    @Test
    void waterTree_updatesTimestampsAndMetadata() {
        UUID publicId = UUID.fromString("00000000-0000-0000-0000-000000000444");
        LocalDateTime wateredAt = LocalDateTime.of(2024, 1, 1, 10, 0);
        Tree existing = Tree.builder()
                .publicId(publicId)
                .soilMoistureLevel(SoilMoistureLevel.MODERATE)
                .metadata(new HashMap<>())
                .build();
        when(treeRepository.findByPublicId(publicId)).thenReturn(java.util.Optional.of(existing));
        when(treeRepository.save(any(Tree.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WaterTreeRequest request = new WaterTreeRequest("note", 1.5, wateredAt);

        Tree watered = treeService.waterTree(publicId, request);

        assertThat(watered.getLastWateredAt()).isEqualTo(wateredAt);
        assertThat(watered.getNextWateringDue()).isEqualTo(wateredAt.plusDays(6));
        assertThat(watered.getMetadata()).containsEntry("lastWaterNote", "note");
        assertThat(watered.getMetadata()).containsEntry("lastWaterAmountLiters", 1.5);
    }

    @Test
    void getTreesNeedingWater_filtersByDueDate() {
        LocalDateTime now = LocalDateTime.now();
        Tree due = Tree.builder().nextWateringDue(now.minusHours(1)).build();
        Tree notDue = Tree.builder().nextWateringDue(now.plusDays(1)).build();
        when(treeRepository.findNearby(52.0, 13.0, 200)).thenReturn(List.of(due, notDue));

        List<Tree> needingWater = treeService.getTreesNeedingWater(52.0, 13.0, 200);

        assertThat(needingWater).containsExactly(due);
    }

    @Test
    void searchTrees_filtersByCriteria() {
        Tree oak = Tree.builder()
                .species("Oak")
                .soilMoistureLevel(SoilMoistureLevel.DRY)
                .healthStatus(TreeHealthStatus.HEALTHY)
                .build();
        Tree pine = Tree.builder()
                .species("Pine")
                .soilMoistureLevel(SoilMoistureLevel.MODERATE)
                .healthStatus(TreeHealthStatus.STRESSED)
                .build();
        when(treeRepository.findAll()).thenReturn(List.of(oak, pine));

        TreeSearchCriteria criteria = new TreeSearchCriteria("Oak", TreeHealthStatus.HEALTHY, SoilMoistureLevel.DRY);

        List<Tree> result = treeService.searchTrees(criteria);

        assertThat(result).containsExactly(oak);
    }

    @Test
    void getTreeStats_summarizesCounts() {
        LocalDateTime now = LocalDateTime.now();
        Tree a = Tree.builder()
                .species("Oak")
                .healthStatus(TreeHealthStatus.HEALTHY)
                .soilMoistureLevel(SoilMoistureLevel.DRY)
                .nextWateringDue(now.minusDays(1))
                .build();
        Tree b = Tree.builder()
                .species("Oak")
                .healthStatus(TreeHealthStatus.STRESSED)
                .soilMoistureLevel(SoilMoistureLevel.WET)
                .nextWateringDue(now.plusDays(2))
                .build();
        when(treeRepository.findNearby(10.0, 20.0, 150)).thenReturn(List.of(a, b));

        TreeStats stats = treeService.getTreeStats(10.0, 20.0, 150);

        assertThat(stats.totalTrees()).isEqualTo(2);
        assertThat(stats.treesBySpecies()).containsEntry("Oak", 2L);
        assertThat(stats.treesByHealth()).containsEntry(TreeHealthStatus.HEALTHY, 1L);
        assertThat(stats.treesByHealth()).containsEntry(TreeHealthStatus.STRESSED, 1L);
        assertThat(stats.treesBySoilMoisture()).containsEntry(SoilMoistureLevel.DRY, 1L);
        assertThat(stats.treesBySoilMoisture()).containsEntry(SoilMoistureLevel.WET, 1L);
        assertThat(stats.treesNeedingWater()).isEqualTo(1);
    }

    private static Point point(double lng, double lat) {
        return new GeometryFactory(new PrecisionModel(), 4326).createPoint(new Coordinate(lng, lat));
    }
}
