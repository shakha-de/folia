package com.folia.server.exceptions;

import com.folia.server.common.messages.MessageKey;
import lombok.Getter;

public class TokenExpiredException extends RuntimeException {
    @Getter
    private final MessageKey messageKey;
    @Getter
    private final Object[] args;

    public TokenExpiredException(MessageKey messageKey, Object... args) {
        super(messageKey.name());
        this.messageKey = messageKey;
        this.args = args;
    }
}
