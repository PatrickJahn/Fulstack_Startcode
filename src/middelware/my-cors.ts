import { Request, Response } from "express";

// We dont use this, just an example how to make own cors. We now use cors importet. 


const myCors = ((req:Request, res:Response, next:Function) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
  })

export default myCors;