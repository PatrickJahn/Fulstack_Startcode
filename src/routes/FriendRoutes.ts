import {Router} from "express";
import facade from "../facade/dummy-facade";
import apiError from "../errors/apiError";
import authMiddleware from "../middelware/basic-auth";

const router = Router();

router.use(authMiddleware);



router.get("/all", async (req, res) => {
    let friends = await facade.getAllFriends()
    const friendsDTO = friends.map((friend) => {
        const {id, firstName, lastName, email} = friend
        return {id: id, firstName: firstName, lastName: lastName, email:email}
    })
      res.json(friendsDTO);
    
   
  })
  
  router.get("/findby-email/:email", async (req, res, next) => {
    try {
       let friend = await facade.getFrind(req.params.email)

       if (friend == null){
         throw new apiError("No friends found", 404)
        }

        const freindDTO = {firstname: friend.firstName, lastname: friend.lastName, email:friend.email}
         res.send(freindDTO)
  
    } catch(err){
      next(err)
   }
  })


  router.get("/me", async (req:any, res, next) => {
    try {
      const username = req.credentials.userName
       let friend = await facade.getFrind(username)

       if (friend == null){
         throw new apiError("No friends found", 404)
        }

        const freindDTO = {firstname: friend.firstName, lastname: friend.lastName, email:friend.email}
         res.send(freindDTO)
  
    } catch(err){
      next(err)
   }
  })


  export default router;