---
templateKey: blog-post
title: gqlgenでsubscriptionを使う時websocketでハマった
date: '2020-05-10T02:16:30+09:00'
description: 同じようなハマり方してる人がいるかもしれないので残しておく
tags:
  - golang
  - websocket
  - graphql
  - ''
---
端的にいうと下記のような感じで`NewDefaultServer`を使っていると
```go
srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))
```
[ここ](https://github.com/99designs/gqlgen/blob/master/docs/content/recipes/cors.md
)に書いてある通り下記のコードを足しても`unable to upgrade *http.response to websocket websocket: 'Origin' header value not allowed`とか言われてしまう。

```go
srv.AddTransport(&transport.Websocket{
    Upgrader: websocket.Upgrader{
        CheckOrigin: func(r *http.Request) bool {
            // Check against your desired domains here
             return r.Host == "example.org"
        },
        ReadBufferSize:  1024,
        WriteBufferSize: 1024,
    },
})
```

理由は`NewDefaultServer`内で下記のようなコードが書かれているために
```go
srv.AddTransport(transport.Websocket{
    KeepAlivePingInterval: 10 * time.Second,
})
```

gorilla/websocket内のこのへんでcheckSameOriginが入り落ちる。
```go
checkOrigin := u.CheckOrigin
if checkOrigin == nil {
    checkOrigin = checkSameOrigin
}
if !checkOrigin(r) {
    return u.returnError(w, r, http.StatusForbidden, "websocket: 'Origin' header value not allowed")
}
```

[https://github.com/gorilla/websocket/blob/b65e62901fc1c0d968042419e74789f6af455eb9/server.go#L146](https://github.com/gorilla/websocket/blob/b65e62901fc1c0d968042419e74789f6af455eb9/server.go#L146)

自分で
```go
	srv := handler.New(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))
```
みたいにして必要なものだけAddTransportしよう。
