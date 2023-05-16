import express from 'express';
import path from 'path';
const app = express();
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import  jwt  from 'jsonwebtoken';
import bcrypt from 'bcrypt'; 

mongoose.connect("mongodb://localhost:27017" , {
    dbName: "backend"
}).then(()=>console.log("Database Connected")).catch((e)=>console.log(e));

const userSchema = new mongoose.Schema({
    name: String,
    email:String,
    password:String,
})

const User = mongoose.model("User" , userSchema);


// MiddleWare
app.use(express.static(path.join(path.resolve() , "public")));
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());

app.set("view engine" , "ejs")

const isAuthenticated = async (req,res,next)=>{
    const {token} = req.cookies;
    if(token){
        const decoded =  jwt.verify(token , "abcd");
     req.user = await User.findById(decoded._id);
    
      next();
    }
    else{
        res.redirect("/login");
    }
};



app.get("/" , isAuthenticated , (req,res)=>{
//    const pathlocation = path.resolve();
//    res.sendFile(path.join(pathlocation , "./index.html"));
res.render("logout" , {name:req.user.name});

})

app.get("/login", (req, res) => {
    res.render("login");
  });

app.get("/register" ,  (req,res)=>{
    res.render("register");
});

app.post("/login" , async (req,res)=>{
    const {email,password} = req.body;
    let user = await User.findOne({email});
    if(!user){
        return res.redirect("/register");
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.render("login" , { email , message : "Incorrect Password"});
    }

    const token = jwt.sign({_id:user._id} , "abcd");

    res.cookie("token",token , {
        httpOnly:true,
        expires:new Date(Date.now() + 60*1000)
    });
    res.redirect("/");

});

app.post("/register" , async (req,res)=>{
    const {name , email ,password} = req.body;
 let user = await User.findOne({email});
 if(user){
   return res.redirect("/login");
 }

 const hashedPassword = await bcrypt.hash(password,10);
     user = await User.create({
        name,
        email,
        password:hashedPassword,
});

    const token = jwt.sign({_id:user._id} , "abcd");

    res.cookie("token",token , {
        httpOnly:true,
        expires:new Date(Date.now() + 60*1000)
    });
    res.redirect("/");
});

app.get("/logout" , (req,res)=>{
    res.cookie("token" , null , {
        httpOnly:true,
        expires:new Date(Date.now())

    });
    res.redirect("/");
});






    



app.listen(5000 , () =>{
    console.log("Server is Working");
})  



// const http = require("http");
// import http from "http";
// import fs from "fs";
// import gfName from "./features.js";

// const data = fs.readFileSync("./index.html");

// console.log(gfName);
// const server = http.createServer((req,res) =>{

//     console.log(req.method)
//     if(req.url == "/about"){
//         res.end("<h1>About Page</h1>")
//     }

//     else if(req.url == "/"){
        
//             res.end(data);
   
        
//     }

//     else if(req.url == "/contact"){
//         res.end("<h1>Contact Page</h1>")
//     }
//     else{
//         res.end("<h1>Page Not Found</h1>")
//     }
    
// });

// server.listen(5000,()=>{
//     console.log("server is working");
// });