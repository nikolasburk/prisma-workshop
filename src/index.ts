import { Prisma, PrismaClient } from '@prisma/client'
import express from 'express'

const prisma = new PrismaClient()
const app = express()

app.use(express.json())

app.post(`/signup`, async (req, res) => {
  const { name, email } = req.body

  const result = // TODO

  res.json(result)
})

app.post(`/post`, async (req, res) => {
  const { title, content, authorEmail } = req.body

  const result = // TODO

  res.json(result)
})

app.put('/post/:id/views', async (req, res) => {
  const { id } = req.params

  const result = // TODO

  res.json(result)
})

app.delete(`/post/:id`, async (req, res) => {
  const { id } = req.params

  const result = // TODO

  res.json(result)
})

app.get('/users', async (req, res) => {
  const result = // TODO

  res.json(result)
})

app.get('/user/:id/drafts', async (req, res) => {
  const { id } = req.params

  const result = // TODO

  res.json(result)
})

app.get(`/post/:id`, async (req, res) => {
  const { id }: { id?: number } = req.params

  const result = // TODO

  res.json(result)
})

app.get('/feed', async (req, res) => {

  const { searchString, skip, take, orderBy } = req.query

  const result = // TODO

  res.json(result)
})

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`,
  ),
)