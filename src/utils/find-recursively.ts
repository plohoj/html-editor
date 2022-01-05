export interface IFindRecursivelyMatherOptions {
    field?: unknown;
    value: unknown;
    path?: string;
    depth: number;
}

export type FindRecursivelyMatcher = (options: Readonly<IFindRecursivelyMatherOptions>) => boolean;
export type FindRecursivelyContinue = (result: Readonly<FindRecursivelyResult>) => boolean;
export type FindRecursivelyResult = Record<string, unknown> | null;

export interface IFindRecursivelyOptions {
    /**
     * Checking a field for compliance with conditions  
     * If the method returns `true`, then the field will be added to the result list
     */
    matcher?: FindRecursivelyMatcher;
    /**
     * Filtering out the need for recursive field validation.
     * * If the method returns `true`, then all child fields will be checked recursively.
     * * If the method returns `false`, then the field is excluded from recursive validation.
     */
    filter?: FindRecursivelyMatcher;
    /**
     * Checking whether to continue searching. This check occurs after each new found field.
     * * If the method returns `true`, then the recursive search terminates immediately.
     * * If the method returns `false`, then the recursive search will continue.
     */
    stop?: FindRecursivelyContinue;
    /** Regular expression to match with a constructed path */
    pathRegExp?: RegExp;
    /** Regular expression to match with a constructed path */
    fieldRegExp?: RegExp;
    /** Maximum depth of recursive search */
    maxDepth?: number;
    //** Minimum depth of recursive search */
    minDepth?: number;
    /**
     * Checking getter fields
     * * If the value is `true`, then the field getter will not be called to get the result.
     * Accordingly, the result of the getter will not be checked.
     * * If the value is `false`, then the field getter will be called to get the result.
     * Getter result will be checked
     */
    isIgnoreGetters?: boolean;
    /**
     * Error handling when getting a result from a getter method.
     * * If the method returns `true`, then the recursive search will continue.
     * * If the method returns `false`, then the recursive search terminates immediately.
     */
    continueAfterGetterError?: (error: unknown) => boolean;
}

function trueStub(): true {
    return true;
}

function falseStub(): false {
    return false;
}

/** Recursive search on entity fields */
export function findRecursively(obj: unknown, options: IFindRecursivelyOptions = {}): FindRecursivelyResult {
    /** {value: path[]} */
    const seen = new Map<unknown, Array<string | undefined>>();
    const searched: Record<string, unknown> = {};
    const needSeen = new Set<IFindRecursivelyMatherOptions>([{
        value: obj,
        depth: 0,
    }]);
    const {
        matcher = falseStub,
        filter = trueStub,
        continueAfterGetterError = trueStub,
        stop = falseStub,
        minDepth = 1,
        maxDepth = Infinity,
    } = options;
    const pathRegExpCheck =  options.pathRegExp
        ? (path?: string) => path ? options.pathRegExp?.test(path) : false
        : falseStub;
    const fieldRegExpCheck =  options.fieldRegExp
        ? (field?: unknown) => typeof field === 'string' ? options.fieldRegExp?.test(field) : false
        : falseStub;
    let needStop: boolean = false;

    function checkForNeedSeen(options: IFindRecursivelyMatherOptions) {
        if (options.depth > maxDepth) {
            return;
        }
        const isPrimitiveOrFunction = options.value === null || typeof options.value !== 'object';
        if (!isPrimitiveOrFunction) {
            const seenPathsForValue: Array<string | undefined> | undefined = seen.get(options.value);
            if (seenPathsForValue) {
                const hasCircularPath = seenPathsForValue.some(path => options.path && path?.includes(options.path));
                if (hasCircularPath) {
                    return;
                }
            }
            if (filter(options)) {
                needSeen.add(options);
                if (seenPathsForValue) {
                    seenPathsForValue.push(options.path);
                } else {
                    seen.set(options.value, [options.path]);
                }
            }
        }
        if (options.depth < minDepth) {
            return;
        }
        if (matcher(options) || pathRegExpCheck(options.path) || fieldRegExpCheck(options.field)) {
            searched[options.path || '{}'] = options.value;
            if (stop(searched)) {
                needStop = true;
            }
        }
    }

    function iterateArrayLike(
        iterator: IterableIterator<[unknown, unknown]>,
        pathBuilder: (fieldIndex: unknown) => string,
        incrementalDepth: number,
    ): void {
        for (const [fieldIndex, fieldValue] of iterator) {
            checkForNeedSeen({
                field: fieldIndex,
                value: fieldValue,
                path: pathBuilder(fieldIndex),
                depth: incrementalDepth,
            });
            if (needStop) {
                return;
            }
        }
    }

    while (!needStop) {
        const iterator = needSeen.values().next();
        if (iterator.done) {
            break;
        }
        const {value, path, depth} = iterator.value;
        const incrementalDepth = depth + 1;
        needSeen.delete(iterator.value);

        if (value instanceof Array) {
            iterateArrayLike(
                (value as unknown[]).entries(),
                (fieldIndex) => `${path || ''}[${fieldIndex}]`,
                incrementalDepth,
            );
        } if (value instanceof Map) {
            iterateArrayLike(
                (value as Map<unknown, unknown>).entries(),
                (fieldIndex) => `${path || ''}{${fieldIndex}}`,
                incrementalDepth,
            );
        } if (value instanceof Set) {
            for (const [fieldIndex, fieldValue] of ([...value] as unknown[]).entries()) {
                checkForNeedSeen({
                    field: fieldValue,
                    value: fieldValue,
                    path: `${path || ''}<${fieldIndex}>`,
                    depth: incrementalDepth,
                });
                if (needStop) {
                    break;
                }
            }
        } else if (typeof value === "object") {
            for (const key of Object.keys(value as object)) {
                let fieldValue: unknown;
                if (Object.getOwnPropertyDescriptor(value, key)?.get && options.isIgnoreGetters) {
                    continue;
                }
                try {
                    fieldValue = (value as any)[key];
                } catch (error: unknown) {
                    if (!continueAfterGetterError(error)) {
                        needStop = true;
                        break;
                    }
                    fieldValue = error;
                }

                checkForNeedSeen({
                    field: key,
                    value: fieldValue,
                    path: path ? `${path}.${key}` : key,
                    depth: incrementalDepth
                });
                if (needStop) {
                    break;
                }
            }
        }
    }

    if (Object.keys(searched).length === 0) {
        return null;
    }
    return searched;
}
