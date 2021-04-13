import * as mongo from "mongodb"
import FriendFacade from '../src/facade/friendFacade';

import chai from "chai";
const expect = chai.expect;

//use these two lines for more streamlined tests of promise operations
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import bcryptjs from "bcryptjs"
import { InMemoryDbConnector } from "../src/config/dbConnector"
import  ApiError  from "../src/errors/apiError";
import app from "../src/app";

let friendCollection: mongo.Collection;
let facade: FriendFacade;

describe("## Verify the Friends Facade ##", () => {

  before(async function () {
      let connection = await InMemoryDbConnector.connect()
      let db = connection.db()
      app.set("db",db)
      app.set("db-type", "TEST-DB")
      friendCollection = db.collection("friends")
    
      facade = new FriendFacade(db)
    //Connect to inmemory test database
    //Get the database and initialize the facade
    //Initialize friendCollection, to operate on the database without the facade
  })

  beforeEach(async () => {
    const hashedPW = await bcryptjs.hash("secret", 4)
    await friendCollection.deleteMany({})
    //Create a few few testusers for ALL the tests
    await friendCollection.insertMany([
        { firstName: "Donald", lastName: "Duck", email: "dd@b.dk", password: hashedPW, role: "user" },
        { firstName: "Peter", lastName: "Admin", email: "peter@admin.dk", password: hashedPW, role: "admin" },
      ])
  })

  describe("Verify the addFriend method", () => {
    it("It should Add the user Jan", async () => {
      const newFriend = { firstName: "Jan", lastName: "Olsen", email: "jan@b.dk", password: "secret" }
      const status = await facade.addFriend(newFriend);
      expect(status).to.be.not.null
      const jan = await friendCollection.findOne({ email: "jan@b.dk" })
      expect(jan.firstName).to.be.equal("Jan")
    })

    it("It should not add a user with a role (validation fails)", async () => {
      const newFriend = { firstName: "Jan", lastName: "Olsen", email: "jan@b.dk", password: "secret", role: "admin" }
     try{
      const status = await facade.addFriend(newFriend);
      expect(false).to.be.true("Should never come in here")
     } catch(err){
        expect(err instanceof ApiError).to.be.true

     }
     

    })
  })

  describe("Verify the editFriend method", () => {
    it("It should change lastName to XXXX", async () => {
    const newLastName =  { firstName: "Peter", lastName: "XXXX", email: "peter@admin.dk", password: "secret"}
    const status = await facade.editFriend("peter@admin.dk", newLastName)
    expect(status).to.be.not.null
    const peter = await friendCollection.findOne({ email: "peter@admin.dk" })
    expect(peter.lastName).to.be.equal("XXXX")

    })
  })

  describe("Verify the deleteFriend method", () => {
   it("It should remove the user Peter", async () => { 
     let result = await facade.deleteFriend("peter@admin.dk")
     expect(result).to.be.true
     const peter = await friendCollection.findOne({ email: "peter@admin.dk" })
     expect(peter).to.be.null

    })
    it("It should return false, for a user that does not exist", async () => {
      let result = await facade.deleteFriend("doesnot@exist.dk")
      expect(result).to.be.false
    })
  })

  describe("Verify the getAllFriends method", () => {
    it("It should get two friends", async () => {
      let friends = await facade.getAllFriends()
      expect(friends.length).to.be.equal(2)
    })
  })

  describe("Verify the getFriend method", () => {

    it("It should find Donald Duck", async () => {
     let donald = await facade.getFriend("dd@b.dk")
     expect(donald.firstName).to.be.equal("Donald")
    })
    it("It should not find xxx.@.b.dk", async () => {
      // Instead of try cath, with chai-as-promise u can do this
      expect(facade.getFriend("xxx.@.b.dk")).to.be.rejectedWith(ApiError)
    })
  })

  describe("Verify the getVerifiedUser method", () => {
    it("It should correctly validate Peter Admin's credential,s", async () => {
      const veriefiedPeter = await facade.getVerifiedUser("peter@admin.dk", "secret")
      expect(veriefiedPeter).to.be.not.null;
    })

    it("It should NOT validate Peter Admin's credential,s", async () => {
      const veriefiedPeter = await facade.getVerifiedUser("peter@admin.dk", "notHisSecret")
      expect(veriefiedPeter).to.be.null;
    })

  it("It should NOT validate a non-existing users credentials", async () => {
    const veriefiedPeter = await facade.getVerifiedUser("xxx.@.b.dk", "no")
    expect(veriefiedPeter).to.be.null;
    })
  })

})