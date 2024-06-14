import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from 'jsonwebtoken';
import { emailVerificationToken, passwordResetVerification } from "../utils/generateToken.js";
import ms from 'ms'
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
    
    
    const subject = 'Email Verification';
    const message = 'Kindly verify your email by clicking the button below';
    const html = `<a href="https://localhost:7000/verify-email?token=${emailToken}">
          <button>Verify Email</button>
        </a>`;
    const title = ''


    if (newUser) {
      sendEmail({ email, subject, message, html, title })
      res.status(201).json({ success: true, message: "verify your email" });
    } else {
      res.json(400).json({ success: false, message: "fail to create user" });
    }
  } catch (err) {
    if (err){
      res.status(500).json({ success: false, message: 'internal server error' }) 
    }
  }
}

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function login(req, res) {
    const { email, password } = req.body;

    try{
        const user = await prisma.user.findUnique({
            where: {
                email: email 
            }
        })
        const dbPassword = user.password;
        const comparePassword = await bcrypt.compare(password, dbPassword);

        const emailPayLoad = user.email
        const usernamePayload = user.username
        const jwtToken = jwt.sign({ emailPayLoad, usernamePayload }, process.env.TOKEN_SECRET, { algorithm: "HS256" });

        if (user.emailToken){
          return res.status(400).json({ success: false, message: 'your email has not been verified' })
        }

        if (user.email && comparePassword){
           // res.status(200).json({ success: true, token: jwtToken, message: 'login successful' })
           res.cookie("token", jwtToken, {
            maxAge: ms('1d'),
            signed: true,
            httpOnly: true,
            //secure: true
           }).status(200).json({ success: true, message: 'login successful' });
        }else {
          return res.status(400).json({ success: false, message: 'invalid email or password' })
        }
    }catch(err){
      if (err){
        res.status(500).json({ success: false, message: 'internal server error' }) 
      }
    }
}

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export function logout(req, res) {
  // delete session cookies
  res.clearCookie('token').status(200).json({ success: true, message: 'logout successful' });
  // route user to login
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function verifyEmail(req, res){
  const { token } = req.params;
  try{
    const user = await prisma.user.findUnique({
      where: {
        emailToken: token
      }
    })
    if (user.emailToken){
      await prisma.user.update({
        where: { id: user.id  }, // hmm...
        data: {
          emailToken: null
        }
      })
      res.status(200).json({success: true, message: 'email verification successful' })
    }

  }catch(err){
    if (err){
      res.status(500).json({ success: false, message: 'internal server error' }) 
    }
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function forgotPassword(req, res){
  const { email } = req.body
  const { token, expiry } = passwordResetVerification()
  try{
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });
    if (!user){
      return res.status(404).json({ success: false, message: 'user with the email not found' });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordExpiry: expiry }
    })
    const subject = 'Password Reset';
    const title = 'Password Reset';
    const html = `<a href="https://localhost:7000/verify-email?token=${token}&expiry=${expiry}">
          <button>Verify Email</button>
        </a>`;
    sendEmail({ email, subject, message, html, title })
    res.status(200).json({ success: true, message: 'email sent' });
    
  }catch(err){
    if (err){
      res.status(500).json({ success: false, message: 'internal server error' }) 
    }
   
  }
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
export async function resetPassword(req, res){
  const { password, resetToken } = req.body;

  try{
    const user = await prisma.user.findUnique({
      where: {
        passwordResetToken: resetToken
      }
    });
    
    if(!user){
     return res.status(404).json({ success: false, message: 'user not found' });
    }

    const currentDate = new Date(Date.now())
    if(user.passwordExpiry < currentDate){
      return res.status(400).json({ success: false, message: 'token has expires' });
    }

    const saltRounds = 10
    const hashPassword = await bcrypt.hash(password, saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: {
         password: hashPassword,
         passwordResetToken: null,
         passwordExpiry: null,
      }
    });
    return res.status(200).json({ success: true, message: 'password reset successfully' });
  }catch(err){
    if (err){
      return res.status(500).json({ success: false, message: 'internal server error' });
    }
  }
}
