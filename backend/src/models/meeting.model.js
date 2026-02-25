import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema({
    user_id: { type: String },
    meetingCode: { type: String, required: true }, // Changed to meetingCode to match controller
    date: { type: Date, default: Date.now, required: true } // Changed 'data' to 'date'
})

// Use Uppercase 'Meeting' for the export to follow industry standards
const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };