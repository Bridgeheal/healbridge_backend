import jwt from "jsonwebtoken";

// Admin Authentication middleware
const authAdmin = async (req, res, next) => {
    try {

        const { atoken } = req.headers
        if (!atoken) {
            return res.json({ success: false, message: "Not authorised" })
        }

        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)

        if (token_decode !== process.env.ADMIN_Phone + process.env.ADMIN_Password) {
            return res.json({ success: false, message: "Not authorised" })

        }

        next()

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })


    }

}

export default authAdmin;