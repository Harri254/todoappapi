import {Router} from 'express'
import { Protect } from "../authMiddleware.js";
import { sendError, sendSuccess } from "../helper.js";
import { Todo, todoSchema } from "../schema.js";
import { validate } from "../validateMiddleware.js";

const route = Router();

route.get("/todo", Protect, async(req,res)=>{
    const todo = await Todo.find();
    sendSuccess(res,todo)
})

route.get('/todo', Protect, async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  const todo = await Todo.find({ userId: req.userId })
    .skip(skip)
    .limit(limit)

  const total = await Todo.countDocuments({ userId: req.userId })

  sendSuccess(res, {
    todo,
    page,
    totalPages: Math.ceil(total / limit),
    total
  })
})

route.get("/todo/:id", Protect , async(req,res)=>{
    const todo = await Todo.findById(req.params.id);
    if(!todo) return sendError(res,"Todo Not Found", 404);
    sendSuccess(res,todo);
})

route.post("/todo",Protect,validate(todoSchema), async (req,res)=>{
    const todo = new Todo({title : req.body.title});
    await todo.save();
    sendSuccess(res,todo, 201);
})

route.put("/todo/:id",Protect,validate(todoSchema), async (req,res)=>{
    const todo = await Todo.findByIdAndUpdate(
        req.params.id,
        req.body,
        {returnDocument: 'after'}
    )
    if(!todo) return sendError(res,"Todo Not Found", 404);
    sendSuccess(res,todo);
})

route.delete("/todo/:id", Protect, async (req,res)=>{
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if(!todo) return sendError(res,"Todo Not Found", 404);
    sendSuccess(res,{message : "Todo Deleted successfully"});
})

export default route;