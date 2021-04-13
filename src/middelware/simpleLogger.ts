import {NextFunction, Request, Response} from "express";



const simpleLogger = (req: Request,res: Response,next:NextFunction) => {
    console.log(new Date().toLocaleDateString(), req.method, req.originalUrl, req.connection.remoteAddress)
    next()
  }

export default simpleLogger;