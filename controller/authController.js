const bcrypt = require(`bcryptjs`);
const jwt = require(`jsonwebtoken`);
const User = require(`../models/User.js`);
const userWallet = require(`../models/userWallet.js`);

const register = async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
      role,
    });
    const savedUser = await newUser.save();
    const userId = savedUser._id;

    if (!savedUser) {
      res
        .status(404)
        .json({ message: `Something went wrong while saving user data` });
    }

    let userBalance = 10000;
    await userWallet.create({
      userId: userId,
      username,
      balance: userBalance,
    });
    const token = jwt.sign(
      { id: savedUser._id, username: savedUser.username },
      process.env.JWT_SECRET,
      { expiresIn: `24h` }
    );
    res.status(200).json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Something went wrong`, error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = await User.findOne({ email });
    const user1 = await User.findOne({ username });
    if (!user && !user1) {
      return res.status(404).json({
        message: `user with email ${email} and  ${username} not found`,
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: `Invalid credentials` });
    }

    const userId = typeof user._id == String ? user._id : user._id.toString();

    const token = jwt.sign(
      { id: userId, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: `24h`,
      }
    );
    res.status(200).json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Something went wrong`, error: error.message });
  }
};

module.exports = {
  register,
  login,
};
