---
templateKey: blog-post
title: Next.js 9.0 + TypeScript + redux-observable を試してstarterとして公開した
date: '2019-07-09T23:49:32+09:00'
description: Next.js 9.0が出たので触ったら色々ハマった話
tags:
  - next.js
  - React
  - redux-observable
  - typescript
  - hooks
---
Next.js 9.0が出たので試してみたところ、色んなところでハマったのでメモとして残す。

## redux-observableを導入する段階でハマる
Next.jsでreduxやredux-observableなどを使う時は `pages/_app.ts`に処理を書くらしく、いつもと勝手が違ってハマった。

[next-redux-wrapper](https://github.com/kirill-konshin/next-redux-wrapper)とかあるみたいだけど最終的には使わずに[こんな感じ](https://github.com/kunihiko-t/nextjs9-ts-redux-observable-starter/blob/master/pages/_app.tsx)で書いた。

## CSSのimportでハマる
[Semantic UI React](https://react.semantic-ui.com/)を導入する際に
```
import 'semantic-ui-css/semantic.min.css'
```
という感じでCSSをimportしようとするとエラーが出てハマった。

Next.jsではwebpack.config.jsで書いているような設定をnext.config.jsに書くらしかったので書いてみたもののサクッと動かなかった。

そして`@zeit/next-css`というのを使えば動くという情報を見つけたので試してみたらInvalid Optionなどと言われて動かずさらに検索すると[関係ありそうなissue](https://github.com/zeit/next-plugins/issues/392)を発見。

ただのworkaroundだけどとりあえず動くようにはなった。

next.config.jsは[こんな感じ](https://github.com/kunihiko-t/nextjs9-ts-redux-observable-starter/blob/master/next.config.js)になっている。

## Styled Componentsでハマる
ブラウザで画面を開くとconsoleにエラー出ていたので調べたら.babelrcに
```
{
  "presets": ["next/babel"],
  "plugins": ["styled-components"]
}
```
このあたりを追記したら良いとの情報を得て追記したら解決した。

## 開発開始できそうな感じになったので公開した

これでとりあえずエラーも消えて動くようになり開発を始めれそうな状態にはなった。

Next.jsを使わなければ特に気にもならないようなことでハマって結構めんどくさかった。

今後の自分のためと、同じようにNext.js触ろうとしたけど普段通りにいかず面倒くさくて投げた人のために`yarn dev`ですぐ開発を始めれるものを残しておいた。

[https://github.com/kunihiko-t/nextjs9-ts-redux-observable-starter](https://github.com/kunihiko-t/nextjs9-ts-redux-observable-starter)

Aliasの設定はまだ上手くいっていないし、認証周りもちゃんとできてないのでもうちょっと色々調べる必要がありそう。

Next.js 9は結構いい感じっぽいのでNuxt.js人気に早く追いついて欲しいなー
