package com.folia.server.tree;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TreeService {

    private final TreeRepository treeRepository;

    public List<Tree> findTreesNearby(double lat, double lng, int radiusMeters) {
        return treeRepository.findNearby(lat, lng, radiusMeters);
    }


}
