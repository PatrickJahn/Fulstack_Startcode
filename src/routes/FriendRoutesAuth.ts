import { Router } from "express"
const router = Router();
import ApiError from "../errors/apiError"
import FriendFacade from "../facade/friendFacade"
import dotenv from "dotenv";
import logger from "../middelware/winstonLogger"
dotenv.config()
const debug = require("debug")("friend-routes")

let facade: FriendFacade;



// Initialize facade using the database set on the application object
router.use(async (req, res, next) => {
  if (!facade) {
    const db = req.app.get("db")
    debug("Database used: " + req.app.get("db-type"))
    facade = new FriendFacade(db)
  }
  next()
})

// This does NOT require authentication in order to let new users create themself
router.post('/', async function (req, res, next) {
  try {
    let newFriend = req.body;
    
    const status = await facade.addFriend(newFriend)
    logger.info("New friends was added", newFriend, new Date().toLocaleDateString())
    res.json({ status })
  } catch (err) {
    debug(err)
    if (err instanceof ApiError) {
      next(err)
    } else {
      next(new ApiError(err.message, 400));
    }
  }
})

// ALL ENDPOINTS BELOW REQUIRES AUTHENTICATION

import authMiddleware from "../middelware/basic-auth"
const USE_AUTHENTICATION = !process.env.SKIP_AUTHENTICATION;

if (USE_AUTHENTICATION) {
  router.use(authMiddleware);
}

router.get("/all", async (req: any, res) => {
  const friends = await facade.getAllFriends();

  const friendsDTO = friends.map(friend => {
    const { firstName, lastName, email } = friend
    return { firstName, lastName, email }
  })
  res.json(friendsDTO);
})

/**
 * authenticated users can edit himself
 */
router.put('/editme', async function (req: any, res, next) {
  try {
    if (!USE_AUTHENTICATION) {
      throw new ApiError("This endpoint requires authentication", 500)
    }

    const email = req.credentials.userName 
    const updatedFriend = req.body;

    let updated = await facade.editFriend(email, updatedFriend)
    logger.info("user was editet", updatedFriend)
    res.send(updated)
  } catch (err) {
    logger.error(err)
    if (err instanceof ApiError) {
      return next(err)
    }
    next(new ApiError(err.message, 400));
  }
})

router.get("/me", async (req: any, res, next) => {
  try {
    if (!USE_AUTHENTICATION) {
      throw new ApiError("This endpoint requires authentication", 500)
    }
    
    const email =  req.credentials.userName
       
    const friend = await facade.getFriend(email)
    res.send(friend)

  } catch (err) {
    logger.error(err)
    if (err instanceof ApiError) {
      return next(err)
    }
    next(new ApiError(err.message, 400));
  }
})

//These endpoint requires admin rights

//An admin user can fetch everyone
router.get("/find-user/:email", async (req: any, res, next) => {

  if (USE_AUTHENTICATION && req.credentials.role !== "admin") {
    throw new ApiError("Not Authorized", 401)
  }
  const userId = req.params.email;
  try {
    const friend = await facade.getFriend(userId);
    
    const { firstName, lastName, email, role } = friend;
    const friendDTO = { firstName, lastName, email }
    res.json(friendDTO);
  } catch (err) {
    logger.error(err)
    if (err instanceof ApiError) {
      return next(err)
    }
    next(new ApiError(err.message, 400));
  }
})


//An admin user can edit everyone
router.put('/:email', async function (req: any, res, next) {
  try {
    if (USE_AUTHENTICATION  && req.credentials.role !== "admin") {
      throw new ApiError("Not Authorized", 401)
    }
    const email = req.params.email
    let newFriend = req.body;

      const ress = await facade.editFriend(email, newFriend)
      res.send(ress)
      logger.info("Friend was edittet", newFriend, new Date().toLocaleDateString())


  } catch (err) {
    logger.error(err)
    if (err instanceof ApiError) {
      return next(err)
    }
    next(new ApiError(err.message, 400));
  }
})


//An admin user can delete everyone
router.delete('/:email', async function (req: any, res, next) {

    try {
      if (USE_AUTHENTICATION && req.credentials.role !== "admin") {
        throw new ApiError("Not Authorized", 401)
      }
      const email = req.params.email
    
  
        const deleted = await facade.deleteFriend(email)
      
        if (!deleted){
        throw new ApiError("Could not delete user", 500)
        }
        logger.info("Friend with email: " + email +  " was deleted", new Date().toLocaleDateString())
        res.send("Freind was removed")
  
    } catch (err) {
      logger.error(err)
      if (err instanceof ApiError) {
        return next(err)
      }
      next(new ApiError(err.message, 400));
    }
  })

export default router