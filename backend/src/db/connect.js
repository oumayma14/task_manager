import mongoose from 'mongoose';

const connect = async () => {
    try{
        console.log("Attempting to connect to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("Connected to MongoDB successfully."); 
    } catch (error) {
        console.log("Failed to connect to database...");
        process.exit(1);
    }
}

export default connect; 