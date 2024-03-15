import jwt from "jsonwebtoken";
import { User } from "../../DB/models/user.js";
import { Token } from "../../DB/models/token.js";

export let authMiddleWare = async (req, res, next) => {
  let { token } = req.headers;

  if (!token) return next(new Error("token is missing!!", { cause: 400 }));

  if (!token.startsWith(process.env.BEARER_KEY))
    return next(new Error("invalid Token", { cause: 401 }));

  token = token.split(process.env.BEARER_KEY)[1];

  const tokenValid = await Token.findOne({
    token,
    isValid: true,
  });
  console.log(tokenValid);

  if (!tokenValid) return next(new Error("Token expired!", { cause: 401 }));

  let payLoad = jwt.verify(token, process.env.TOKEN_SECRET);

  let user = await User.findOne({ email: payLoad.email });

  if (!user || user.isDeleted == true)
    return next(new Error("user does not exists!!", { cause: 404 }));

  req.user = user;

  return next();
};
