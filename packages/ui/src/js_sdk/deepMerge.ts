import { deepClone } from './deepClone';
import { test } from './test';

type PlainObject = Record<string, any>;

export function deepMerge<T extends PlainObject, S extends PlainObject>(target: T, source: S): T & S {
	const output = deepClone(target) as PlainObject;

	if (!test.object(source)) {
		return output as T & S;
	}

	for (const [key, sourceValue] of Object.entries(source)) {
		const targetValue = output[key];

		if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
			output[key] = targetValue.concat(sourceValue);
			continue;
		}

		if (test.object(targetValue) && test.object(sourceValue)) {
			output[key] = deepMerge(targetValue, sourceValue);
			continue;
		}

		output[key] = deepClone(sourceValue);
	}

	return output as T & S;
}
