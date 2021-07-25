import express from "express";
import cors from "cors";
import helmet from "helmet";
import { router } from './middleware/routes';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/gateway', router);


export default app;