# 4. GraphQL API

## Goal

The goal of this lesson is to use your freshly gained knowledge about Prisma Client and use it to implement some resolvers of a GraphQL API using Apollo Server.

## Setup

You can continue working in the same `prisma-workshop` project that you set up in lesson 1. However, the starter for this lesson is located in the `graphql-api` branch of the repo that you cloned. 

Before you switch to that branch, you need to commit the current state of your project. For simplicity, you can use the `stash` command to do this:

```tsx
git stash
```

After you ran this command, you can switch to the `graphql-api` branch and delete the current `migrations` directory and `dev.db` file:

```tsx
git checkout graphql-api
rm -rf prisma/migrations
rm prisma/dev.db
```

Next, wipe your npm dependencies and re-install them to account for the new dependencies in `package.json`:

```graphql
rm -rf node_modules
npm install
```

The data model you will use here is similar to the one from the REST API lesson before:

```graphql
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title     String
  content   String?
  published Boolean  @default(false)
  viewCount Int      @default(0)
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

You can find the tasks for this lesson inside the `src/index.ts` file marked with `TODO`. Your goal is to insert the right Prisma Client queries for each GraphQL resolver.

You can test your implementations by starting the server and opening the GraphQL Playground at `http://localhost:4000`.

### `Query.allUsers: [User!]!`

Fetches all users.

- Solution
    
    ```tsx
    allUsers: (_parent, _args, context: Context) => {
      return context.prisma.user.findMany()
    },
    ```
    
- Sample query
    
    ```graphql
    {
      allUsers {
        id
        name
        email
        posts {
          id
          title
        }
      }
    }
    ```
    

### `Query.postById(id: Int!): Post`

Fetches a post by its ID.

- Solution
    
    ```tsx
    postById: (_parent, args: { id: number }, context: Context) => {
      return context.prisma.post.findUnique({
        where: { id: args.id }
      })
    },
    ```
    
- Sample query
    
    ```graphql
    {
      postById(id: 1) {
        id
        title
        content
        published
        viewCount
        author {
          id
          name
          email
        }
      }
    }
    ```
    

### `Query.feed(searchString: String, skip: Int, take: Int): [Post!]!`

Fetches all published posts and optionally paginates and/or filters them by checking whether the search string appears in either title or content.

- Solution
    
    ```tsx
    feed: (
      _parent,
      args: {
        searchString: string | undefined;
        skip: number | undefined;
        take: number | undefined;
      },
      context: Context
    ) => {
      const or = args.searchString
        ? {
            OR: [
              { title: { contains: args.searchString as string } },
              { content: { contains: args.searchString as string } },
            ],
          }
        : {};
    
      return context.prisma.post.findMany({
        where: {
          published: true,
          ...or,
        },
        skip: Number(args.skip) || undefined,
        take: Number(args.take) || undefined,
      });
    },
    ```
    
- Sample query
    
    ```graphql
    {
      feed {
        id
        title
        content
        published
        viewCount
        author {
          id
          name
          email
        }
      }
    }
    ```
    

### `Query.draftsByUser(id: Int!): [Post]`

Fetches the unpublished posts of a specific user.

- Solution
    
    ```tsx
    draftsByUser: (_parent, args: { id: number }, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: args.id }
      }).posts({
        where: {
          published: false
        }
      })
    },
    ```
    
- Sample query
    
    ```graphql
    {
      draftsByUser(id: 3) {
        id
        title
        content
        published
        viewCount
        author {
          id
          name
          email
        }
      }
    }
    ```
    

### `Mutation.signupUser(name: String, email: String!): User!`

Creates a new user.

- Solution
    
    ```tsx
    signupUser: (
      _parent,
      args: { name: string | undefined; email: string },
      context: Context
    ) => {
      return context.prisma.user.create({
        data: {
          name: args.name,
          email: args.email
        }
      })
    },
    ```
    
- Sample mutation
    
    ```graphql
    mutation {
      signupUser(
        name: "Nikolas"
        email: "burk@prisma.io"
      ) {
        id
        posts {
          id
        }
      }
    }
    ```
    

### `Mutation.createDraft(title: String!, content: String, authorEmail: String): Post`

Creates a new post.

- Solution
    
    ```tsx
    createDraft: (
      _parent,
      args: { title: string; content: string | undefined; authorEmail: string },
      context: Context
    ) => {
      return context.prisma.post.create({
        data: {
          title: args.title,
          content: args.content,
          author: {
            connect: {
              email: args.authorEmail
            }
          }
        }
      })
    },
    ```
    
- Sample mutation
    
    ```graphql
    mutation {
      createDraft(
        title: "Hello World"
        authorEmail: "burk@prisma.io"
      ) {
        id
    		published
        viewCount
        author {
          id
          email
          name
        }
      }
    }
    ```
    

### `Mutation.incrementPostViewCount(id: Int!): Post`

Increments the views of a post by 1.

- Solution
    
    ```tsx
    incrementPostViewCount: (
      _parent,
      args: { id: number },
      context: Context
    ) => {
      return context.prisma.post.update({
        where: { id: args.id },
        data: {
          viewCount: {
            increment: 1
          }
        }
      })
    },
    ```
    
- Sample mutation
    
    ```graphql
    mutation {
      incrementPostViewCount(id: 1) {
        id
        viewCount
      }
    }
    ```
    

### `Mutation.deletePost(id: Int!): Post`

Deletes a post.

- Solution
    
    ```tsx
    deletePost: (_parent, args: { id: number }, context: Context) => {
      return context.prisma.post.delete({
        where: { id: args.id }
      })
    },
    ```
    
- Sample mutation
    
    ```graphql
    mutation {
      deletePost(id: 1) {
        id
      }
    }
    ```
    

### `User.posts: [Post!]!`

Returns the posts of a given user.

- Solution
    
    ```tsx
    User: {
      posts: (parent, _args, context: Context) => {
        return context.prisma.user.findUnique({
          where: { id: parent.id }
        }).posts()
      },
    },
    ```
    

### `Post.author: User`

Returns the author of a given post.

- Solution
    
    ```tsx
    Post: {
      author: (parent, _args, context: Context) => {
        return context.prisma.post.findUnique({
          where: { id: parent.id }
        }).author()
      },
    },
    ```