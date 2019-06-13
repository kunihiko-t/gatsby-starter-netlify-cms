---
templateKey: blog-post
title: Migrating ES6 redux-observable boilerplate to TypeScript & Hooks
date: '2019-06-13T19:44:57+09:00'
description: >-
  This article is a note for migrating ES6 redux-observable-boilerplate to
  TypeScript
tags:
  - React
  - redux-observable
  - typescript
  - hooks
---
I've used my redux-observable boilerplate frequently when starting development, and it's became a bit old.

So I've decided to migrate it to TypeScript + Hooks + Rxjs 6.
I'm leaving the record for my own review, and for the people who is trying to do similar things.

By the way, the result is this repository.

<https://github.com/kunihiko-t/redux-observable-ts-hooks-boilerplate>

## Build the foundation for a TypeScript project

It was troublesome for me to write it one by one with full scratch on it, so I used 

`create-react-app my-app --typescript`

and `eject` it.

For `typescript-eslint` and related things, I referenced this article.

<http://watanabeyu.blogspot.com/2019/02/typescript-eslinttypescriptlinteslintai.html>(This article is written in Japanese)


Then, I renamed *.js, *jsx to *.ts, *tsx and put these files to a new project directory.

## Fix errors around "Type"

There are many errors around "Type", because existing components are written in ES6 and they don't have any types.

For example, following components has an error like a `Item doesn't have length`

```javascript
const repositoryList = ({ items, total_count, isLoading }) => {
    const totalCountElem = items.length > 0 ? (<div>Total Count: {total_count}</div>) : (<></>)
........
```
So, We'll define types for all parameters like this

```typescript
const repositoryList: React.FC<{ items: GithubRepository[], total_count: number, isLoading: boolean }> = ({ items, total_count, isLoading }) => {
......
}
```

At first, I was feeling "It's troublesome...", but defining types made me happy.
I can remove PropType from my components, and it helps (WebStorm|VScode)'s code completion, and I can notice errors without running the program.

## Some libraries don't have types

Almost modern libraries have type definitions, and we can install them with `yarn add @types/name`.

But some too new or old libraries don't have type definitions, this time, react-redux 7.1.0 doesn't have type definitions.
I tried `yarn add @tyes/react-redux@7.1.0`, but I've got a message like `No such version`.

In this case, we can add type definitions myself.
Put the file like a `react-redux.d.ts` on your `typeRoots` defined by `tsconfig.json`, so you can write type definitions.

My `typeRoots` is following, so I put the `redux.d.ts` on `src/@types/redux.d.ts`.
```
    "typeRoots": [
      "node_modules/@types",
      "src/@types"
    ],
```
<https://github.com/kunihiko-t/redux-observable-ts-hooks-boilerplate/blob/master/src/%40types/react-redux.d.ts>

## Introducing typescript-fsa

Since i'm migrating ES6 to TypeScript, I though that I need more benefit from types, so I introduced [typescript-fsa](https://github.com/aikoven/typescript-fsa) .

What is great about this?
Let's say we have following code.
```javascript
import keyMirror from 'fbjs/lib/keyMirror';

export const ActionTypes = keyMirror({
    USER_LOGIN_REQUEST: undefined,
    USER_LOGIN_SUCCESS: undefined,
    USER_LOGIN_FAILURE: undefined,
})

export function login() {
    return {
        type: ActionTypes.USER_LOGIN_REQUEST,
        payload: { id: 'test' },
    };
}
```

We can migrate above code to following code with typescript-fsa

```typescript
const keyMirror = require('fbjs/lib/keyMirror')

export const ActionTypes = keyMirror({
    USER_LOGIN: undefined,
})


import actionCreatorFactory from 'typescript-fsa'

const ac = actionCreatorFactory()

interface LoginParam {
    id: string
}

interface LoginResult {
    data: any
}

interface LoginError {
    error: string
}

export default {
    login: ac.async<LoginParam, LoginResult, LoginError>(ActionTypes.USER_LOGIN),
    }
```

If you are using [typescript-fsa-reducers](https://github.com/dphilipson/typescript-fsa-reducers), you can write very simple & clear reducers.

```typescript
import immutable from 'immutability-helper'
import { reducerWithInitialState } from 'typescript-fsa-reducers'
import actions from '../actions/user'

export const userState = {
    isAuthenticated: false,
    status: 'idle',
}

export default {
    user: reducerWithInitialState(userState)
        .case(actions.login.started, (state, action) => {
            return immutable(state, {
                status: { $set: 'running' },
            })
        })
        .case(actions.login.done, (state, action) => {
            return immutable(state, {
                status: { $set: 'idle' },
                isAuthenticated: { $set: true },
            })
        })
        .case(actions.login.failed, (state, action) => {
            return immutable(state, {
                status: { $set: 'running' },
                isAuthenticated: { $set: false },
            })
        }) ........
```

We'll use redux-observable, so we can use [typescript-fsa-redux-observable](https://github.com/m0a/typescript-fsa-redux-observable) as well.

It enables following method, and it makes us happy.
```typescript
ofAction(actions.login.started)
```
But there is one point of caution, `yarn add typescript-fsa-redux-observable` installs old version of typescript-fsa-redux-observable, so we have to use `yarn add https://github.com/m0a/typescript-fsa-redux-observable` for install new version.

## Fix epics, Rxjs 5 to 6

Rxjs 5 to 6 has some breaking changes.
Some method are removed, and styles also changed.

I had following method chain code for Rxjs 5.
```javascript
export function fetchRepositories(action$) {
    return action$
        .ofType(ActionTypes.FETCH_REPOSITORIES_REQUEST)
        .delay(1000)
        .mergeMap(param =>
            Observable.defer(() =>
                Observable.fromPromise(
                    axios.get(
                        `${ApiBaseUrl}/github/repositories?installation_id=${
                            param.payload.installationID
                        }`
                    )
                )
            ).map(data => {
                return {
                    type: ActionTypes.FETCH_REPOSITORIES_SUCCESS,
                    payload: { response: data.data },
                };
            })
        )
        .catch(error =>
            Observable.of({
                type: ActionTypes.FETCH_REPOSITORIES_FAILURE,
                payload: { error },
                error: true,
            })
        );
}
```

rxjs6 + typescript-fsa-redux-observable requires individual function calls instead of method chain.

(some details are different from above code)

```typescript
export const fetchRepositories: Epic<AnyAction> = (action$) => action$.pipe(
    ofAction(actions.fetchRepositories.started),
    debounceTime(1000),
    mergeMap((param) =>
        ajax.getJSON(`https://api.github.com/search/repositories?q=+language:javascript+created:%3E2016-10-01&sort=stars&order=desc`).pipe(
            map(data => {
                return actions.fetchRepositories.done({
                    params: param.payload,
                    result: { repositories: data },
                })
            }),
            catchError(error =>
                Observable.of(actions.fetchRepositories.failed({
                    params: param.payload,
                    error: error,
                })),
            ),
        ),
    ),
)
```
<https://github.com/kunihiko-t/redux-observable-ts-hooks-boilerplate/blob/master/src/epics/github.ts>

I prefer this styles, but once I've got errors, it displays too long error messages. It's so tough to understand what they saying.

## Using hooks with React Redux 7.1.0

Since I'm using React's hooks, so I might as well use brand new [Hooks](https://react-redux.js.org/next/api/hooks) with React Redux. 
Using hooks in components are very simple.
We can use `useSelector` instead of `connect` and `mapStateToProps`, and we can get `dispatch` function from `useDispatch`.

I think it's faster to read the code.

<https://github.com/kunihiko-t/redux-observable-ts-hooks-boilerplate/blob/master/src/routes/Home.tsx>

## Impressions

Hooks of React Redux & typescript-fsa makes code simple, TypeScript helps Editor's auto completion, and I can notice errors easily due to types.
I think these things help coding speed and I can feel safe.

In my case, migrating this kind of small project didn't take a lot of time, so I'm feeling satisfied.

My next goal is running it on [Next.js](https://nextjs.org/).
