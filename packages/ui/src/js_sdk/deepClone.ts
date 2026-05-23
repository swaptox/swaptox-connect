import { test } from './test';

export function deepClone<T>(value: T): T {
	if (value === null || typeof value !== 'object') {
		return value;
	}

	if (test.array(value)) {
		return value.map((item) => deepClone(item)) as T;
	}

	const output: Record<string, unknown> = {};
	for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
		output[key] = deepClone(item);
	}
	return output as T;
}
