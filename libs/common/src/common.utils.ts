import { plainToInstance } from "class-transformer";
import * as crypto from "crypto";

/**
 * Strips all properties that are not part of the target DTO
 */
export function cleanDto<T>(dtoClass: new () => T, data: unknown): T {
    return plainToInstance(dtoClass, data, {
        excludeExtraneousValues: true,
    });
}

export function hash(hashKey: string) {
    return crypto.createHash("sha256").update(hashKey).digest("hex");
}

type Primitive = string | number | boolean | null | undefined | symbol | bigint;

function isPrimitive(value: unknown): value is Primitive {
    return value === null || typeof value !== "object";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrimitiveArray(arr: unknown[]): arr is Primitive[] {
    return arr.every(isPrimitive);
}

function sortedPrimitiveArray(arr: Primitive[]): Primitive[] {
    return [...arr].sort((a, b) => {
        if (a === b) return 0;
        return String(a) < String(b) ? -1 : 1;
    });
}

export function flattenDiffPaths(obj: Record<string, any>, prefix = "", result: string[] = []): string[] {
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        const path = prefix ? `${prefix}.${key}` : key;

        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            flattenDiffPaths(value, path, result);
        } else {
            result.push(path);
        }
    }

    return result;
}

export function deepDiff<T>(initialData: T, currentData: T): Partial<T> | undefined {
    // Same value or reference
    if (Object.is(initialData, currentData)) {
        return undefined;
    }

    // Primitive change
    if (isPrimitive(initialData) || isPrimitive(currentData)) {
        return currentData as Partial<T>;
    }

    // Array handling
    if (Array.isArray(initialData) && Array.isArray(currentData)) {
        // 🔹 Unordered comparison for primitive arrays
        if (isPrimitiveArray(initialData) && isPrimitiveArray(currentData)) {
            if (initialData.length !== currentData.length) {
                return currentData as Partial<T>;
            }

            const a = sortedPrimitiveArray(initialData);
            const b = sortedPrimitiveArray(currentData);

            for (let i = 0; i < a.length; i++) {
                if (!Object.is(a[i], b[i])) {
                    return currentData as Partial<T>;
                }
            }

            return undefined;
        }

        // 🔹 Default behavior for non-primitive arrays
        if (initialData.length !== currentData.length) {
            return currentData as Partial<T>;
        }

        for (let i = 0; i < initialData.length; i++) {
            if (deepDiff(initialData[i], currentData[i]) !== undefined) {
                return currentData as Partial<T>;
            }
        }

        return undefined;
    }

    // Object handling
    if (isPlainObject(initialData) && isPlainObject(currentData)) {
        const diff: Record<string, unknown> = {};
        let changed = false;

        const keys = new Set([...Object.keys(initialData), ...Object.keys(currentData)]);

        for (const key of keys) {
            const childDiff = deepDiff(initialData[key], currentData[key]);

            if (childDiff !== undefined) {
                diff[key] = childDiff;
                changed = true;
            }
        }

        return changed ? (diff as Partial<T>) : undefined;
    }

    // Structural mismatch fallback
    return currentData as Partial<T>;
}
