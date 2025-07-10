import mongoose from "mongoose";

const taxConfigSchema = new mongoose.Schema({
    rate: {
        type: Number,
        required: true,
        default: 0.08,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    versionKey: false
});

const TaxConfig = mongoose.model("TaxConfig", taxConfigSchema);
export default TaxConfig; 