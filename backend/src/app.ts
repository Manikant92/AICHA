import express from 'express';
import cors from 'cors';
import aiRoutes from './routes/ai';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app; 