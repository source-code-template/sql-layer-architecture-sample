# sql-layer-architecture-sample

## Available Scripts
### `npm start`
Runs the app in the development mode.
### `npm run build`
Builds the app for production to the `dist` folder.
### `npm run prod`
Runs the app for production in the `dist` folder.

## Architecture
### Simple Layer Architecture
![Layer Architecture](https://camo.githubusercontent.com/d9b21eb50ef70dcaebf5a874559608f475e22c799bc66fcf99fb01f08576540f/68747470733a2f2f63646e2d696d616765732d312e6d656469756d2e636f6d2f6d61782f3830302f312a4a4459546c4b3030796730496c556a5a392d737037512e706e67)

### Layer Architecture with standard features: config, health check, logging, middleware log tracing, data validation
![Layer Architecture with standard features: config, health check, logging, middleware log tracing, data validation](https://camo.githubusercontent.com/903f9ae0aff009111bedd6e86351f66e237eb303d279c8bab551ddb6ba52debd/68747470733a2f2f63646e2d696d616765732d312e6d656469756d2e636f6d2f6d61782f3830302f312a38556a4a53765f74573078424b46584b5a7538364d412e706e67)

### Search users: Support both GET and POST 
#### POST /users/search
##### *Request:* POST /users/search
In the below sample, search users with these criteria:
- get users of page "1", with page size "20"
- email="tony": get users with email starting with "tony"
- dateOfBirth between "min" and "max" (between 1953-11-16 and 1976-11-16)
- sort by phone ascending, id descending
```json
{
    "page": 1,
    "limit": 20,
    "sort": "phone,-id",
    "email": "tony",
    "dateOfBirth": {
        "min": "1953-11-16T00:00:00+07:00",
        "max": "1976-11-16T00:00:00+07:00"
    }
}
```
##### GET /users/search?page=1&limit=2&email=tony&dateOfBirth.min=1953-11-16T00:00:00+07:00&dateOfBirth.max=1976-11-16T00:00:00+07:00&sort=phone,-id
In this sample, search users with these criteria:
- get users of page "1", with page size "20"
- email="tony": get users with email starting with "tony"
- dateOfBirth between "min" and "max" (between 1953-11-16 and 1976-11-16)
- sort by phone ascending, id descending

#### *Response:*
- total: total of users, which is used to calculate numbers of pages at client 
- list: list of users
```json
{
    "list": [
        {
            "id": "ironman",
            "username": "tony.stark",
            "email": "tony.stark@gmail.com",
            "phone": "0987654321",
            "dateOfBirth": "1963-03-24T17:00:00Z"
        }
    ],
    "total": 1
}
```

## API Design
### Common HTTP methods
- GET: retrieve a representation of the resource
- POST: create a new resource
- PUT: update the resource
- PATCH: perform a partial update of a resource, refer to [service](https://github.com/core-go/service) and [mongo](https://github.com/core-go/mongo)  
- DELETE: delete a resource

## API design for health check
To check if the service is available.
#### *Request:* GET /health
#### *Response:*
```json
{
    "status": "UP",
    "details": {
        "mongo": {
            "status": "UP"
        }
    }
}
```

## API design for users
#### *Resource:* users

### Get all users
#### *Request:* GET /users
#### *Response:*
```json
[
    {
        "id": "spiderman",
        "username": "peter.parker",
        "email": "peter.parker@gmail.com",
        "phone": "0987654321",
        "dateOfBirth": "1962-08-25T16:59:59.999Z"
    },
    {
        "id": "wolverine",
        "username": "james.howlett",
        "email": "james.howlett@gmail.com",
        "phone": "0987654321",
        "dateOfBirth": "1974-11-16T16:59:59.999Z"
    }
]
```

### Get one user by id
#### *Request:* GET /users/:id
```shell
GET /users/wolverine
```
#### *Response:*
```json
{
    "id": "wolverine",
    "username": "james.howlett",
    "email": "james.howlett@gmail.com",
    "phone": "0987654321",
    "dateOfBirth": "1974-11-16T16:59:59.999Z"
}
```

### Create a new user
#### *Request:* POST /users 
```json
{
    "id": "wolverine",
    "username": "james.howlett",
    "email": "james.howlett@gmail.com",
    "phone": "0987654321",
    "dateOfBirth": "1974-11-16T16:59:59.999Z"
}
```
#### *Response:*
- status: configurable; 1: success, 0: duplicate key, 4: error
```json
{
    "status": 1,
    "value": {
        "id": "wolverine",
        "username": "james.howlett",
        "email": "james.howlett@gmail.com",
        "phone": "0987654321",
        "dateOfBirth": "1974-11-16T00:00:00+07:00"
    }
}
```
#### *Fail case sample:* 
- Request:
```json
{
    "id": "wolverine",
    "username": "james.howlett",
    "email": "james.howlett",
    "phone": "0987654321a",
    "dateOfBirth": "1974-11-16T16:59:59.999Z"
}
```
- Response: in this below sample, email and phone are not valid
```json
{
    "status": 4,
    "errors": [
        {
            "field": "email",
            "code": "email"
        },
        {
            "field": "phone",
            "code": "phone"
        }
    ]
}
```

### Update one user by id
#### *Request:* PUT /users/:id
```shell
PUT /users/wolverine
```
```json
{
    "username": "james.howlett",
    "email": "james.howlett@gmail.com",
    "phone": "0987654321",
    "dateOfBirth": "1974-11-16T16:59:59.999Z"
}
```
#### *Response:*
- status: configurable; 1: success, 0: duplicate key, 2: version error, 4: error
```json
{
    "status": 1,
    "value": {
        "id": "wolverine",
        "username": "james.howlett",
        "email": "james.howlett@gmail.com",
        "phone": "0987654321",
        "dateOfBirth": "1974-11-16T00:00:00+07:00"
    }
}
```

### Patch one user by id
Perform a partial update of user. For example, if you want to update 2 fields: email and phone, you can send the request body of below.
#### *Request:* PATCH /users/:id
```shell
PATCH /users/wolverine
```
```json
{
    "email": "james.howlett@gmail.com",
    "phone": "0987654321"
}
```
#### *Response:*
- status: configurable; 1: success, 0: duplicate key, 2: version error, 4: error
```json
{
    "status": 1,
    "value": {
        "email": "james.howlett@gmail.com",
        "phone": "0987654321"
    }
}
```

### Delete a new user by id
#### *Request:* DELETE /users/:id
```shell
DELETE /users/wolverine
```
#### *Response:* 1: success, 0: not found, -1: error
```json
1
```

### health check
To check if the service is available
#### *Request:* GET /health
#### *Response:*
```json
{
    "status": "UP",
    "details": {
        "sql": {
            "status": "UP"
        }
    }
}
```