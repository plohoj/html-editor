# HTML editor
**`html-editor`** it's a tool for helping modification html elements

## Table of contents
* [Observables](#observables)
    * [observeElementMutation](#observe-element-mutation)
    * [observeQuerySelector](#observe-query-selector)
    * [observeQuerySelectorAll](#observe-query-selector-all)
    * [awaitElement](#await-element)
    * [awaitRandomElement](#await-random-element)
    * [urlChange$](#url-change)
* [Operators](#operators)
    * [mergeMapAddedElements](#merge-map-added-elements)
    * [mergeMapStringToggle](#merge-map-string-toggle)

# <a name="observables"></a> Observables
## <a name="observe-element-mutation"></a> `observeElementMutation`
Converts the callback of the MutationObserver class to an Rx event stream.

Example:
```ts
observeElementMutation(
    document.querySelector('#my-element'),
    { attributeFilter: ['data-my-data'] },
).subscribe(console.log);
```

## <a name="observe-query-selector"></a> `observeQuerySelector`
Returns change (addition and deletion) of element that match selectors, like an Rx stream.

Example:
```ts
observeQuerySelector(
    '.my-child',
    {
        parent: document.querySelector('#my-parent'),
        has: '.my-sub-child',
        filter: element => element.classList.contains('.my-child-modifier'),
    }
).subscribe(console.log);
```
Example log:
```ts
{added: Element, target: Element, removed: undefined};
{added: undefined, target: undefined, removed: Element};
```

## <a name="observe-query-selector-all"></a> `observeQuerySelectorAll`
Returns changes (additions and deletions) of elements that match selectors, like an Rx stream.

Example:
```ts
observeQuerySelectorAll(
    '.my-child',
    {
        parent: document.querySelector('#my-parent'),
        has: '.my-sub-child',
        filter: element => element.classList.contains('.my-child-modifier'),
    }
).subscribe(console.log);
```
Example log:
```ts
{added: [Element], target: [Element, Element], removed: []};
{added: [], target: [Element], removed: [Element]};
```

## <a name="await-element"></a> `awaitElement`
Awaiting only one element to match the selector and returns it as an Rx stream. The stream ends immediately after one element is found / added.

Example:
```ts
awaitElement('#my-element')
    .subscribe(console.log);
```

## <a name="await-random-element"></a> `awaitRandomElement`
Awaiting Expects at least one element to match the selector and returns it as an Rx stream. If there are more than 1 elements, it will return a random one. The stream ends immediately after the elements are found / added.

Example:
```ts
awaitRandomElement('.my-element')
    .subscribe(console.log);
```

## <a name="url-change"></a> `urlChange$`
Emit new location url when the URL is changes

Example:
```ts
urlChange$.subscribe(console.log);
```

# <a name="operators"></a> Operators

## <a name="merge-map-added-elements"></a> `mergeMapAddedElements`
Conversion operator to a new stream for each new added element

Example:
```ts
observeQuerySelectorAll('.my-button')
    .pipe(
        mergeMapAddedElements(
            element => fromEvent(element, 'click'),
            { isTakeUntilRemoved: true }
        )
    ).subscribe(console.log);
```

## <a name="merge-map-string-toggle"></a> `mergeMapStringToggle`
The operator creates a separate stream when the source string is validated.

Example:
```ts
urlChange$
    .pipe(
        mergeMapStringToggle(
            /my-url-segment/,
            () => observeQuerySelectorAll('.my-element'),
            { isTakeUntilToggle: true },
        )
    ).subscribe(console.log);
```