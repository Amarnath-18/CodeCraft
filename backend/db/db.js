import mongoose from "mongoose";

const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log(`MongoDB is succesfully connected on`);
    })
    .catch((err) => {
      console.log(`Error in Connecting MongoDB Error: ${err}`);
      process.exit(1);
    });
};

export default connectDB;
