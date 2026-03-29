import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique : true
    },
    password : {
        type : String,
        required : true
    }
})

export const User = mongoose.model("User", userSchema);

const todoScheme = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    done : { 
        type : Boolean,
        default : false
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

export const Todo = mongoose.model("Todo",todoScheme);

import Joi from 'joi'

// register and login validation
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

// todo validation
export const todoSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  done: Joi.boolean()
})