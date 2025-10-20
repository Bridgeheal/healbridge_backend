import mongoose from "mongoose";

const nursingSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },

    userData: {
        type: String,
        required: true
    },

    serviceName: {
        type: String,
        required: true
    },

    agreement: {
        type: String,
        required: true
    },

    date: {
        type: Number,
        required: true
    },

    cancelled: {
        type: Boolean,
        required: true
    },

    availability: {
        type: Boolean,
        default: true
    },

    payment: {
        type: Boolean,
        default: false
    },

    slots_booked: {
        type: Object,
        default: {}
    }

}, { minimize: false });

const nursingModel = mongoose.models.nursing || mongoose.model("nursing", nursingSchema);
export default nursingModel;

