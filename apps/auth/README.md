# auth-service

Main auth service with REST-API interface.

### Build

```
npm run build auth
```

### Run

```
npm start auth
```

### Migrations

Create:

```
npx typeorm migration:create --config ./apps/auth/ormconfig.json --name <name>
```

Run:

```
npm run build auth
npx typeorm migration:run --config ./apps/auth/ormconfig.json -t=each
```

### Seeders

```
npm run build auth
node ./dist/libs/tools/src/seeds/seed.run.js ./apps/auth/ormconfig.json
```
