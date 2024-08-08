// import { MongoClient } from "mongodb"; for native driver
import mongoose from "mongoose";

const connectDB = async function () {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DB_URL}${process.env.DB_NAME}`
    );
    console.log(
      `DB Connection succesful at ${connectionInstance.connection.host}`
    );
  } catch (e) {
    console.log(`Could not connect with the database: ${e}`);
    process.exit(1);
  }
};

//for Mongoose

//for native driver
// const connectDB = async function () {
//   try {
//     const client = await MongoClient.connect(`${process.env.DB_URL}`);
//     return client.db(`${process.env.DB_NAME}`);
//   } catch (e) {
//     console.log(`Could not connect to the Database: ${e}`);
//   }
// };

export { connectDB };
