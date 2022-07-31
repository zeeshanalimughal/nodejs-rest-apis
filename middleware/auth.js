const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
if(authHeader){
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
    console.log(decoded)
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
}
return res.status(403).send("A token is required for authentication");

};

module.exports = verifyToken;