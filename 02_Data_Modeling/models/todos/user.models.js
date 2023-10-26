import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, "password is required"],
        }
    },
    {
        timestamps: true // It adds two fields `createdAt` and `updatedAt`
    }
)

export const User = mongoose.model("User", userSchema);

// MongoDB will store the data model as `users` => all in lowercase and a `s` in the last 