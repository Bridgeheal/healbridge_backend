import express from 'express'
import { registerUser, loginUser, getProfile, updateProfile, bookTests, listTests, cancelAppointment, orderMedicine, listMedicines, bookNursing, listNursing } from '../controllers/userController.js'
import authUser from '../middleware/authUser.js'
import upload from '../middleware/multer.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile)
userRouter.post('/book-tests', authUser, bookTests)
userRouter.get('/tests-bookings', authUser, listTests)
userRouter.post('/cancel-booking', authUser, cancelAppointment)
userRouter.post('/order-medicine', authUser, upload.single('image'), orderMedicine)
userRouter.get('/medicine-bookings', authUser, listMedicines)
userRouter.post('/book-nurse', authUser, bookNursing)

userRouter.get('/nurse-bookings', authUser, listNursing)

export default userRouter
