import dotenv from 'dotenv'
dotenv.config();

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const Protect = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token provided" });

//   console.log(header);

  const token = header.split(" ")[1];
  try {
    const decode = jwt.verify(token, JWT_SECRET);
    // console.log(decode);
    req.userId = decode.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Expired or Invalid tok" });
  }
};
