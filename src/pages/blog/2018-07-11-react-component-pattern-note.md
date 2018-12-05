---
templateKey: blog-post
title: React Component Pattern Note
date: '2018-07-11T19:51:08+09:00'
description: 'Note to self: Render Props, Compound Components, Higher Order Components'
tags:
  - React
---
This article is a React Component Design Pattern note for myself.

## Render Props

```javascript
<DataProvider render={data => (
  <h1>Hello {data.target}</h1>
)}/>
```

Like above code, it literally use render prop for reuse components.

In this case, we use following code as an example.
This example has two input field and just sum up them.

```javascript
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

Using render props make above code reusable, like following.

```javascript
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

```javascript
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

Reuse it with a component squaring the total value.

It seems like a bad example, so I may change it sooner or later.

```javascript
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

Please refer this article for details.

<https://reactjs.org/docs/render-props.html>

## 

## Higher Order Components

A function that receives a component and returns a component.

下記はRender Propsのところで作ったAdderをHoC化したコード。
Following code is a HoC example using a Render Props example.

```javascript
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

The pattern that represents like a Grouped form, Tabs, etc.

If you use React 16.3 or later, you'd better to use Context API.

I couldn't think of any good examples and code will be little long, so I'll put some links that explains about Compound Components.

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
