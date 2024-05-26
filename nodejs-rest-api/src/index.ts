import express from 'express';
import bodyParser from 'body-parser';
import apparelRoutes from './routes/apparel';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.use('/api/apparel', apparelRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
export default app;