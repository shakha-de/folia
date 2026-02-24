package com.folia.server.common.messages;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageSource messageSource;

    public String get(MessageKey key, Locale locale, Object... args) {
        return messageSource.getMessage(key.getValue(), args, locale);
    }

    public String get(String rawKey, Locale locale, Object... args) {
        return messageSource.getMessage(rawKey, args, rawKey, locale);
    }

    public String resolve(String rawKey, String defaultMessage, Locale locale, Object... args) {
        return messageSource.getMessage(rawKey, args, defaultMessage, locale);
    }
}
