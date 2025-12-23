# HTML editor
**`html-editor`** it's a set of tools that helps find and modify HTML elements in the Rx stream. Useful for browser extensions and userscripts.

## Table of contents
* [Observables](#observables)
    * [`observeElementMutation`](#observeElementMutation)
    * [`observeQuerySelector`](#observeQuerySelector)
    * [`observeQuerySelectorAll`](#observeQuerySelectorAll)
    * [`awaitElement`](#awaitElement)
    * [`awaitRandomElement`](#awaitRandomElement)
    * [`urlChange$`](#urlChange)
    * [`observeUrlChanges`](#observeUrlChanges)
* [Operators](#operators)
    * [`mergeMapAddedElements`](#mergeMapAddedElements)
    * [`mergeMapStringCondition`](#mergeMapStringCondition)

# <a name="observables"></a> Observables
## <a name="observeElementMutation"></a> `observeElementMutation`
Converts the callback of the MutationObserver class to an Rx event stream.

Example:
```ts
observeElementMutation(
  document.querySelector('#my-element')!,
  { attributeFilter: ['data-my-data'] },
).subscribe(console.log);
```

## <a name="observeQuerySelector"></a> `observeQuerySelector`
Observation changes (addition and deletion) of elements that match to query selectors as an Rx stream.

Example:
```ts
observeQuerySelector({
  query: '.my-child',
  parent: document.querySelector('#my-parent')!,
  has: '.my-sub-child',
  filter: element => element.classList.contains('.my-child-modifier'),
}).subscribe(console.log);
```
Example log:
```ts
{added: Element, target: Element, removed: undefined};
{added: undefined, target: undefined, removed: Element};
```

## <a name="observeQuerySelectorAll"></a> `observeQuerySelectorAll`
Observation changes (additions and deletions) of elements that match to query selectors as an Rx stream.

Example:
```ts
observeQuerySelectorAll({
  query: '.my-child',
  parent: document.querySelector('#my-parent')!,
  has: '.my-sub-child',
  filter: element => element.classList.contains('.my-child-modifier'),
}).subscribe(console.log);
```
Example log:
```ts
{added: [Element], target: [Element, Element], removed: []};
{added: [], target: [Element], removed: [Element]};
```

## <a name="awaitElement"></a> `awaitElement`
Awaiting only one element to match the selector and returns it as an Rx stream. The stream ends immediately after one element is found / added.

Example:
```ts
awaitElement('#my-element')
  .subscribe(console.log);
```

## <a name="awaitRandomElement"></a> `awaitRandomElement`
Awaiting Expects at least one element to match the selector and returns it as an Rx stream. If there are more than 1 elements, it will return a random one. The stream ends immediately after the elements are found / added.

Example:
```ts
awaitRandomElement('.my-element')
  .subscribe(console.log);
```

## <a name="urlChange"></a> `urlChange$`
Emit new location url when the URL is changes.

Example:
```ts
urlChange$.subscribe(console.log);
```

## <a name="observeUrlChanges"></a> `observeUrlChanges`
Observation of `URL` changes that satisfy the conditions.

Example:
```ts
observeUrlChanges({ condition: /my-url-segment/ })
  .subscribe(console.log);
```

# <a name="operators"></a> Operators

## <a name="mergeMapAddedElements"></a> `mergeMapAddedElements`
Conversion operator to a new stream for each new added element.

Example:
```ts
observeQuerySelectorAll('.my-button').pipe(
  mergeMapAddedElements(element => fromEvent(element, 'click'))
).subscribe(console.log);
```
It can be more convenient to use the `project` option in [`observeQuerySelector`](#observeQuerySelector) and [`observeQuerySelectorAll`](#observeQuerySelectorAll) functions. Example:
```ts
observeQuerySelectorAll({
  query: '.my-button',
  project: element => fromEvent(element, 'click'),
}).subscribe(console.log);
```

## <a name="mergeMapStringCondition"></a> `mergeMapStringCondition`
The operator creates a separate stream when the source string is validated.

Example:
```ts
urlChange$.pipe(
  mergeMapStringCondition(
    /my-url-segment/,
    () => observeQuerySelectorAll('.my-element'),
  )
).subscribe(console.log);
```
It can be more convenient to use the `project` option in observeUrlChanges function. Example:
```ts
observeUrlChanges({
  condition: /my-url-segment/,
  project: () => observeQuerySelectorAll('.my-element')
}).subscribe(console.log);
```
