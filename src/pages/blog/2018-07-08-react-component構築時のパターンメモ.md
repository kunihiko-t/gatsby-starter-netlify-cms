---
templateKey: blog-post
title: React Component構築時のパターンメモ
date: '2018-07-08T21:08:04+09:00'
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

ちょっと例が良くない気がするのでそのうち差し替えるかも。

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

## 

## Higher Order Components

コンポーネントを受け取ってコンポーネントを返す関数。

下記はRender Propsのところで作ったAdderをHoC化したコード。

```es6
import { Component } from "react";
import React from "react";
import Adder from "./Adder";
import Exp from "./Exp";

const HoCAdder = Component => {
  return class extends React.Component {
    render() {
      return <Adder render={sum => <Component {...this.props} sum={sum} />} />;
    }
  };
};

class HoCApp extends Component {
  render() {
    return (
      <div>
        <Exp sum={this.props.sum} />
      </div>
    );
  }
}

export default HoCAdder(HoCApp);
```

<https://reactjs.org/docs/higher-order-components.html>

## Compound Components

グループ化されたフォームやタブなどを表現する時に使うパターン。

React 16.3以降を使っている場合はContext APIも利用すると尚良い。

良いサンプルが思いつかなかったしコードがちょっと長くなりそうなので詳しく解説してある記事を貼っておきます。

3 easy steps to writing compound components

<https://hackernoon.com/3-easy-steps-to-writing-compound-components-5d4647b7bb7>

Reactのデザインパターン Compound Components

<https://qiita.com/seya/items/d08b8a6c12f3e71d5971>

How To Master Advanced React Design Patterns: Compound Components

<https://itnext.io/using-advanced-design-patterns-to-create-flexible-and-reusable-react-components-part-1-dd495fa1823>

How To Master Advanced React Design Patterns: Context API

<https://itnext.io/using-advanced-design-patterns-to-create-flexible-and-reusable-react-components-part-2-react-3c5662b997ab>

Ryan Florence - Compound Components
<https://www.youtube.com/watch?v=hEGg-3pIHlE>
