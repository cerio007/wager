const express = require(`express`);
const dotenv = require(`dotenv`).config();
// const cron = require(`node-cron`);
// const nodemailer = require(`nodemailer`);
const dbconnect = require(`./config/dbconnect.js`);
// const redisClient = require(`./config/redisconnect`);
const app = express();
const authRoutes = require(`./routes/authRoute.js`);
const userRoutes = require(`./routes/userRoute.js`);
const wagerRoutes = require(`./routes/wagerRoute.js`);
const walletRoutes = require(`./routes/userwalltetRoute.js`);
const companyWalletRoutes = require(`./routes/companyWalletRoute.js`);
// Database Connection
dbconnect();

// Middlewares
app.use(express.json());

// Routes
app.use(`/api/auth`, authRoutes);
app.use(`/api/user`, userRoutes);
app.use(`/api/wager`, wagerRoutes);
app.use(`/api/wallet`, walletRoutes);
app.use(`/api/companyWallet`, companyWalletRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Connected to server on PORT : ${process.env.PORT}`)
);
