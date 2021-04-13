import express, {Request, Response} from "express";
import dotenv from "dotenv";
import path from "path"
import friendsRoute from "./routes/FriendRoutesAuth";
import ApiError from "./errors/apiError";
import logger from "./middelware/winstonLogger";
const debug  = require("debug")("app")
const cors = require("cors")

dotenv.config()
const app = express()

 
//app.use(simpleLogger)
app.set("logger", logger)
app.use(cors())
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.json());

app.use((req,res, next) => {
  debug(new Date().toLocaleDateString(), req.originalUrl, req.method, req.ip)
  next()
})

app.use("/api/friends", friendsRoute)


app.get("/demo", (req, res) => {
  res.send("Server is up");
})

 
app.use("/api",(req,res,next) => {

  res.status(404).send({errorCode:404, msg:"Page not found"})
})

app.use("/api",(err:any,req:Request,res:Response,next:Function) => {
  if (err instanceof (ApiError)){
    logger.error(err.message )
    res.status(err.errorCode!).send({errorCode:err.errorCode, msg:err.message})
  } else {
    next(err)
  }
})

export default app;
