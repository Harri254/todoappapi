import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Todo,User,loginSchema,todoSchema,registerSchema } from "./schema.js";
import { validate } from './validateMiddleware.js';
import { Protect } from "./authMiddleware.js";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
.then(()=> console.log("Database connected successfully"))
.catch((err) => console.log("Connection error", err));

app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

app.post("/register",validate(registerSchema),async(req,res)=>{
    const {email,password} = req.body;
    const existing = await User.findOne({email});
    if(existing) return res.status(400).json({error : "Email already in use"});

    const hashed = await bcrypt.hash(password,10);

    const user = User.create({email,password : hashed});

    res.status(201).json({message : "Account Created👌"});
})

app.post("/login",validate(loginSchema), async (req,res)=>{
    const {email,password} = req.body;
    // console.log(email,password);
    const user = await User.findOne({email});
    if(!user) return res.status(404).json({message : "Invalid user credentials"});

    const match = await bcrypt.compare(password, user.password);
    if(!match) return res.status(404).json({message  :"Invalid user credentials"});

    const token  = jwt.sign({userId : user._id}, JWT_SECRET, {expiresIn: '2d'});

    res.json({token});
})

app.get("/todo", Protect, async(req,res)=>{
    const todo = await Todo.find();
    res.json(todo)
})

app.get("/todo/:id", Protect , async(req,res)=>{
    const todo = await Todo.findById(req.params.id);
    if(!todo) return res.status(404).json({message : "Todo Not Found"});
    res.json(todo);
})

app.post("/todo",Protect,validate(todoSchema), async (req,res)=>{
    const todo = new Todo({title : req.body.title});
    await todo.save();
    res.status(201).json(todo);
})

app.put("/todo/:id",Protect,validate(todoSchema), async (req,res)=>{
    const todo = await Todo.findByIdAndUpdate(
        req.params.id,
        req.body,
        {returnDocument: 'after'}
    )
    if(!todo) return res.status(404).json({message : "Todo Not Found"});
    res.json(todo);
})

app.delete("/todo/:id", Protect, async (req,res)=>{
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if(!todo) return res.status(404).json({message : "Todo Not Found"});
    res.json({message : "Todo Deleted successfully"});
})

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(500).json({ error: err.message })
})

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});
