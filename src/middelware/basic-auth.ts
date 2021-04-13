import auth from 'basic-auth'
import compare from 'tsscmp'

import { Request, Response } from "express"
import friendFacade from "../facade/friendFacade"

let facade: friendFacade

const authMiddleware = async function (req: Request, res: Response, next: Function) {

  if (!facade){
    facade = new friendFacade(req.app.get("db"))
  }

    var credentials = auth(req)

    if (credentials && await check(credentials.name, credentials.pass, req)) {
      
        next()
      } else {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="example"')
        res.end('Access denied')
      }
}

async function check (username: string, pass:string, req: any) {
    
  const verifiedUser = await facade.getVerifiedUser(username, pass)
 
    if (verifiedUser){
            req.credentials = {userName: verifiedUser.email, role: verifiedUser.role}
        return true
    }
    return false 
    // Simple method to prevent short-circut and use timing-safe compare
 
  }

export default authMiddleware;


