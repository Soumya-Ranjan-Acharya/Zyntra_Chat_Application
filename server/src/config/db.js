import mongoose from 'mongoose';

export const connectDB = async (retries = 10, delay = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4 to prevent Windows DNS/TLS hangs on Node 22
      });
      console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
      console.log(`[MongoDB Atlas] Database Name: ${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.warn(`[MongoDB Atlas] Connection attempt ${attempt} of ${retries} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`[MongoDB Atlas] Retrying connection in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(`[MongoDB Atlas] All ${retries} connection attempts failed.`);
        // Do not abandon; retry again in background
        setTimeout(() => connectDB(5, 3000), 5000);
      }
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Atlas] Disconnected from Atlas. Attempting reconnect...');
  setTimeout(() => connectDB(3, 2000), 2000);
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB Atlas] Connection event error:', err.message);
});
