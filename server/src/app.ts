import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173' 
}));

app.use(express.json({ limit: '5mb' })); 
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Flow2Code Backend is running!');
});

app.use('/api', apiRoutes);

export default app;