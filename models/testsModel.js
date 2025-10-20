import mongoose from "mongoose";

const testsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    fees: {
        type: Number,
        required: true
    },

    date: {
        type: Number,
        required: true
    },

    availability: {
        type: Boolean,
        default: true

    },

    slots_booked: {
        type: Object,
        default: {}
    }

}, { minimize: false });

const testsModel = mongoose.models.tests || mongoose.model("tests", testsSchema);
export default testsModel;

