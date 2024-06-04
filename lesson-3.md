# 3. REST API

## Goal

The goal of this lesson is to use your freshly gained knowledge about Prisma Client and use it to implement some routes of a REST API using [Express](https://expressjs.com/).

## Setup

You can continue working in the same `prisma-workshop` project that you set up in lesson 1. However, the starter for this lesson is located in the `rest-api` branch of the repo that you cloned. 

Before you switch to that branch, you need to commit the current state of your project. For simplicity, you can use the `stash` command to do this:

```tsx
git stash
```

After you ran this command, you can switch to the `rest-api` branch and delete the current `migrations` directory and `dev.db` file:

```tsx
git checkout rest-api
rm -rf prisma/migrations
rm prisma/dev.db
```

Next, wipe your npm dependencies and re-install them to account for the new dependencies in `package.json`:

```graphql
rm -rf node_modules
npm install
```

The data model you will use here is very similar to the one that you created before, only the `Post` model got extended with a few additional fields:

```graphql
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  **createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt**
  title     String
  content   String?
  published Boolean  @default(false)
  **viewCount Int      @default(0)**
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
```

Since you are starting over with your Prisma setup, you have to recreate the database and its tables. Run the following command to do this:

```tsx
npx prisma migrate dev --name init
```

Finally, you can seed the database with some sample data that's specified in the `prisma/seed.ts` file. You can execute this seed script with this command:

```tsx
npx prisma db seed --preview-feature
```

That's it, you're ready for your tasks now!

## Tasks

You can find the tasks for this lesson inside the `src/index.ts` file marked with `TODO`. Your goal is to insert the right Prisma Client queries for each REST API route.

Note that this is in *not* a lesson in API design and you should think more carefully about designing your API operations in a real-world application.

If you're using VS Code, you can install the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension and test your implementation using the provided HTTP calls in [`test.http`](https://github.com/nikolasburk/prisma-workshop/blob/rest-api/test.http).

- View a quick demo of the VS Code REST Client extension
    
    !https://s3-us-west-2.amazonaws.com/secure.notion-static.com/529e9fc1-ec91-4c62-a06f-e1d29c517e7b/rest-client.gif
    

### `GET /users`

Fetches all users.

- Solution
    
    ```tsx
    app.get("/users", async (req, res) => {
      const result = await prisma.user.findMany()
      res.json(result)
    });
    ```
    

### `POST /signup`

Creates a new user.

- Solution
    
    ```tsx
    app.post(`/signup`, async (req, res) => {
      const { name, email } = req.body;
    
      const result = await prisma.user.create({
        data: {
          name,
          email
        }
      })
    
      res.json(result)
    });
    ```
    

### `POST /post`

Creates a new post.

- Solution
    
    ```tsx
    app.post(`/post`, async (req, res) => {
      const { title, content, authorEmail } = req.body;
    
      const result = await prisma.post.create({
        data: {
          title,
          content,
          author: {
            connect: {
              email: authorEmail
            }
          }
        }
      })
    
      res.json(result)
    });
    ```
    

### `PUT /post/:id/views`

Increments the views of a post by 1.

- Solution
    
    ```tsx
    app.put("/post/:id/views", async (req, res) => {
      const { id } = req.params;
    
      const result = await prisma.post.update({
        where: {
          id: Number(id),
        },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
    
      res.json(result);
    });
    ```
    

### `PUT /publish/:id`

Publishes a post.

- Solution
    
    ```tsx
    app.put("/publish/:id", async (req, res) => {
      const { id } = req.params;
    
      const result = await prisma.post.update({
        where: { id: Number(id) },
        data: {
          published: true,
        },
      });
    
      res.json(result);
    });
    ```
    

### `GET /user/:id/drafts`

Fetches the unpublished posts of a specific user.

- Solution
    
    ```tsx
    app.get("/user/:id/drafts", async (req, res) => {
      const { id } = req.params;
    
      const result = await prisma.user.findUnique({
        where: { id: Number(id) },
      }).posts({
        where: {
          published: false
        }
      })
    
      res.json(result)
    });
    ```
    

### `GET /post/:id`

Fetches a post by its ID.

- Solution
    
    ```tsx
    app.get(`/post/:id`, async (req, res) => {
      const { id } = req.params;
    
      const result = await prisma.post.findUnique({
        where: { id: Number(id) },
      });
    
      res.json(result);
    });
    ```
    

### `GET /feed?searchString=<searchString>&skip=<skip>&take=<take>`

Fetches all published posts and optionally paginates and/or filters them by checking whether the search string appears in either title or content.

- Solution
    
    ```tsx
    app.get("/feed", async (req, res) => {
      const { searchString, skip, take } = req.query;
    
      const or = searchString ? {
        OR: [
          { title: { contains: searchString as string } },
          { content: { contains: searchString as string } },
        ],
      } : {}
    
      const result = await prisma.post.findMany({
        where: {
          published: true,
          ...or
        },
        skip: Number(skip) || undefined,
        take: Number(take) || undefined,
      });
    
      res.json(result);
    });
    ```