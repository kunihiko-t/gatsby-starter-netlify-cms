---
templateKey: blog-post
title: 手持ちのredux-observableのboilerplateをTypeScript+Hooks化した
date: '2019-06-11T16:08:55+09:00'
description: '手持ちのredux-observableのboilerplateをTypeScript+Hooks化して公開した時の話。 '
tags:
  - React
  - redux-observable
  - typescript
  - hooks
---
何か開発を始める時に度々使っていたredux-observableのboilerplateがちょっと古くなってきたので、この際TypeScript化してHooksも使うようにしてrxjsも5系から6系に上げよう！と思いたち、なんとか動くところまで持っていけたので、同じような事をしようとしてる人達と自分の振り返りのために記事として残すことした。

ちなみにrepositoryはここ。

 <https://github.com/kunihiko-t/redux-observable-ts-hooks-boilerplate>

## 1. とりあえず土台を作る
