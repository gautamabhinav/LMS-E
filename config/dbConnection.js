import mongoose from "mongoose";

mongoose.set('strictQuery', false);

const connectionToDB = async() => {
    try {
        const { connection } = await mongoose.connect(
            process.env.MONGO_URI || `mongodb+srv://abhinav:Abhi123@cluster0.4t5bjxi.mongodb.net/`
        );
    
        if(connection) {
            console.log(`Connected to MongoDB: ${connection.host}`);
        }
    } catch (error) {
        console.log(error);
        process.exit(1);
    }   
}

export default connectionToDB;