import testsModel from "../models/testsModel.js";

// Change the availability of Tests
const changeAvailability = async (req, res) => {
    try {

        const { testId } = req.body

        const testData = await testsModel.findById(testId)
        await testsModel.findByIdAndUpdate(testId, { availability: !testData.availability })
        res.json({ success: true, message: 'Availability changed' })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }

}

// Show the tests lists
const testsList = async (req, res) => {
    try {

        const tests = await testsModel.find({})

        res.json({ success: true, tests })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })



    }
}

export { changeAvailability, testsList }