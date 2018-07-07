---
templateKey: blog-post
title: React Component構築時のパターンメモ
date: '2018-07-07T21:08:04+09:00'
description: 'Render Props, Compound Components, Higher Order Components'
tags:
  - react
---
Reactを使ってアプリを作る時にどう書くのが良いだっけ？ってなりがちなのでメモ。

## Render Props

```es6
<DataProvider render={data => (
  <h1>Hello {data.target}</h1>
)}/>
```

みたいな感じで文字通りrender propsを利用いてコンポーネントを再利用するテクニック。

数値入力フィールドを２つ持ち、足し算の結果を表示するコンポーネントをベースにして考える。

```es6
import { Component } from "react";
import React from "react";
class AdderApp extends Component {
constructor(props) {
super(props);
this.state = { sum: 0, left: 0, right: 0 };
this.handleOnChangeLeft = this.handleOnChangeLeft.bind(this);
this.handleOnChangeRight = this.handleOnChangeRight.bind(this);
}
handleOnChangeLeft(e) {
const il = parseInt(e.target.value);
this.setState({ left: il, sum: il + this.state.right });
}
handleOnChangeRight(e) {
const ir = parseInt(e.target.value);
this.setState({ right: ir, sum: ir * this.state.left });
}
render() {
const { left = 0, right = 0 } = this.state;
return (
<div>
<input type="number" value={left} onChange={this.handleOnChangeLeft} />
+
<input
type="number"
value={right}
onChange={this.handleOnChangeRight}
/>
= {left + right}
</div>
);
}
}
export default AdderApp;
```

Render Propsを使ってで再利用可能なコンポーネントに書き換えると下記のようになる。

```es6
//App.js
import { Component } from "react";
import React from "react";
import Adder from "./Adder";
import Exp from "./Exp";

class App extends Component {
  render() {
    return (
      <div>
        <Adder render={sum => <Exp sum={sum} />} />
      </div>
    );
  }
}

export default App;
```

```es6
//Adder.js
import { Component } from "react";
import React from "react";

class Adder extends Component {
  constructor(props) {
    super(props);
    this.state = { sum: 0, left: 0, right: 0 };
    this.handleOnChangeLeft = this.handleOnChangeLeft.bind(this);
    this.handleOnChangeRight = this.handleOnChangeRight.bind(this);
  }

  handleOnChangeLeft(e) {
    const il = parseInt(e.target.value);
    this.setState({ left: il, sum: il + this.state.right });
  }

  handleOnChangeRight(e) {
    const ir = parseInt(e.target.value);
    this.setState({ right: ir, sum: ir * this.state.left });
  }

  render() {
    const { left = 0, right = 0 } = this.state;
    return (
      <div>
        <input type="number" value={left} onChange={this.handleOnChangeLeft} />
        +
        <input
          type="number"
          value={right}
          onChange={this.handleOnChangeRight}
        />
        = {left + right}
        {this.props.render(this.state.sum)}
      </div>
    );
  }
}

export default Adder;
```

合計値を二乗するコンポーネントで再利用する。

ちょっと例が良くなかったかも。

```es6
//Exp.js
import { Component } from "react";
import React from "react";

class Exp extends Component {
  render() {
    const { sum = 0 } = this.props;
    return <div>{`${sum}^2 = ${Math.pow(sum, 2)}`}</div>;
  }
}

export default Exp;
```

詳しくこのあたりをどうぞ。

<https://reactjs.org/docs/render-props.html>

## Compound Components

## Higher Order Components

https://reactpatterns.com/
