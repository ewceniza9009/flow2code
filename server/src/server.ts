import app from './app';

const PORT = process.env.PORT || 8383;

app.listen(PORT, () => {
  console.log(`[INFO] Server is running at http://localhost:${PORT}`);
});