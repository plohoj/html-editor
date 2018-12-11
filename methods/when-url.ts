import { Observable, OperatorFunction, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, skip, takeUntil, tap, windowCount } from 'rxjs/operators';
import { historyChange } from '../tools/history-change';

/**
 * @param href expected URL
 * @param operations RxJS operator function
 * @returns A stream inside stream that expects a URL transition.
 * That stream will be automatically unsubscribed
 * if the transition to the url is not met satisfying the RegExp condition.
 * The stream emits a string parameter - URL.
 */
export function whenURL(href: RegExp): Observable<Observable<string>>;
export function whenURL<A>(href: RegExp, op1: OperatorFunction<string, A>): Subscription;
export function whenURL<A, B>(href: RegExp, op1: OperatorFunction<string, A>, op2: OperatorFunction<A, B>): Subscription;
export function whenURL<A, B, C>(href: RegExp, op1: OperatorFunction<string, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Subscription;
export function whenURL<A, B, C, D>(href: RegExp, op1: OperatorFunction<string, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>): Subscription;
export function whenURL<A, B, C, D, E>(href: RegExp, op1: OperatorFunction<string, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>): Subscription;
export function whenURL<A, B, C, D, E, F>(href: RegExp, op1: OperatorFunction<string, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>): Subscription;
export function whenURL<A, B, C, D, E, F, G>(href: RegExp, op1: OperatorFunction<string, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>): Subscription;
export function whenURL<A, B, C, D, E, F, G, H>(href: RegExp, op1: OperatorFunction<string, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>): Subscription;
export function whenURL<A, B, C, D, E, F, G, H, I>(href: RegExp, op1: OperatorFunction<string, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, I>): Subscription;
export function whenURL<A, B, C, D, E, F, G, H, I>(href: RegExp, op1: OperatorFunction<string, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>, op4: OperatorFunction<C, D>, op5: OperatorFunction<D, E>, op6: OperatorFunction<E, F>, op7: OperatorFunction<F, G>, op8: OperatorFunction<G, H>, op9: OperatorFunction<H, I>, ...operations: OperatorFunction<any, any>[]): Subscription;
export function whenURL(href: RegExp, ...operations: OperatorFunction<any, any>[]): Observable<Observable<string>> | Subscription {
    if (operations.length > 0) {
        return whenURL(href).pipe(
            tap(flow => flow.pipe.apply(flow, operations).subscribe()),
        ).subscribe()
    }
    return historyChange.pipe(
        distinctUntilChanged(),
        filter(url => href.test(url)),
        windowCount(1),
        skip(1),
        map(() => historyChange.pipe(
            takeUntil(historyChange.pipe(
                filter(url => !href.test(url)),
            )),
        )),
    );
}
