import dotenv from "dotenv";
dotenv.config();
import { app } from "./app.js";
import { connectDB } from "./db/db.js";
const alternatePort = 4000;

connectDB().then(function (database) {
  app.listen(process.env.PORT || alternatePort, () => {
    console.log(`App is listening on ${process.env.PORT || alternatePort}`);
  });
});
// connectDB().then(function (database) {
//   app.listen(process.env.PORT || alternatePort, () => {
//     console.log(`App is listening on ${process.env.PORT || alternatePort}`);
//   });
// });

//Above code for native drivers

//Below for mongoose
