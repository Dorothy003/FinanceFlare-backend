//for protect route
import jwt from "jsonwebtoken";
import User from "../models/Users.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(401).json({ message: "Invalid user" });

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

export default protect;