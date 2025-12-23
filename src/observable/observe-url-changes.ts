import { Observable } from 'rxjs';
import { IMergeMapByStringConditionOptions, mergeMapStringCondition } from '../operators/merge-map-by-string-condition';
import { urlChange$ } from './url-change';

export interface IObserveUrlChangesOptions<T = unknown> extends Partial<IMergeMapByStringConditionOptions<T>> {}

/** Observation of `URL` changes that satisfy the conditions. */
export function observeUrlChanges(
  options?: IObserveUrlChangesOptions<unknown> & { project?: undefined }
): Observable<string>;
export function observeUrlChanges<O>(
  options: IObserveUrlChangesOptions<O>
): Observable<O>;
export function observeUrlChanges<O>(
  options: IObserveUrlChangesOptions<O> = {}
): Observable<O | string> {
  return urlChange$.pipe(
    mergeMapStringCondition({
      ...options,
      condition: options.condition || (() => true),
    })
  );
}
