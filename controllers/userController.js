const User = require("../models/user");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");


//Signup
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, password, email } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exist" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create a new user
    user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await user.save();
    const token =  generateToken({_id:user._id})
    return res.status(200).json({ ...user._doc, password: undefined,token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


//Login
exports.login = async (req, res) => {
    try {
        const {email,password} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"User not found"})
        }
        const isMatch = bcrypt.compareSync(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:"Invalid password or email"})
        }
        const token =  generateToken({_id:user._id})
        return res.status(200).json({...user._doc,password:undefined,token})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}




//delete user 
exports.deleteUser = async (req, res) => {
    try {
   
    const {id} = req.params
    if(id!==req.user.id){
        return res.status(400).json({message:"unauthorized"});
    }
    const user = await User.findByIdAndDelete({_id:id})
    if(!user){
        return res.status(400).json({message:"User not found"})
    }
        await User.deleteOne({_id:id})
        res.send({message:"User deleted successfully"});
      
      
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}



//update user => update
exports.updateUser = async (req,res)=>{
    try {
        const {id} = req.params
        if(id!==req.user.id){
            return res.status(400).json({message:"unauthorized"});
        }
        const user = await User.findByIdAndUpdate(id,req.body,{new:true})
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}

// TODO: reset password
// TODO: Forget Password
// TODO : OTP verification