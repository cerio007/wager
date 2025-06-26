const dotenv = require(`dotenv`).config();
// const cron = require(`node-cron`);
const nodemailer = require(`nodemailer`);
const userLedger = require(`../models/userLedger`);
const User = require(`../models/User`);
const companyLedger = require(`../models/companyLedger`);
const Wager = require(`../models/wager`);
const wagerTransaction = require(`../models/wagerTransaction`);
const userWallet = require(`../models/userWallet`);
const companyWallet = require(`../models/companyWallet`);
const wager = require(`../models/wager`);
// const senderEmail = require(`../utils/emailSender`);

// cron.schedule(`0 0 5,17 * *`, function () {
//   sendMail();
// });

// Get A Wager Transaction
const getWagerTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const wagerTx = await wagerTransaction.findById(id);
    res.status(200).json(wagerTx);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Wager Transactions
const getWagerTxs = async (req, res) => {
  try {
    const wagerTxs = await wagerTransaction.find({});
    res.status(200).json(wagerTxs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Wagers
const getWagers = async (req, res) => {
  try {
    const wagers = await Wager.find({});
    res.status(200).json(wagers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Wagers By User
const getWagersByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const wagers = await Wager.find({ wagererId: userId });
    res.status(200).json(wagers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get A Wager
const getWager = async (req, res) => {
  try {
    const { id } = req.params;
    const wager = await Wager.findById(id);
    if (!wager) {
      return res.status(404).json({ message: `Wager not found` });
    }
    res.status(200).json(wager);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get A Wager By User
const getWagerByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const wager = await Wager.find({ wagererId: userId });
    if (!wager) {
      return res.status(404).json({ message: `Wager not found` });
    }
    res.status(200).json(wager);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create A Wager
const createWager = async (req, res) => {
  try {
    const adProfile = await User.find({ role: `admin` });
    const adminDetails = adProfile[0];
    const adminUsername = adminDetails.username;
    const userId = req.user.id;
    const userUsername = req.user.username;
    const { title, description, wagerPosition, stake, endDate, invites } =
      req.body;
    ivs = invites.filter(
      (invitee) => invitee !== userUsername && invitee !== adminUsername
    );
    const wallet = await userWallet.findOne({ userId });
    if (stake < 0) {
      return res.status(404).json({ message: `Negative values not accepted` });
    }
    const TotalAmount = stake * ivs.length;
    if (!wallet) {
      return res.status(404).json({ message: `User Wallet not found` });
    }
    if (userWallet.balance < TotalAmount) {
      return res.status(404).json({ message: `Insufficient Balance` });
    }
    if (ivs.includes(adminUsername)) {
      return res.status(400).json({
        message: `You cannot invite an admin to a wager you are creating.`,
      });
    }
    if (ivs.includes(userUsername)) {
      return res.status(400).json({
        message: `You cannot invite yourself to a wager you are creating.`,
      });
    }
    const wager = await Wager.create({
      title,
      description,
      wagerPosition,
      stake,
      wagererId: userId,
      wagerer: userUsername,
      invites: ivs,
      endDate,
    });
    old = wallet.balance;
    newBalance = wallet.balance -= TotalAmount;
    await wallet.save();
    const { id } = req.params;
    const comWallet = await companyWallet.findOne({ id });
    if (!comWallet) {
      return res.satus(404).json({ message: `Company Wallet not found` });
    }
    comWallet.balance += TotalAmount;
    await comWallet.save();
    await userLedger.create({
      userId: userId,
      username: userUsername,
      oldBalance: old,
      newBalance: newBalance,
    });
    const companyId = comWallet.userId;
    const companyUsername = await User.findById(companyId);
    const username = companyUsername.username;
    oldBalance = comWallet.balance;
    newBal = comWallet.balance -= TotalAmount;
    await companyLedger.create({
      userId: comWallet.userId,
      username: username,
      oldBalance: oldBalance,
      newBalance: newBal,
    });
    if (!wager) {
      return res.status(404).json({ message: `Error creating wager` });
    }
    let successfulTx = [];
    let failedTx = [];
    for (let i = 0; i < ivs.length; i++) {
      const taker = await User.findOne({
        username: ivs[i],
      });
      if (taker) {
        successfulTx.push(taker._id);
      } else {
        const registeredUsers = await User.find({ username: { $in: ivs } });
        const registeredUsernames = registeredUsers.map(
          (user) => user.username
        );
        //  Find usernames in invites that are NOT in registeredUsernames
        failedTx.push(
          ...invites.filter(
            (username) => !registeredUsernames.includes(username)
          )
        );
        // Remove duplicate usernames from failedTx
        const uniqueFailed = [];
        const seenNames = new Set();
        for (const username of failedTx) {
          if (!seenNames.has(username)) {
            uniqueFailed.push(username);
            seenNames.add(username);
          }
        }
        failedTx.length = 0;
        failedTx.push(...uniqueFailed);
      }
      if (!taker) {
        break;
      }
      await wagerTransaction.create({
        wagerId: wager._id,
        title,
        description,
        wagererPosition: wagerPosition,
        takerPosition: !wagerPosition,
        stake,
        wagererId: userId,
        wagerer: userUsername,
        takerId: taker._id,
        taker: taker.username,
        endDate,
      });
    }
    if (!ivs || !Array.isArray(ivs) || ivs.length === 0) {
      return res.status(400).json({ message: `No username found.` });
    }
    const userFound = await User.findOne().select(`email name username`);
    const userFoundInDb = [userFound];
    const emailSub = `${title}`;
    const emailText = (user) =>
      `Hi ${user},\n\nCheck out this wager you just created\n\nBest regards,\n<strong>Admin</strong>`;
    const emailTemplate = (user) => `
                <p>Hi <strong>${user}</strong>,</p>
                <p>You have successfully created a wager titled <strong>${title}</strong></p>
                <p>Visit our website to learn more about your wager <strong>${title}:</strong> <a href="http://www.flashscore.com.ng">Click Here</a></p>
                <p>Best regards,</p>
                <p><strong>Admin</strong></p>
            `;
    let sentEmailCount = 0;
    const processedUsername = new Set();
    const emailPromise = userFoundInDb.map(async (user) => {
      processedUsername.add(user.username.toLowerCase());
      try {
        const useName = user.name || user.username;
        const contentHtml = emailTemplate(useName);
        const contentText = emailText(useName);
        await senderEmail(user.email, emailSub, contentText, contentHtml);
        sentEmailCount++;
      } catch (emailError) {
        console.error(
          `Failed to send email to ${user.email} (SMTP error):`,
          emailError.message
        );
      }
    });
    await Promise.allSettled(emailPromise);
    const invitesFoundInDb = await User.find({
      username: { $in: ivs.map((u) => u.toLowerCase()) },
    }).select(`email name username`);
    if (invitesFoundInDb.length === 0) {
      return res.status(404).json({ message: `No user found.` });
    }
    const emailSubject = `${title}`;
    const emailPlainText = (user) =>
      `Hi ${user},\n\nCheck out this wager\n\nBest regards,\n<strong>${userUsername}</strong>`;
    const emailHtmlTemplate = (user) => `
                <p>Hi <strong>${user}</strong>,</p>
                <p><strong>${userUsername}</strong> has created a wager <strong>${title}</strong> and you have been invited to participate in this wager!</p>
                <p>Visit our website to learn more about <strong>${title}:</strong> <a href="http://www.flashscore.com.ng">Click Here</a></p>
                <p>Best regards,</p>
                <p><strong>${userUsername}</strong></p>
            `;
    let emailsSentCount = 0;
    let emailsFailedCount = 0;
    const failedEmailDetails = [];
    const processedUsernames = new Set();
    const emailPromises = invitesFoundInDb.map(async (user) => {
      processedUsernames.add(user.username.toLowerCase());
      if (!user.email) {
        console.warn(`User ${user.username} has no email address. Skipping.`);
        failedEmailDetails.push({
          username: user.username,
          reason: `No email address found for user in DB.`,
        });
        return;
      }
      try {
        const userName = user.name || user.username;
        const htmlContent = emailHtmlTemplate(userName);
        const textContent = emailPlainText(userName);
        await senderEmail(user.email, emailSubject, textContent, htmlContent);
        emailsSentCount++;
      } catch (emailError) {
        console.error(
          `Failed to send email to ${user.email} (SMTP error):`,
          emailError.message
        );
        emailsFailedCount++;
        failedEmailDetails.push({
          username: user.username,
          email: user.email,
          reason: `SMTP error: ${emailError.message}`,
        });
      }
    });
    await Promise.allSettled(emailPromises);
    ivs.forEach((invitedUsername) => {
      if (!processedUsernames.has(invitedUsername.toLowerCase())) {
        emailsFailedCount++;
        failedEmailDetails.push({
          username: invitedUsername,
          reason: 'User not registered in database (no matching email found).',
        });
      }
    });
    res.status(200).json({
      wager,
      successfulTx,
      failedTx,
      message: `Email sending process completed.`,
      totalUsers: ivs.length + userFoundInDb.length,
      usersFoundInDb: userFoundInDb.length + invitesFoundInDb.length,
      usersNotfoundInDb: emailsFailedCount,
      emailsSent: emailsSentCount + sentEmailCount,
      emailsFailed: emailsFailedCount,
      invitesFoundInDb: invitesFoundInDb.length,
      failedEmailDetails: failedEmailDetails,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept and Reject A Wager
const confirmWager = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, status } = req.body;
    const usID = req.user.id;
    const takerTx = await wagerTransaction.findById(id);
    const userId = takerTx.wagererId;
    const wagerer = takerTx.wagerer;
    const wagerWallet = await userWallet.findOne({ userId });
    const takerWallet = await userWallet.findOne({ username });
    const userUsername = req.user.username;
    const coWallet = await companyWallet.find({});
    const comWallet = coWallet[0];
    const companyId = comWallet.userId;
    const companyUsername = await User.findById(companyId);
    const usname = companyUsername.username;
    if (usID) {
      if (status !== `accept` && status !== `reject`) {
        return res.status(404).json({
          info: `Invalid action`,
          message: `Must be 'accept' or 'reject'.`,
        });
      } else if (usID === userId) {
        return res.status(200).json({
          message: `You cannot invite yourself to a wager`,
        });
      } else if (takerTx.taker !== username) {
        return res.status(200).json({
          message: `You don't have access to this wager`,
        });
      } else if (takerTx.status == `accepted` && userUsername === username) {
        return res.status(200).json({
          message: `This wager has already been accepted`,
        });
      } else if (takerTx.status === `rejected` && userUsername === username) {
        return res.status(200).json({
          message: `This wager has already been rejected`,
        });
      } else if (status === `accept` && userUsername === username) {
        takerTx.status = 'accepted';
        old = takerWallet.balance;
        newBalance = takerWallet.balance -= takerTx.stake;
        await takerWallet.save();
        await takerTx.save();
        await userLedger.create({
          userId: usID,
          username: userUsername,
          oldBalance: old,
          newBalance: newBalance,
        });
        oldBalance = comWallet.balance;
        newBal = comWallet.balance += takerTx.stake;
        await comWallet.save();
        await companyLedger.create({
          userId: comWallet.userId,
          username: usname,
          oldBalance: oldBalance,
          newBalance: newBal,
        });
        return res.status(200).json({
          info: `Access Granted`,
          message: `You have successfully accepted this wager`,
        });
      } else if (status === `reject` && userUsername === username) {
        takerTx.status = 'rejected';
        old = wagerWallet.balance;
        newBalance = wagerWallet.balance += takerTx.stake;
        await wagerWallet.save();
        await takerTx.save();
        await userLedger.create({
          userId: userId,
          username: wagerer,
          oldBalance: old,
          newBalance: newBalance,
        });
        return res.status(200).json({
          info: `Access Granted`,
          message: `You have successfully rejected this wager`,
        });
      } else {
        return res
          .status(404)
          .json({ info: `Access Denied`, message: `Invalid action` });
      }
    } else if (!usID) {
      return res.status(404).json({
        info: `Access Denied`,
        message: `You have not been invited to this wager`,
      });
    }

    // function sendMail() {
    //   let mailTransporter = nodemailer.createTransport({
    //     service: `gmail`,
    //     auth: {
    //       user: `${process.env.EMAILFROM}`,
    //       pass: `${process.env.EMAILPASSWORD}`,
    //     },
    //   });
    //   let mailDetails = {
    //     from: `${process.env.EMAILFROM}`,
    //     to: `${process.env.EMAILTO}`,
    //     subject: `Wager Reminder`,
    //     text: `Check your wagers`,
    //   };
    //   mailTransporter.sendMail(mailDetails, function (err, data) {
    //     if (err) {
    //       console.log(`Error Occurs`, err);
    //     } else {
    //       console.log(`Email sent successfully`);
    //     }
    //   });
    // }
    const invitesFoundInDb = await User.find({
      username: { $in: ivs.map((u) => u.toLowerCase()) },
    }).select(`email name username`);
    if (invitesFoundInDb.length === 0) {
      return res.status(404).json({ message: `No user found.` });
    }
    const emailSubject = `${title}`;
    const emailPlainText = (user) =>
      `Hi ${user},\n\nCheck out this wager\n\nBest regards,\n<strong>${userUsername}</strong>`;
    const emailHtmlTemplate = (user) => `
                <p>Hi <strong>${user}</strong>,</p>
                <p><strong>${userUsername}</strong> has created a wager <strong>${title}</strong> and you have been invited to participate in this wager!</p>
                <p>Visit our website to learn more about <strong>${title}:</strong> <a href="http://www.flashscore.com.ng">Click Here</a></p>
                <p>Best regards,</p>
                <p><strong>${userUsername}</strong></p>
            `;
    let emailsSentCount = 0;
    let emailsFailedCount = 0;
    const failedEmailDetails = [];
    const processedUsernames = new Set();
    const emailPromises = invitesFoundInDb.map(async (user) => {
      processedUsernames.add(user.username.toLowerCase());
      if (!user.email) {
        console.warn(`User ${user.username} has no email address. Skipping.`);
        failedEmailDetails.push({
          username: user.username,
          reason: `No email address found for user in DB.`,
        });
        return;
      }
      try {
        const userName = user.name || user.username;
        const htmlContent = emailHtmlTemplate(userName);
        const textContent = emailPlainText(userName);
        await senderEmail(user.email, emailSubject, textContent, htmlContent);
        emailsSentCount++;
      } catch (emailError) {
        console.error(
          `Failed to send email to ${user.email} (SMTP error):`,
          emailError.message
        );
        emailsFailedCount++;
        failedEmailDetails.push({
          username: user.username,
          email: user.email,
          reason: `SMTP error: ${emailError.message}`,
        });
      }
    });
    await Promise.allSettled(emailPromises);
    ivs.forEach((invitedUsername) => {
      if (!processedUsernames.has(invitedUsername.toLowerCase())) {
        emailsFailedCount++;
        failedEmailDetails.push({
          username: invitedUsername,
          reason: 'User not registered in database (no matching email found).',
        });
      }
    });
    res.status(200).json({
      wager,
      successfulTx,
      failedTx,
      message: `Email sending process completed.`,
      totalUsers: ivs.length + userFoundInDb.length,
      usersFoundInDb: userFoundInDb.length + invitesFoundInDb.length,
      usersNotfoundInDb: emailsFailedCount,
      emailsSent: emailsSentCount + sentEmailCount,
      emailsFailed: emailsFailedCount,
      invitesFoundInDb: invitesFoundInDb.length,
      failedEmailDetails: failedEmailDetails,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Grading A Wager
const gradeWager = async (req, res) => {
  try {
    const { id } = req.params;
    const { outcome } = req.body;
    const takerTx = await wagerTransaction.findById(id);
    const wagerId = takerTx.wagerId;
    const wagerTx = await wager.findById(wagerId);
    const totalStake = takerTx.stake + wagerTx.stake;
    const commission = 0.1 * totalStake;
    const userId = takerTx.wagererId;
    const username =
      typeof takerTx.takerId == String
        ? takerTx.taker
        : takerTx.taker.toString();
    const wagererWallet = await userWallet.findOne({ userId });
    const takerWallet = await userWallet.findOne({ username });
    const totalWinning = totalStake - commission;
    const drawSettlement = totalWinning / 2;
    const coWallet = await companyWallet.find({});
    const comWallet = coWallet[0];
    const companyId = comWallet.userId;
    const companyUsername = await User.findById(companyId);
    const usname = companyUsername.username;
    if (!takerTx) {
      return res
        .status(404)
        .json({ message: `Wager Transaction is not found` });
    }
    if (new Date() > takerTx.endDate) {
      if (takerTx.status === `accepted`) {
        if (outcome === `won`) {
          takerTx.outcome = `won`;
          takerTx.status = `settled`;
          await takerTx.save();
          old = wagererWallet.balance;
          newBalance = wagererWallet.balance += totalWinning;
          oldBalance = comWallet.balance;
          newBal = comWallet.balance += commission - totalWinning;
          await wagererWallet.save();
          await comWallet.save();
          await userLedger.create({
            userId: userId,
            username: userUsername,
            oldBalance: old,
            newBalance: newBalance,
          });
          await companyLedger.create({
            userId: companyId,
            username: usname,
            oldBalance: oldBalance,
            newBalance: newBal,
          });
          return res.status(200).json({ message: `Wager is won` });
        } else if (outcome === `draw`) {
          takerTx.outcome = `draw`;
          takerTx.status = `settled`;
          await takerTx.save();
          old = wagererWallet.balance;
          newBalance = wagererWallet.balance += drawSettlement;
          oldBalance = comWallet.balance;
          newBal = comWallet.balance += commission - drawSettlement;
          await comWallet.save();
          await wagererWallet.save();
          takerWallet.balance += drawSettlement;
          await takerWallet.save();
          await userLedger.create({
            userId: userId,
            username: userUsername,
            oldBalance: old,
            newBalance: newBalance,
          });
          await companyLedger.create({
            userId: companyId,
            username: usname,
            oldBalance: oldBalance,
            newBalance: newBal,
          });
          return res.status(200).json({ message: `Wager is a draw` });
        } else if (outcome === `lost`) {
          takerTx.outcome = `lost`;
          takerTx.status = `settled`;
          await takerTx.save();
          oldBalance = comWallet.balance;
          newBal = comWallet.balance += commission - totalWinning;
          await comWallet.save();
          old = takerWallet.balance;
          newBalance = takerWallet.balance += totalWinning;
          await takerWallet.save();
          await userLedger.create({
            userId: userId,
            username: userUsername,
            oldBalance: old,
            newBalance: newBalance,
          });
          await companyLedger.create({
            userId: companyId,
            username: usname,
            oldBalance: oldBalance,
            newBalance: newBal,
          });
          return res.status(200).json({ message: `Wager is lost` });
        }
      } else if (takerTx.status === `rejected`) {
        return res.status(200).json({ message: `This wager was rejected` });
      } else if (takerTx.status === `pending`) {
        return res.status(200).json({ message: `This wager is still pending` });
      } else if (takerTx.status === `settled`) {
        return res
          .status(200)
          .json({ message: `This wager has already been settled` });
      }
    } else {
      return res.status(404).json({ message: `Wager hasn't expired yet` });
    }
    takerTx.outcome = req.body.outcome;
    await takerTx.save();
    res.status(200).json(takerTx);
    // cron.schedule(`* * * * *`, function () {
    //   sendMail();
    // });
    function sendMail() {
      let mailTransporter = nodemailer.createTransport({
        service: `gmail`,
        auth: {
          user: `${process.env.EMAILFROM}`,
          pass: `${process.env.EMAILPASSWORD}`,
        },
      });
      let mailDetails = {
        from: `${process.env.EMAILFROM}`,
        to: `${process.env.EMAILTO}`,
        subject: `Wager Reminder`,
        text: `Check your wagers`,
      };
      mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
          console.log(`Error Occurs`, err);
        } else {
          console.log(`Email sent successfully`);
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update A Wager
const updateWager = async (req, res) => {
  try {
    const { id } = req.params;
    const { stake, invites, description } = req.body;
    const userId = req.user.id;
    const wager = await Wager.findById(id);
    const wagerId =
      typeof wager._id == String ? wager._id : wager._id.toString();
    const wagerTx = await wagerTransaction.find({ wagerId });
    if (!wager) {
      return res.status(404).json({ message: `Wager not found` });
    }
    if (userId != wager.wagererId) {
      return res
        .status(404)
        .json({ message: `You don't have access to this wager` });
    }
    if (new Date() < wager.endDate) {
      if (wager.status == `pending`) {
        wager.invites = invites;
        wager.stake = stake;
        await wager.save();
        wagerTx.invites = invites;
        wagerTx.stake = stake;
        await wagerTx.save();
        return res.status(200).json({ message: `Stake updated by ${stake}` });
      }
    } else {
      res.status(200).json({ message: `wager has expired` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getWagers,
  getWager,
  createWager,
  confirmWager,
  gradeWager,
  getWagerTransaction,
  getWagerTxs,
  getWagersByUser,
  getWagerByUser,
  updateWager,
};
