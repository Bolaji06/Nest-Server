import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

import { sendWelcomeEmail } from "../utils/welcomeEmail.js";

import {
  emailVerificationToken,
  passwordResetVerification,
} from "../utils/generateToken.js";
import ms from "ms";
import { sendEmail } from "../utils/sendEmail.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 *
 */
export async function register(req, res) {
  const { email, username, password } = req.body;

  // validate user inputs
  if (!email || !username || !password) {
    return res.status(400).json({
      success: false,
      message: "email, username and password field is required",
    });
  }
  const emailToken = emailVerificationToken();
  const saltRounds = 10;
  try {
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // check if user with email and username already exits
    const isUser = await prisma.user.findMany({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    // if exits: do not create user
    if (isUser.length) {
      return res.status(400).json({
        success: false,
        message: "user with email or username already exits",
      });
    }

    // if not exits: create new user
    const newUser = await prisma.user.create({
      // save new user with email, username and hashed password into the database
      data: {
        email: email,
        username: username,
        password: hashPassword,
        createdAt: new Date(Date.now()),
        emailToken: emailToken,
      },
    });

    const subject = "Welcome to Nest";
    const html = sendWelcomeEmail(emailToken);
    const sender = process.env.HOST_EMAIL
    await sendEmail(email, subject, html, sender);

    if (newUser) {
      await sendEmail(email, subject, html, sender);
      res.status(201).json({ success: true, message: "verify your email" });
    } else {
      res.json(400).json({ success: false, message: "fail to create user" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "internal server error" });
  }
}

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user with email not found " });
    }
    const {
      password: userPassword,
      emailToken,
      passwordResetToken,
      passwordExpiry,
      ...userDetails
    } = user;
    const dbPassword = user.password;
    const comparePassword = await bcrypt.compare(password, dbPassword);

    const jwtToken = jwt.sign(userDetails, process.env.TOKEN_SECRET);

    if (user.emailToken) {
      return res
        .status(401)
        .json({ success: false, message: "your email has not been verified" });
    }

    if (user.email && comparePassword) {
      return res
        .cookie("token", jwtToken, {
          maxAge: ms("1d"),
          signed: true,
          httpOnly: true,
          //secure: true // enable this in prod
        })
        .status(200)
        .json({ success: true, jwtToken, message: "login successful" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "invalid password" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "internal server error" });
  }
}

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export function logout(req, res) {
  // delete session cookies
  res
    .clearCookie("token")
    .status(200)
    .json({ success: true, message: "logout successful" });
}

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function verifyEmail(req, res) {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ success: false, message: "token is unavailable" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        emailToken: token,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "token not valid" });
    }
    if (user.emailToken) {
      await prisma.user.update({
        where: { id: user.id }, // hmm...
        data: {
          emailToken: null,
        },
      });
      res
        .status(200)
        .json({ success: true, message: "email verification successful" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
}

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function forgotPassword(req, res) {
  const { email } = req.body;
  const { token, expiry } = passwordResetVerification();

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user with the email not found" });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordExpiry: expiry, passwordResetToken: token },
    });
    const sender = process.env.HOST_EMAIL
    const subject = "Password Reset";
    const message =
      "You're receiving this email because your password is about to be reset";
    const html = `<h2>${message}</h2>
    <a href="https://localhost:3000/?reset=${token}&expiry=${expiry}">
          <button>Verify Email</button>
        </a>`;
    await sendEmail(email, subject, html, sender);
    res.status(200).json({ success: true, message: "email sent" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
}

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function resetPassword(req, res) {
  const { password, token } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
      },
    });

    if (token !== user.passwordResetToken) {
      return res.status(400).json({ success: false, message: "invalid token" });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    const currentDate = new Date(Date.now());
    if (user.passwordExpiry < currentDate) {
      return res
        .status(400)
        .json({ success: false, message: "token has expires" });
    }

    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashPassword,
        passwordResetToken: null,
        passwordExpiry: null,
      },
    });
    return res
      .status(200)
      .json({ success: true, message: "password reset successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
}
