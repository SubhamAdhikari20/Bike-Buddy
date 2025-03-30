import mongoose from "mongoose";


type ConnectionObject = {
    isConnected?: number;
}

const connection: ConnectionObject = {};

const databaseConnection = async (): Promise<void> => {
    if (connection.isConnected) {
        console.log("Database is already connected.");
        return;
    }

    try{
        const database = await mongoose.connect(process.env.MONGODB_URI || "", {});

        connection.isConnected = database.connections[0].readyState

        console.log("Database connected successfully");
    }
    catch (error){
        console.log("Database connection failed", error);
        
        process.exit(1);
    }
};

export default databaseConnection;