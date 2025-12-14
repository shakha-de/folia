package com.folia.server.user;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserRole {
    CITIZEN("Citizen/Community member"),
    MUNICIPAL_STAFF("City Council employees"),
    VERIFIED_EXPERT("Tested tree specialist"),
    ADMIN("Administrator"),;

    private final String displayName;
}
