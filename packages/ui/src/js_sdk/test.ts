function array(value: unknown): value is unknown[] {
	return Array.isArray(value);
}

function object(value: unknown): value is Record<string, unknown> {
	return Object.prototype.toString.call(value) === '[object Object]';
}

export const test = {
	object,
	array,
};
