import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173' // Allow requests from the frontend
}));

app.use(express.json({ limit: '5mb' })); // Increase payload size limit
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Flow2Code Backend is running!');
});

app.use('/api', apiRoutes);

export default app;