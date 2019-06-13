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

