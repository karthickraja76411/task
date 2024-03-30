import mongoose from "mongoose";


// export const db = 

export default function connectDB() {
    mongoose.connect('mongodb://localhost:27017')
        .then(() => console.log('DATABASE IS ESTABLISHED!'))
        .catch((err) => console.log("DBERROR:", err.message));
}