# graphql-ts-app

some playground with express/grapql/redis and react

# session behaviour

when login in, the app will do `req.sesssion.userId = user.id` meaning that we are sending `{userId:1}` to redis, this creates `sess:asasdadadadasd` -> `{userId:1}` which gets crypted to look like `qwsdaqqweqafasfadfadastygtba22123`, so express sets the cookie in the browser and then its used when doing requests, for this the cookie gets decrypted back to `sess:asasdadadadasd` then ask to redis for its value `{userId:1}`
