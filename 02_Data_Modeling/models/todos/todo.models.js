import mongoose from 'mongoose'

const todoSchema = new mongoose.Schema(
    {
        content: {
            type: String, 
            required: true,
        },
        complete: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            // Giving the reference to another model
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" // Name should be same as model name
        },
        subTodos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SubTodo"
            }
        ] // Array of sub-todos
    },
    {
        timestamps: true
    }
)

export const Todo = mongoose("Todo", todoSchema);