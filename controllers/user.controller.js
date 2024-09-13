import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function getUsers(req, res) {
  try {
    const user = await prisma.user.findMany();
    res.json(user);
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
export async function getUser(req, res) {
  const { id } = req.params;
  const tokenId = req.user.id;

  if (id !== tokenId) {
    return res.sendStatus(403);
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    return res.status(200).json(user);
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
export async function findUser(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: "bad request" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return res.status(200).json({ success: true, result: user });
  } catch (error) {
    console.log(error);
  }
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
export async function updateUser(req, res) {
  const { id } = req.params;
  const {
    username,
    firstName,
    lastName,
    about,
    avatar,
    password,
    location,
    phone,
    userType,
  } = req.body;
  const tokenId = req.user.id;
  let hashPassword = "";

  if (id !== tokenId) {
    return res.sendStatus(403);
  }

  try {
    if (password) {
      hashPassword = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        username: username,
        firstName: firstName,
        lastName: lastName,
        avatar: avatar,
        password: hashPassword ? hashPassword : user.password,
        phone: phone,
        location: location,
        about: about,
        userType: userType,
      },
    });
    return res.status(200).json({ success: true, message: "profile updated" });
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
export async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: {
        id: id,
      },
    });
    return res
      .status(200)
      .json({ success: true, message: "delete successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: "internal server error" });
    console.log(err);
  }
}

// saved Post

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function savedPost(req, res) {
  const postId = req.body.postId;
  const tokenId = req.user.id;

  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenId,
          postId: postId,
        },
      },
    });

    if (!savedPost) {
      await prisma.savedPost.create({
        data: {
          userId: tokenId,
          postId: postId,
        },
      });
      return res.status(200).json({ success: true, message: "post saved" });
    }

    await prisma.savedPost.delete({
      where: {
        id: savedPost.id,
      },
    });
    return res.status(200).json({ success: true, message: "post removed" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
}
