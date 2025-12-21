export function getStringConditionMatcher(
    condition: RegExp | ((value: string) => boolean)
): (value: string) => boolean {
    return typeof condition === 'function' ? condition : (value: string) => condition.test(value);
}
