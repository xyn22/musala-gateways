import * as dotenv from "dotenv";
import mongoose from 'mongoose';
import app from "./server";
dotenv.config();

if (!process.env.PORT) {
  console.error('PORT environment variable not set')
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}`);
})
.on("error", console.error)

mongoose
  .connect(
    process.env.MONGO_URI as string,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));