---
templateKey: blog-post
title: Stub database connection with GORM
date: '2017-03-29T17:45:45+09:00'
description: How to stub database connection with GORM
tags:
  - golang
---
This article is a note when I was looking for how to stub database connection with [GORM][GORM].

At first, I found [go-sqlmock][go-sqlmock]. It stubs database connection.
I thought that it's easy to make connection stub.

go-sqlmock makes stub connection & return it.

```go
//db is sql.DB https://golang.org/pkg/database/sql/
db, mock, err := sqlmock.New()
```

So, I tried to set db to GORM.
But [GORM hides db field of their DB struct](https://github.com/jinzhu/gorm/blob/master/main.go#L19).

I looked into [GORM][GORM] & [go-sqlmock][go-sqlmock], and I understood following.

* [GORM calls sql.Open using the driver name and data source name passed to its Open function, and set it to the struct field.](https://github.com/jinzhu/gorm/blob/8b058a707f156b411e280bc55c5aa20544e64873/main.go#L61)
* [go-sqlmock registers "sqlmock" as a driver name.](https://github.com/DATA-DOG/go-sqlmock/blob/master/driver.go#L16)
* [go-sqlmock has NewWithDSN function for create sqlmock database connection.](https://github.com/DATA-DOG/go-sqlmock/blob/master/driver.go#L67)

So the code is like this.

```go


    var db *gorm.DB

    _, mock, err := sqlmock.NewWithDSN("sqlmock_db_0")
    if err != nil {
        panic("Got an unexpected error.")
    }

    db, err = gorm.Open("sqlmock", "sqlmock_db_0")
    if err != nil {
        panic("Got an unexpected error.")
    }

    defer db.Close()

    rs := sqlmock.NewRows([]string{"count"}).FromCSVString("1")
    mock.ExpectQuery(`SELECT count.* FROM "whitelist"  WHERE.*$`).
        WithArgs(12345).
        WillReturnRows(rs)
        ....
        ....

```



[GORM]:https://github.com/jinzhu/gorm
[go-sqlmock]:https://github.com/DATA-DOG/go-sqlmock
[sql.DB]:https://golang.org/pkg/database/sql/
