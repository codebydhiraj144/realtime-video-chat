import { User } from "../models/User.model.js";
import { Meeting } from "../models/meeting.model.js"; 
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Please provide credentials" });
    }
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" });
        }

        // Verify encrypted password and generate session token
        let isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString("hex");
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Password" });
        }
    } catch (e) {
        return res.status(500).json({ message: `something went wrong ${e}` });
    }
}

const register = async (req, res) => {
    const { name, username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User already exists" });
        }

        // Hash password before saving to database for security
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            username,
            password: hashPassword
        });
        await newUser.save();
        return res.status(httpStatus.CREATED).json({ message: "User Registered" });
    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e}` });
    }
}

const getUserHistory = async (req, res) => {
    const { token } = req.query;
    try {
        // Find user by session token to authorize the request
        const user = await User.findOne({ token: token });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Fetch all meeting records linked to this specific user
        const meetings = await Meeting.find({ user_id: user.username });
        return res.json(meetings);
    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e}` });
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;
    try {
        const user = await User.findOne({ token: token });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Save a new meeting entry to the user's history
        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code 
        });

        await newMeeting.save();
        return res.status(httpStatus.CREATED).json({ message: "Added code to history" });
    } catch (e) {
        return res.status(500).json({ message: `something went wrong ${e}` });
    }
}

export { login, register, getUserHistory, addToHistory };