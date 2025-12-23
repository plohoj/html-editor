import { Observable, OperatorFunction } from "rxjs";
import { IMergeMapByConditionOptions, mergeMapByCondition } from './merge-map-by-condition';

export interface IMergeMapByStringConditionOptions<O = unknown>
  extends Omit<IMergeMapByConditionOptions<string, O>, 'condition'> {

  /** The condition that the source string must satisfy */
  condition: RegExp | ((value: string) => boolean);
}

export function getStringConditionFunction(
  condition: RegExp | ((value: string) => boolean)
): (value: string) => boolean {
  return typeof condition === 'function' ? condition : (value: string) => condition.test(value);
}

/** The operator creates a separate stream when the source string is validated. */
export function mergeMapStringCondition(
  options: IMergeMapByStringConditionOptions & { project?: undefined },
): OperatorFunction<string, string>;
export function mergeMapStringCondition<O>(
  options: IMergeMapByStringConditionOptions<O>,
): OperatorFunction<string, O>;
export function mergeMapStringCondition(
  condition: RegExp | ((value: string) => boolean),
  project?: undefined,
  options?: Omit<IMergeMapByStringConditionOptions, 'condition' | 'project'>,
): OperatorFunction<string, string>;
export function mergeMapStringCondition<O>(
  condition: RegExp | ((value: string) => boolean),
  project: (url: string) => Observable<O>,
  options?: Omit<IMergeMapByStringConditionOptions, 'condition' | 'project'>,
): OperatorFunction<string, O>;
export function mergeMapStringCondition<O>(
  conditionOrOptions: RegExp | ((value: string) => boolean) | IMergeMapByStringConditionOptions<O>,
  project?: ((url: string) => Observable<O>),
  options?: Omit<IMergeMapByStringConditionOptions, 'condition' | 'project'>,
): OperatorFunction<string, O | string> {
  if ('condition' in conditionOrOptions) {
    return mergeMapByCondition({
      ...conditionOrOptions,
      condition: getStringConditionFunction(conditionOrOptions.condition),
    });
  } else {
    return mergeMapByCondition({
      ...options,
      condition: getStringConditionFunction(conditionOrOptions),
      project,
    });
  }
}
