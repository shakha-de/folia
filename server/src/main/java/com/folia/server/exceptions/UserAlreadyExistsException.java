package com.folia.server.exceptions;

import com.folia.server.common.messages.MessageKey;
import lombok.Getter;

public class UserAlreadyExistsException extends RuntimeException {
    @Getter
    private final MessageKey messageKey;
    @Getter
    private final transient Object[] args;

    public UserAlreadyExistsException(MessageKey messageKey, Object... args) {
        super(messageKey.name());
        this.messageKey = messageKey;
        this.args = args;
    }
}


