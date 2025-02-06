# Recipe_nest

**Recipe_nest** is a training project.

## About

In this project users can add their own recipe and others can search for them by setting search parameters.

## Main Stack

The core technologies used in this project are:

- [**NestJs**](https://nestjs.com/): To create an API for the application.
- [**MinIO**](https://min.io/): For image storage.
- [**PostgreSQL**](https://www.postgresql.org/): For recipes storage.
- [**Docker**](https://www.docker.com/): To containerize and build the entire project using **docker-compose**.
- [**Swagger**](https://swagger.io/): For the documentation api.
- [**TypeORM**](https://typeorm.io/): ORM from SQL.

---

## Installation

Follow these steps to set up and run the project:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Fileurix3/recipe_nest.git
   ```

2. **Navigate to the Project Folder**

   ```bash
   cd recipe_nest
   ```

3. **Add a `.env` File**

   Create a `.env` file in the root directory with the following parameters:

   ```env
    JWT_SECRET="recipe_nest"

    DB_NAME="recipe_nest"
    DB_USER="postgres"
    DB_PASSWORD="2335"
    DB_HOST="postgresRecipe"
    DB_PORT="5432"

    MINIO_END_POINT="minioRecipe:9000"
    MINIO_ACCESS_KEY="accessKey"
    MINIO_SECRET_KEY="secretKey"


   ```

4. **Run the Project Using Docker Compose**

   ```bash
   docker compose up
   ```

---
