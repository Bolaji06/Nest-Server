import prisma from "../lib/prisma.js";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */

// auth user should have all it saved post via token id
export async function getAllSavedPost(req, res) {
  const token = req.user.id;

  if (!token) {
    return res.status(401).json({ success: false, message: "unauthorize" });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: token,
    },
  });

  try {
    const savedPosts = await prisma.savedPost.findMany({
      where: {
        userId: token,
      },
    });
    return res.status(201).json({ success: true, message: savedPosts });
  } catch (error) {
    console.log(error);
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

// this post is considered a saved post via the post id
export async function getSavedPost(req, res) {
  const token = req.user.id;
  const id = req.params.id;

  try {
    if (!token) {
      return res.status(503).json({ success: false, message: "forbidden" });
    }
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: token,
          postId: id,
        },
      },
    });
    return res.status(200).json({ success: true, message: savedPost });
  } catch (error) {
    console.log(error);
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

// add new post via postId and tokenId
export async function addSavedPost(req, res) {
  const { postId } = req.body;
  const token = req.user.id;

  if (!token) {
    return res.status(401).json({ success: false, message: "unauthorize" });
  }

  const isPostSaved = await prisma.savedPost.findUnique({
    where: {
      userId_postId: {
        postId: postId,
        userId: token,
      },
    },
  });
  if (isPostSaved) {
    return res
      .status(400)
      .json({ success: false, message: "post is already saved" });
  }

  try {
    await prisma.savedPost.create({
      data: {
        userId: token,
        postId: postId,
      },
    });

    res.status(201).json({ success: true, message: "post saved success" });
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
export async function removeSavedPost(req, res) {
  const { postId } = req.body;
  const tokenId = req.user.id;

  try {
    if (!tokenId) {
      return res.status(401).json({ success: false, message: "unauthorize" });
    }
    if (!postId) {
      return res.status(400).json({ success: false, message: "bad request" });
    }

    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          postId: postId,
          userId: tokenId,
        },
      },
    });

    if (!savedPost) {
      return res
        .status(404)
        .json({ success: false, message: "post not found" });
    }

    await prisma.savedPost.delete({
      where: {
        id: savedPost.id,
      },
    });
    return res
      .status(200)
      .json({ success: true, message: "post removed successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
}
