import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "15kb" }))
app.use(express.urlencoded({ extended: true, limit: "15kb" })) // data received from the client in url
app.use(express.static("public"))
app.use(cookieParser())


// routes import
import userRouter from './routes/user.routes.js'


// routes decleration
app.use("/api/v1/users", userRouter)


export { app }