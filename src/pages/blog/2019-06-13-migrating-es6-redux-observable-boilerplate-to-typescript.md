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

There are many errors around "Type", because existing components are ES6 and they don't have any types.

For example, 
