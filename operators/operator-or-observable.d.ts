import { Observable, OperatorFunction, MonoTypeOperatorFunction } from 'rxjs';

export interface IOperatorOrObservable<T, U> extends OperatorFunction<T, U> {
    (): Observable<U>;
}