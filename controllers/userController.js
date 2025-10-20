import validator from 'validator'
import bcrypt from 'bcrypt'
import razorpay from "razorpay"
import userModel from '../models/userModel.js'
import nursingModel from '../models/nursingModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from "cloudinary"
import testsModel from '../models/testsModel.js'
import appointmentModel from '../models/appointmentModel.js'
import medicineModel from '../models/medicineModel.js'


// API to User registration
const registerUser = async (req, res) => {
    try {
        const { name, phone, password } = req.body

        if (!name || !password || !phone) {
            return res.json({ success: false, message: "Missing Details" })
        }

        if (!validator.isMobilePhone(phone)) {
            return res.json({ success: false, message: "Enter valid Phone Number" })

        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password" })
        }

        // Hashing User Password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            phone,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })



    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}

// API for User Login
const loginUser = async (req, res) => {
    try {

        const { phone, password } = req.body
        const user = await userModel.findOne({ phone })

        if (!user) {
            return res.json({ success: false, message: 'User does not exist' })

        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })

        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}

// API to get User Profile data
const getProfile = async (req, res) => {
    try {

        const userId = req.user.userId;

        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }

}

// API to edit User Profile
const updateProfile = async (req, res) => {
    try {

        const { name, phone, address, dob, gender } = req.body;
        const imageFile = req.files;
        const userId = req.user.userId;

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data is missing" })

        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {

            //Upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })

        }

        res.json({ success: true, message: "Profile is Updated" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }

}

// API to book the tests 
const bookTests = async (req, res) => {
    try {
        const { testId, slotDate, slotTime } = req.body

        const testData = await testsModel.findById(testId)
        const userId = req.user?.userId;


        if (!testData.availability) {
            return res.json({ success: false, message: "Test is not available" })

        }

        let slots_booked = testData.slots_booked

        // Checking for slots availability

        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: "Slot is not available" })


            } else {
                slots_booked[slotDate].push(slotTime)
            }

        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId)

        delete testData.slots_booked

        const appointmentData = {
            userId,
            testId,
            userData,
            testData,
            amount: testData.fees,
            slotTime,
            slotDate,
            date: Date.now()

        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // Save new slots data in testData
        await testsModel.findByIdAndUpdate(testId, { slots_booked })

        res.json({ success: true, message: "Appointment Booked" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }

}

// API to get User Tests booking 
const listTests = async (req, res) => {
    try {

        const userId = req.user?.userId;

        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}

// API to cancel Test booking
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const userId = req.user?.userId;

        const appointmentData = await appointmentModel.findById(appointmentId)

        // Verify appointment user

        if (appointmentData.userId !== userId) {

            return res.json({ success: false, message: "Unauthorized action" })

        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // Releasing test slot

        const { testId, slotDate, slotTime } = appointmentData

        const testData = await testsModel.findById(testId)

        let slots_booked = testData.slots_booked
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
        await testsModel.findByIdAndUpdate(testId, { slots_booked })

        res.json({ success: true, message: "Appointment Cancelled" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}

// API to book for medicine
const orderMedicine = async (req, res) => {
    try {
        const { category, medicineName, note } = req.body;
        const userId = req.user?.userId;

        if (!category) {
            return res.status(400).json({ success: false, message: "Category is required" });
        }

        // Category validation
        if (category.toLowerCase() === "with prescription") {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Prescription image is required"
                });
            }
        } else if (category.toLowerCase() === "over the counter") {
            if (!medicineName && !req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Medicine name or image is required"
                });
            }
        }

        // Upload image to Cloudinary if exists
        let imageURL = "";
        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, {
                resource_type: "image",
            });
            imageURL = imageUpload.secure_url;
        }

        // Get user data
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Save to DB
        const orderData = {
            userId,
            userData,
            medicineName: medicineName || (category.toLowerCase() === "with prescription" ? "Prescription Upload" : ""),
            category,
            image: imageURL,
            note: note || "",
            date: Date.now(),
        };

        const newOrder = new medicineModel(orderData);
        await newOrder.save();

        res.status(201).json({ success: true, message: "Medicine order placed successfully" });

    } catch (error) {
        console.error("Order Medicine Error:", error);
        res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
};

// API to get User Medicine booking
const listMedicines = async (req, res) => {
    try {

        const userId = req.user?.userId;

        const medicines = await medicineModel.find({ userId })

        res.json({ success: true, medicines })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }

}

// API to book Nurse
const bookNursing = async (req, res) => {
    try {
        const { serviceName, agreement, date } = req.body;
        const userId = req.user?.userId;

        if (!serviceName) {
            return res.json({ success: false, message: "Please enter the service Name" })
        }

        if (!agreement) {
            return res.json({ success: false, message: "Please read the agreement before booking" })
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.json({ success: false, message: "User not found" })
        }

        // Save to DB 
        const nursingData = {
            userId,
            userData,
            serviceName: serviceName,
            agreement,
            date: Date.now()
        }

        const newService = new nursingModel(nursingData);
        await newNursing.save()

        res.status(201).json({ success: true, message: "Nursing order placed successfully" });

    } catch (error) {
        console.error("Nursing service Error", error);
        res.json({ success: true, message: "Server error: " + error.message })

    }
}


// API to get User Nurse booking


// API to cancel Nurse booking



// API for Razorpay payments












export { registerUser, loginUser, getProfile, updateProfile, bookTests, listTests, cancelAppointment, orderMedicine, listMedicines, bookNursing }