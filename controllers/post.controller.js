import prisma from "../lib/prisma.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function getPosts(req, res) {
  try {
    const posts = await prisma.post.findMany();
    res.status(200).json({ success: true, message: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: "internal server error" });
  }
}

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function getPost(req, res) {
    // we get particular post using the postId
  const id = req.params.id;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: id,
      },
    });
    res.status(200).json({ success: true, message: post });
  } catch (err) {
    res.status(500).json({ success: false, message: "internal server error" });
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function addPost(req, res) {
  const body = req.body;
  const userToken = req.user.id; // signed tokenId

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body,
        userId: userToken, // we reference a user post through a signed tokenId
      },
    });
    res.status(200).json({ success: true, message: newPost });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "internal server error" });
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function deletePost(req, res) {
  const id = req.params.id; // postId
  const userId = req.user.id;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: id,
      },
    });

    if (post.userId !== userId) {
      return res
        .status(400)
        .json({ success: false, message: "you can't delete this post" });
    }

    await prisma.post.delete({
      where: {
        id: id,
      },
    });
    res.status(200).json({ success: true, message: "post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "internal server error" });
  }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function updatePost(req, res) {
  const id = req.params.id;
  const body = req.body;
  const tokenId = req.user.id;

  try {
    const updatedPost = await prisma.post.update({
      where: {
        id: id,
      },
      data: {
        ...body,
        userId: tokenId,
      },
    });
    res.status(200).json({ success: true, message: updatedPost });
  } catch (err) {
    res.status(500).json({ success: false, message: "internal server error" });
  }
}
