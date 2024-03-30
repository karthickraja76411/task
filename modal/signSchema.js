import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: [true, 'Phone Number is required'],
        minlength: [10, 'Minimum 10 numbers required'],
        maxlength: [10, 'Maxium 10 numbers required'],
        validate: {
            validator: function (v) {
                const firstDigit = String(v)[0];
                return ['6', '7', '8', '9'].includes(firstDigit);
            },
            message: "please enter valid phone number",
            message: "please enter valid phone number"

        }
    },
    profileImg: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 1,
        enum: [0, 1],
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
    }
});

export const UserModal = mongoose.model('users', userSchema);