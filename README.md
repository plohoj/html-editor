html-editor it's a tool for helping modification html elements
# How use
### `whenURL(href: RegExp): Observable<Observable<string>>`
This method emits a stream inside stream that expects a URL transition. That thread will be automatically canceled if the transition to the URL is not satisfied with the RegExp conditions. The stream emits a string parameter - URL.
#### Usage example
``` ts
whenURL(/http:\/\/localhost\/example/)
    .pipe(tap(flow => flow
        .subscribe(
            url => console.log('The transition to', {url}),
            null,
            () => console.log('Leave RegExp url').
        )),
    ).subscribe();
```
### `waitElement(query: string, repeatDelay = 200): Observable<HTMLElement>`
This method emits a stream that will infinitely check for the existence of an HTMLElement, until it finds the required element or will be unsubscribed. The stream returns the required HTMLElement.
#### Usage example
``` ts
waitElement('li.library .book.green a#book1')
    .subscribe(
        element => console.log('Find element', {element}),
        null,
        () => console.log('Emitted immediately after finding'),
    )),
```