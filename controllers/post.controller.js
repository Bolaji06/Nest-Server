//get posts

import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { marked } from "marked";
import sanitize from 'sanitize-html';

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function getPosts(req, res) {
  const query = req.query;
  try {
    const post = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        price: {
          gte: parseInt(query.min_price) || 0,
          lte: parseInt(query.max_price) || 100000000,
        },
      },
    });
    res.status(200).json({ success: true, message: post });
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
export async function getPost(req, res) {
  const id = req.params.id;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: id,
      },
      include: {
        postDetails: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      // if user has a token indicate that the post is saved or not

      jwt.verify(token, process.env.TOKEN_SECRET, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          return res
            .status(200)
            .json({ ...post, isSaved: saved ? true : false });
        }
      });
    } else {
      return res.status(200).json({ success: true, message: post });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "internal server error" });
  }
}
//add post
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function addPost(req, res) {
  const body = req.body;
  const postDetails = req.body.others;
  const tokenId = req.user.id;

  const postDescription = postDetails?.description[0];

  const html = marked.parse(postDescription);
  const sanitizeHtml = sanitize(html);

  try {
   const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenId,
        postDetails: {
          create: {
            description: html ? sanitizeHtml : postDescription
          }
        },
      },
    });
    res.status(201).json({ success: true, newPost });
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
export async function updatePost(req, res) {
  const id = req.params.id;
  const tokenId = req.user.id;
  const data = req.body;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: id,
      },
    });

    if (post.userId !== tokenId) {
      return res
        .status(401)
        .json({ success: false, message: "can't update this post" });
    }
    await prisma.post.update({
      where: {
        id: id,
      },
      data: {
        ...data,
        userId: tokenId,
      },
    });
    res.status(200).json({ success: true, message: "post updated" });
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
export async function deletePost(req, res) {
  const id = req.params.id;
  const tokenId = req.user.id;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: id,
      },
    });

    if (post.userId !== tokenId) {
      return res
        .status(401)
        .json({ success: false, message: "you can't delete this post" });
    }

    await prisma.post.delete({
      where: {
        id: id,
      },
    });
    res
      .status(200)
      .json({ success: true, message: "post deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "internal server error" });
  }
}
//delete post
