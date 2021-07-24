import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

const app = express();
const port = 3000;
app.get('/', (req, res) => {
  res.send('I hear you!');
});

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
}).on("error", console.log);


export default mongoose
  .connect(
    process.env.MONGO_URI as string,
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
