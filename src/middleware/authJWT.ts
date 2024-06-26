import jwt from "jsonwebtoken";
import prisma from "../prismaClient";
import { Request, Response, NextFunction } from "express-serve-static-core";

interface TokenInterface {
  uid: string;
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearerHeader = req.headers["authorization"] as string;
  const token = bearerHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: "No token provided",
    });
  }
  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: "Unauthorized!",
      });
    }
    req.body.uid = (decoded as TokenInterface).uid;
    next();
  });
};


export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await prisma.user.findUnique({
    where: {
      uid: req.body.uid,
    },
  });
  if (user?.role === "ADMIN") {
    next();
  } else {
    res.status(403).send({
      message: "Require Admin Role!",
    });
  }
};

export const isModeratorOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await prisma.user.findUnique({
    where: {
      uid: req.body.uid,
    },
  });
  if (user?.role === "ADMIN" || user?.role === "MOD") {
    next();
  } else {
    res.status(403).send({
      message: "Require at least Moderator Role!",
    });
  }
};
