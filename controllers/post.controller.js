//get posts

import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { marked } from "marked";
import sanitize from "sanitize-html";

import { Type, Property } from "@prisma/client";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {Object} req.query
 */
export async function getPosts(req, res) {
  const query = req.query;

  try {
    if (query.title) {
      console.log(query.title);

      const searchPost = await prisma.post.findMany({
        where: {
          title: {
            contains: query.title,
            mode: "insensitive",
          },
        },
      });
      return res.status(200).json({ success: true, message: searchPost });
    }

    const post = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        title: query.title || undefined,
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
export async function getUserPost(req, res) {
  const tokenId = req.user.id;
  const param = req.params.userId;

  console.log(tokenId)

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: tokenId,
      },
    });
    if (user.id !== param) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    const userPosts = await prisma.post.findMany({
      where: {
        userId: user.id,
      },
    });
    return res.status(200).json({ success: true, userPosts });
  } catch (error) {
    if (error instanceof error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "internal server error" });
    }
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
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    const amenities = await prisma.amenities.findUnique({
      where: {
        postId: post.id,
      },
      include: {
        roomDetails: {
          select: {
            appliances: true,
            basement: true,
            floorCovering: true,
            indoorFeatures: true,
            rooms: true,
          },
        },
        utilitiesDetails: {
          select: {
            coolingType: true,
            heatingFuel: true,
            heatingType: true,
          },
        },
        buildingDetails: {
          select: {
            architecturalStyle: true,
            buildingAmenities: true,
            exterior: true,
            numFloor: true,
            numUnit: true,
            outdoorAmenities: true,
            parking: true,
            parkingSpace: true,
            roof: true,
            view: true,
          },
        },
      },
    });

    //const savedPost = await prisma.savedPost.findMany({});

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
          return res.status(200).json({
            success: true,
            message: { post, amenities, isSaved: saved ? true : false },
          });
        }
      });
    } else {
      return res
        .status(200)
        .json({ success: true, message: { post, amenities } });
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
  const tokenId = req.user.id;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body,
        userId: tokenId,
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
export async function getAmenities(req, res) {
  const { id } = req.params;
  try {
    const amenities = await prisma.amenities.findUnique({
      where: {
        id: id,
      },
      include: {
        buildingDetails: true,
        roomDetails: true,
        utilitiesDetails: true,
      },
    });
    return res.status(200).json({ success: true, message: amenities });
  } catch (error) {
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

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function deleteAllPost(req, res) {
  try {
    const post = await prisma.post.deleteMany();
    res.status(200).json({ message: true, post });
  } catch (err) {
    console.log(err);
  }
}
