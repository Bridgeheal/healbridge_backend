import testsModel from "../models/testsModel.js";
import jwt from 'jsonwebtoken'

// API for adding tests
const addTest = async (req, res) => {
    try {

        const { name, category, description, fees } = req.body;

        // checking for all data to add test
        if (!name || !category || !description || !fees) {
            return res.json({ success: false, message: "Missing details" })
        }

        const testsData = {
            name,
            category,
            description,
            fees,
            date: Date.now()
        }

        const newTest = new testsModel(testsData)
        await newTest.save()

        res.json({ success: true, message: "Test added" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })


    }
}

// API for Admin Login
const loginAdmin = async (req, res) => {
    try {

        const { phone, password } = req.body;

        if (phone === process.env.ADMIN_Phone && password === process.env.ADMIN_Password) {

            const token = jwt.sign(phone + password, process.env.JWT_SECRET)
            res.json({ success: true, token })

        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}

// API to get all Tests data for admin panel
const allTests = async (req, res) => {
    try {

        const tests = await testsModel.find({})
        res.json({ success: true, tests })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }

}

export { addTest, loginAdmin, allTests }
