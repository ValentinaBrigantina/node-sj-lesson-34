# REST Cats
- GET http://cats-application.com/api/cat READ -> getCats() <- Получение всех котов 
- GET http://cats-application.com/api/cat/10 READ -> getCatById() <- Получение одного котика по айди
- POST { "name": "Murzik", "image": "someurl" } http://cats-application.com/api/cat CREATE -> createNewCatId() -> createCat(id) <- id | Cat
- PUT { "name": "Barsik" } http://cats-application.com/api/cat/10 UPDATE -> updateCatById(id, catData) <- id
- DELETE http://cats-application.com/api/cat/id -> removeCatBydId(id) <- id

# REST Users
- GET http://users-application.com/api/user READ -> getUserss() <- Получение всех
- GET http://users-application.com/api/user?limit=10&offset=0 READ -> getUserss() <- Получение по пагинации
- GET http://users-application.com/api/user/10 READ -> getUserById() <- Получение одного по айди
- POST { "name": "vasya", "image": "someurl" } http://users-application.com/api/user CREATE -> createNewUserId() -> createUser(id) <- id | User
- PUT { "name": "vasya" } http://users-application.com/api/user/10 UPDATE -> updateUserById(id, catData) <- id
- DELETE http://users-application.com/api/user/id -> removeuserBydId(id) <- id
- DELETE { "ids": ["someid", "someid"] } http://users-application.com/api/user -> removeUser()

# MVC
- Model - бизнес логика
- Controller - принимает решения
- View? - презентация
