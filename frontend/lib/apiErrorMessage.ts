type ApiErrorPayload = {
    message?: string;
    errors?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function normalizeText(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function collectErrorDetails(errors: unknown): string[] {
    if (!errors) return [];

    if (typeof errors === "string") {
        return normalizeText(errors) ? [errors.trim()] : [];
    }

    if (Array.isArray(errors)) {
        return errors.flatMap((item) => collectErrorDetails(item));
    }

    if (isRecord(errors)) {
        return Object.entries(errors).flatMap(([key, value]) => {
            const normalized = normalizeText(value);
            if (normalized) return [`${key}: ${normalized}`];

            const nested = collectErrorDetails(value);
            if (nested.length === 0) return [];

            return nested.map((entry) => `${key}: ${entry}`);
        });
    }

    return [];
}

function getErrorPayload(error: unknown): ApiErrorPayload | undefined {
    if (!isRecord(error)) return undefined;

    const responseData = isRecord(error.response) && isRecord(error.response.data)
        ? (error.response.data as ApiErrorPayload)
        : undefined;

    if (responseData) return responseData;

    if ("message" in error || "errors" in error) {
        return error as ApiErrorPayload;
    }

    return undefined;
}

export function extractApiErrorMessage(error: unknown, fallback: string): string {
    const payload = getErrorPayload(error);
    const message = normalizeText(payload?.message);
    const errorDetails = collectErrorDetails(payload?.errors);

    if (message && errorDetails.length > 0) {
        return `${message} ${errorDetails.join(" ")}`;
    }

    if (errorDetails.length > 0) {
        return errorDetails.join(" ");
    }

    if (message) {
        return message;
    }

    return fallback;
}
