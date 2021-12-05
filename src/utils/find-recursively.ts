export type RecursivelyFindMather = (propertyName: string, value: unknown, path: string) => boolean;

export function findRecursively(obj: unknown, mather: RecursivelyFindMather): Record<string, unknown> | null {
    const seen = new Set<unknown>();
    const searched: Record<string, unknown> = {};
    const needFind = new Set<[path: string | undefined, value: unknown]>([[undefined, obj]]);

    function addToCheck(path: string, value: unknown) {
        if (seen.has(value) ) {
            return;
        }
        needFind.add([path, value]);
        seen.add(value);
    }

    while (true) {
        const iterator = needFind.values().next();
        if (iterator.done) {
            break;
        }
        const path = iterator.value[0];
        const iteratedObj = iterator.value[1];
        needFind.delete(iterator.value);

        if (!iteratedObj) {
            continue;
        }
        if (iteratedObj instanceof Array) {
            for (const [index, value] of (iteratedObj as unknown[]).entries()) {
                if (value )
                addToCheck(`${path || ''}[${index}]`, value);
            }
        } else if (typeof iteratedObj === "object") {
            for (const key of Object.keys(iteratedObj as object)) {
                const value: unknown = (iteratedObj as any)[key];
                const keyPath = path ? `${path}.${key}` : key;
                if (mather(key, value, keyPath)) {
                    searched[keyPath] = value;
                }
                addToCheck(keyPath, value);
            }
        }
    }

    if (Object.keys(searched).length === 0) {
        return null;
    }
    return searched;
}

export function findRecursivelyPropertyName(obj: unknown, propertyName: string): Record<string, unknown> | null {
    return findRecursively(obj, matchedPropertyName => matchedPropertyName === propertyName);
}