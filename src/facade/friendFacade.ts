import IFriend from '../interfaces/IFriend';
import { Db, Collection } from "mongodb";
import bcrypt from "bcryptjs";
import ApiError from '../errors/apiError';
import Joi, { options, ValidationError } from "joi"
import { isIdentifierOrPrivateIdentifier } from 'typescript';

const BCRYPT_ROUNDS = 10;

const USER_INPUT_SCHEMA = Joi.object({
  firstName: Joi.string().min(2).max(40).required(),
  lastName: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(4).max(30).required(),
  email: Joi.string().email().required()
})

class FriendsFacade {
  db: Db
  friendCollection: Collection

  constructor(db: Db) {
    this.db = db;
    this.friendCollection = db.collection("friends");
  }

  /**
   * 
   * @param friend 
   * @throws ApiError if validation fails
   */
  async addFriend(friend: IFriend): Promise<{ id: String }> {

    const status = USER_INPUT_SCHEMA.validate(friend);
    if (status.error) {
      throw new ApiError(status.error.message, 400)
    }
    const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
    const f = { ...friend, password: hashedpw , role:"user"}

     const id = await (await this.friendCollection.insertOne({...f})).insertedId
     
       if (!id){
        throw new ApiError("Something went wrong, try again later", 500)
       } 

       return id
     
  }

  /**
   * TODO
   * @param email 
   * @param friend 
   * @throws ApiError if validation fails or friend was not found
   */
  async editFriend(email: string, friend: IFriend): Promise<{ modifiedCount: number }> {
    const status = USER_INPUT_SCHEMA.validate(friend);
    if (status.error) {
      throw new ApiError(status.error.message, 400)
    }
    const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
    const f = { ...friend, password: hashedpw }


   const ress = await this.friendCollection.updateOne( { email: email },
    {
      $set: { ...friend},
      $currentDate: { lastModified: true }
    })

      if (!ress){
        throw new ApiError("Could not update friend", 500)
      }

   return {modifiedCount : ress.modifiedCount}
   
    
  }

  /**
   * 
   * @param friendEmail 
   * @returns true if deleted otherwise false
   */
  async deleteFriend(friendEmail: string): Promise<boolean> {

    const res =  await this.friendCollection.deleteOne({email: friendEmail})
    
      return res.deletedCount! > 0 ? true : false
  }

  async getAllFriends(): Promise<Array<IFriend>> {
    const users: unknown = await this.friendCollection.find({}).toArray();
    return users as Array<IFriend>
  }
  
  /**
   * 
   * @param friendEmail 
   * @returns 
   * @throws ApiError if not found
   */
  async getFriend(friendEmail: string): Promise<IFriend> {
    
       let friend: IFriend;
     let res = await this.friendCollection.findOne(
      {email:friendEmail}, {projection: {_id: 0,firstName:1, lastName:1, email:1, role:1}} 
     )
     
     if (!res){
       throw new ApiError("Could not find friend", 404)
     }
      friend = res
      return friend
  }

  /**
   * Use this method for authentication
   * @param friendEmail 
   * @param password 
   * @returns the user if he could be authenticated, otherwise null
   */
  async getVerifiedUser(friendEmail: string, password: string): Promise<IFriend | null> {
    const friend: IFriend = await this.friendCollection.findOne({ email: friendEmail })
    if (friend && await bcrypt.compare(password, friend.password)) {
      return friend
    }
    return Promise.resolve(null)
  }

}

export default FriendsFacade;