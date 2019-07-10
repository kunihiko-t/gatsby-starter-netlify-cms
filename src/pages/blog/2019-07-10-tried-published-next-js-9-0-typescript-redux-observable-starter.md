---
templateKey: blog-post
title: Tried & published Next.js 9.0 + TypeScript + redux-observable starter
date: '2019-07-10T16:56:55+09:00'
description: This article is a note of my trial and error.
tags:
  - next.js
  - React
  - redux-observable
  - typescript
  - hooks
---
Next.js 9.0 has been released.

I tried it with my usual development libs (redux-observable, styled components, etc...), and I found some gotchas, so I'm writing down this.

## redux-observable
Using redux-observable with Next.js, we have to put some code to `/pages/_app.ts`, and the style is little bit different comparing to pure react development.
There are some libraries that helps it 
 - [next-redux-wrapper](https://github.com/kirill-konshin/next-redux-wrapper)
 - [next-redux-saga](https://github.com/bmealhouse/next-redux-saga)

But there are no next-redux-observable or something.
So, eventually I wrote following code.

[https://github.com/kunihiko-t/nextjs9-ts-redux-observable-starter/blob/master/pages/_app.tsx](https://github.com/kunihiko-t/nextjs9-ts-redux-observable-starter/blob/master/pages/_app.tsx)


## CSS import
I've tried to use [Semantic UI React](https://react.semantic-ui.com/).

But when I write following line, I've got an error.

```typescript
import 'semantic-ui-css/semantic.min.css'
```

In the Next.js world, we have to create next.config.js instead of webpack.config.js .

So I wrote css-loader settings on it. But it didn't work well.

I googled & found the information about `@zeit/next-css`.
