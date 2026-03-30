import dotenv from 'dotenv'
dotenv.config()
import {Router} from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../schema.js'
import { validate } from '../validateMiddleware.js'
import { registerSchema, loginSchema } from '../schema.js'
import { sendSuccess, sendError } from '../helper.js'

const JWT_SECRET = process.env.JWT_SECRET;

const route = Router();

route.post("/register",validate(registerSchema),async(req,res)=>{
    const {email,password} = req.body;
    const existing = await User.findOne({email});
    if(existing) return sendError(res,"Email already in use",400);

    const hashed = await bcrypt.hash(password,10);

    const user = User.create({email,password : hashed});

    sendSuccess(res,{message : "Account Created👌"},200);
})

route.post("/login",validate(loginSchema), async (req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user) return sendError(res,"Invalid user credentials",404);

    const match = await bcrypt.compare(password, user.password);
    if(!match) return sendError(res,"Invalid user credentials",404);

    const token  = jwt.sign({userId : user._id}, JWT_SECRET, {expiresIn: '2d'});

    sendSuccess(res,{token});
})

export default route