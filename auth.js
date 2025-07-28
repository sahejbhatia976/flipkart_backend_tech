const mongoose = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrptjs = require("bcryptjs");
const router  = express.router();

const User = mongoose.model('User',new mongoose.Schema({email:String,password:String}));

//signup router
router.post("/auth/signup",async(req,res)=>{
    const {email,password} = req.body;
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({error:'User already exist'});
    }
    const hashedPassword = await bcrypt.hash([password]);
    const user = new User({email,password:hashedPassword});
    await user.save();
    const token = jwt.sign({userID:user._id},'secret',{expiresIn:'1h'});
    res.status(200).json({token});
});

//login router
router.post("auth/login",async(req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(user && await bcrypt.compare(password,user,password));{
        const token = jwt.sign({userID:user._id},'secret',{expiresIn:'1h'});
    } else{
        res.status(400).json({error:"Invalid credentials"});
    }
});

//jwt middleware

function authenticateJWT(req,res,next){
    const authHeader = req.headers.authorization;
    if(authHeader){
        const token = authHeader.split('')[1];
        jwt.verify(token,'secret',(err,user)=>{
            if(err){
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        })
    } else{
        res.sendStatus(401);
    }
}

module.export = {router,authenticateJWT};