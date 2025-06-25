const express = require(`express`);
const dotenv = require(`dotenv`);
const session = require(`express-session`);
const passport = require(`passport`);
const GoogleStrategy = require(`passport-google-oauth20`).Strategy;
const dbconnect = require(`./config/dbconnect.js`);
const app = express();
const authRoutes = require(`./routes/authRoute.js`);
const userRoutes = require(`./routes/userRoute.js`);
const wagerRoutes = require(`./routes/wagerRoute.js`);
const walletRoutes = require(`./routes/userwalltetRoute.js`);
const companyWalletRoutes = require(`./routes/companyWalletRoute.js`);
// Database Connection
dbconnect();

dotenv.config();
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
