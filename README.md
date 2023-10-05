<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Ejecutar en desarrollo

1. Clonar repositorio

2. Ejecutar

```
yarn install
```

3. Tener Nest CLI instalado

```
yarn install
```

4. Levantar la BD

```
docker-compose up -d
```

5. Clonar el archivo `.env.template` y renombrar como `.env`

6. Llenar la variables de entorno definidas en el `.env`

7. Ejecutar la aplicación en dev:

```
npm run start:dev
```

8. Reconstruir la BD

```
localhost:3000/api/v1/seed
```

## Stack

- Nest
- MongoDB
