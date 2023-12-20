const jwt = require('jsonwebtoken');
exports.generateToken = (data)=>{
    const token = jwt.sign(data,process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRE_TIME
    })
    return token
}