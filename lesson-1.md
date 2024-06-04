# 1. Set up Prisma

## Goal

The goal of this lesson is to set up Prisma, get comfortable with Prisma's data modeling language and perform your first database migration.

## Setup

First, clone the [starter project from GitHub](https://github.com/nikolasburk/prisma-workshop) by following the instructions in the README. Once you've got the starter project on your machine, you can move on and create the database tables you need for this lesson.

## Tasks

Once you cloned the repo and installed the npm dependencies, you're ready to get started on the tasks of this lesson 💪

### Task 1: Create your first Prisma model

The [Prisma schema](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema) (typically called `schema.prisma`) file sits at the core of every project that uses any of the Prisma tools. You current Prisma schema looks like this:

```jsx
// prisma/schema.prisma

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}
```

It specifies the database connection to a SQLite database file via the `datasource` and indicates that you want to use Prisma Client by specifying the `generator`.

In addition to the data source and generators, the Prisma schema also contains your *Prisma models* which are Prisma's representation of your database tables. In this case, you'll create your first Prisma model.

Start by creating the following `User` model with the following fields. Choose the data type that feels the most appropriate to you:

- `id`: an auto-incrementing integer to uniquely identify each user in the database
- `name`: the name of a user, this field should be *optional* in the database
- `email`: the email address of a user, this field should be *required* and *unique* in the database

Once you're ready, you can compare your result with the solution below.

- Solution
    
    ```graphql
    model User {
      id    Int     @id @default(autoincrement())
      name  String?
      email String  @unique
    }
    ```
    

### Task 2: Run your first migration

With your first model in place, you are already set to create the corresponding database table. Scan the [docs](https://www.prisma.io/docs/concepts/components/prisma-migrate) to find the Prisma CLI command that helps you run local migrations. Once you've found the command, run it and give the migration an appropriate name (e.g. `init`).

- Solution
    
    ```graphql
    npx prisma migrate dev --name init
    ```
    

If you ran this command correctly, two new things will be added to your project inside the `prisma` directory:

- a `migrations` directory that keeps track of your database migrations over time
- a `dev.db` file which is your SQLite database file

### Task 3: Create database records with Prisma Studio

Congratulations, you just created a new database with a table called `User` using Prisma. Before you move on to the next section, use [Prisma Studio](https://www.prisma.io/studio) to create a couple of database records. Run the following command to open Prisma Studio:

```graphql
npx prisma studio
```

Once it's open, create three records in the `User` table and save them in the database.