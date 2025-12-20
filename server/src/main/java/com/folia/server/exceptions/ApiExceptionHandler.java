package com.folia.server.exceptions;

import com.folia.server.common.messages.MessageKey;
import com.folia.server.common.messages.MessageService;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@RequiredArgsConstructor
public class ApiExceptionHandler {

    private final MessageService messageService;

    @ExceptionHandler(ConstraintViolationException.class)
    ProblemDetail handleConstraintViolation(ConstraintViolationException exception) {
        ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        detail.setTitle("Validation failed");
        detail.setDetail(exception.getMessage());
        return detail;
    }

    @ExceptionHandler(UserNotFoundException.class)
    ProblemDetail handleUserNotFound(UserNotFoundException exception) {
        return notFoundDetail(exception.getMessageKey(), exception.getArgs());
    }

    @ExceptionHandler(TreeNotFoundException.class)
    ProblemDetail handleTreeNotFound(TreeNotFoundException exception) {
        return notFoundDetail(exception.getMessageKey(), exception.getArgs());
    }

    private ProblemDetail notFoundDetail(MessageKey messageKey, Object[] args) {
        ProblemDetail detail = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        detail.setTitle("Not found");
        detail.setDetail(messageService.get(messageKey, LocaleContextHolder.getLocale(), args));
        return detail;
    }
}
