import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { router } from './middleware/routes';
import mongoose from 'mongoose';
dotenv.config();

const app = express();

if (!process.env.PORT) {
  console.error('PORT environment variable not set')
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/gateway', router);

app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}`);
}).on("error", console.error);


mongoose
  .connect(
    process.env.MONGO_URI as string,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

  export default app;