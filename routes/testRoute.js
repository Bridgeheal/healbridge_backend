import express from "express"
import { testsList } from "../controllers/testsController.js"
const testRouter = express.Router()

testRouter.get('/list', testsList)

export default testRouter