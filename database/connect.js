import mongoose from "mongoose";
import "dotenv/config"

export const connectDB = async () => {
    await mongoose.connect(`${process.env.MONGODB_URI}/project-0`).then(() => console.log("DB is connected successfully"));
}