import express from "express"
import cors from "cors"
import { connectDB } from "./database/connect.js"
import connectCloudinary from "./database/cloudinary.js"
import "dotenv/config"
import adminRouter from "./routes/adminRoute.js"
import testRouter from "./routes/testRoute.js"
import userRouter from "./routes/userRoutes.js"
import authRoutes from "./routes/auth.js";

// Config
const app = express()
const port = process.env.PORT

// Middleware
app.use(express.json())
app.use(cors())

// DB connection
connectDB();
connectCloudinary();

// API endpoint
app.use("/api/admin", adminRouter)
app.use('/api/test', testRouter)
app.use('/api/user', userRouter)
app.use('/api/auth', authRoutes)


app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`)
})
