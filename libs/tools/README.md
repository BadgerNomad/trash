# Tools

Module contain general tools.

### Seeds

Tool for start seeds. Input: ormconfig path.
Orm config must contains seeds patterns:

##### Example ormconfig

```
{
   "type": "postgres",
   "host": "127.0.0.1",
   "port": 5432,
   "username": "p2p",
   "password": "p2p",
   "database": "p2p",
   "synchronize": false,
   "logging": false,
   "entities": [
      "dist/apps/auth/src/app/database/entities/**/*.js"
   ],
   "migrations": [
      "dist/apps/auth/src/migrations/**/*.js"
   ],
   "subscribers": [
      "dist/apps/auth/src/subscriber/**/*.js"
   ],
   "seeds": [
      "dist/apps/auth/src/seeds/**/*.js"
   ],
   "cli": {
      "entitiesDir": "apps/auth/src/app/database/entities",
      "migrationsDir": "apps/auth/src/migrations",
      "subscribersDir": "apps/auth/src/subscriber"
   }
}
```

##### Example start:

```
node ./dist/libs/tools/src/seeds/seed.run.js ./apps/auth/ormconfig.json
```
