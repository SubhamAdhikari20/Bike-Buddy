import mongoose, { Schema, Document } from "mongoose";


export interface Message extends Document {
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: [true, "Content is required"]
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});


export interface User extends Document {
    fullName: string;
    username: string;
    email: string;
    password: string;
    contact: string;
    profilePicture: string;
    verifyCode: string;
    verifyCodeExpiryDate: Date;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<User> = new Schema({
    fullName: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/\S+@\S+\.\S+/, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    contact: {
        type: String,
        required: [true, "Contact is required"]
    },
    verifyCode: {
        type: String,
        required: [true, "Verify Code is required"]
    },
    verifyCodeExpiryDate: {
        type: Date,
        required: [true, "Expiry Date for Verify Code is required"],
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


const UserModel = (mongoose.model<User>("User", UserSchema)) || (mongoose.models.User as mongoose.Model<User>, UserSchema);

export default UserModel;