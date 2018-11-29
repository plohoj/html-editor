html-editor it's a tool for helping modification html elements
# How use
## `whenURL(href: RegExp): Observable<Observable<string>>`</br>`whenURL(href: RegExp, ...operations: OperatorFunction[]):`</br>&nbsp;&nbsp;&nbsp;&nbsp;`Subscription`
This method emits a stream inside stream that expects a _URL_ transition. That thread will be automatically canceled if the transition to the _URL_ is not satisfied with the _RegExp_ conditions. The stream emits a string parameter - _URL_.
#### Usage example
``` ts
whenURL(/http:\/\/localhost\/example/).pipe(tap(flow => flow
    .subscribe(
        url => console.log('The transition to', {url}),
        null,
        () => console.log('Leave RegExp url'),
    )),
).subscribe();
```
or
``` ts
whenURL(/http:\/\/localhost\/example/,
    tap(url => console.log('The transition to', {url})),
    waitElement('li.library .book.green a#book1'),
    delay(100), // RxJS operator
    tap(element => console.log('Find element', {element})),
)
```
## `waitElement(query: string, repeatDelay = 200):`<br/>&nbsp;&nbsp;&nbsp;&nbsp;`IOperatorOrObservable<any, HTMLElement>`
This method emits a stream that will infinitely check for the existence of an _HTMLElement_, until it finds the required element or will be unsubscribed. The stream returns the required _HTMLElement_.
#### Usage example
``` ts
whenURL(/http:\/\/localhost\/example/).pipe(tap(flow => flow
    .pipe(
        waitElement('li.library .book.green a#book1'),
        delay(100), // RxJS operator
        tap(element => console.log('Find element', {element}))
    ).subscribe())
).subscribe();
```
or
``` ts
waitElement('li.library .book.green a#book1')().subscribe(
    element => console.log('Find element', {element}),
    null,
    () => console.log('Emitted immediately after finding'),
);
```
## `elementActionBuilder(callback: (element: HTMLElement) => any):`<br/>&nbsp;&nbsp;&nbsp;&nbsp;`() => MonoTypeOperatorFunction<HTMLElement>`
A tool for quickly building your own _RxJS_ operators intended to work with _HTMLElement_ variables. Usually used in conjunction with _waitElement_
#### Usage example
``` ts
const logging = elementActionBuilder(element =>
    console.log('Find element', element));

waitElement('li.library .book.green a#book1')().pipe(
    delay(100), // RxJS operator
    logging(), // print "Find element {...}"
)
```
Also in the library already implemented quick operators, such as:
```ts
clickElement() : MonoTypeOperatorFunction<HTMLElement>
removeElement() : MonoTypeOperatorFunction<HTMLElement>
setValueElement(value: any) : MonoTypeOperatorFunction<HTMLElement>
```