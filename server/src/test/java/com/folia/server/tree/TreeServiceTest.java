package com.folia.server.tree;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

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
}
