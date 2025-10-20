import express from "express"
import { addTest, allTests, loginAdmin } from "../controllers/adminController.js"
import authAdmin from "../middleware/authAdmin.js"
import { changeAvailability } from "../controllers/testsController.js"

const adminRouter = express.Router()

adminRouter.post('/add-test', authAdmin, addTest)
adminRouter.post('/login', loginAdmin)
adminRouter.post('/all-tests', authAdmin, allTests)
adminRouter.post('/change-availability', authAdmin, changeAvailability)

export default adminRouter