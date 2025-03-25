import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const mongoURL =
  'mongodb+srv://bd-ship-mart-db:zRxrvtR7cOPO0b3G@bd-ship-mart.7p43p.mongodb.net/?retryWrites=true&w=majority&appName=bd-ship-mart';

if (!mongoURL) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1); // Exit if the URI is not defined
}

mongoose
  .connect(mongoURL)
  .then(() => {
    console.log('MongoDB connection successful');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
