const mongoose = require(`mongoose`);
const dbconnect = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `Connected to database : ${connect.connection.host}, ${connect.connection.name}`
    );
  } catch (err) {
    console.log(`Connection failed!!`);
    process.exit(1);
  }
};

module.exports = dbconnect;
