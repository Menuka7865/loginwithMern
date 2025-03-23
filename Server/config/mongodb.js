import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);

        console.log("Database Connected");

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB Connection Error:", err);
        });

    } catch (error) {
        console.error("Database Connection Failed:", error);
        process.exit(1);
    }
};

export default connectDB;
