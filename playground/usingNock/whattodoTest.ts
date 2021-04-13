const expect = require("chai").expect;
import app from "./whattodo";
const request = require("supertest")(app);
import nock from "nock";

describe("What to do endpoint", function () {
  before(() => { 
      
    const scope = nock('https://www.boredapi.com/api')
  .get('/activity')
  .reply(200, {
    activity: "drink a single beer"
  })



  nock('https://api.genderize.io')
  .get('/?name=ivan')
  .reply(200, {
    gender: "male"
  })

 nock('https://api.nationalize.io')
  .get('/?name=ivan')
  .reply(200, {
    country:[{ country_id:"US"}]
  })

  nock('https://api.agify.io')
  .get('/?name=ivan')
  .reply(200, {
    age: 23
  })

  })

  it("Should eventually provide 'drink a single beer'", async function () {
    const response = await request.get("/whattodo")

    expect(response.body.activity).to.be.equal("drink a single beer");
  })
})

describe("My own endpoint", function () {
 


  it("Should eventually provide {gender: male, country: US, age:23}", async function () {
    const response = await request.get("/nameinfo/ivan")
    expect(response.body.gender).to.be.equal("male");
    expect(response.body.nation).to.be.equal("US");
    expect(response.body.age).to.be.equal(23);
 
  })

})
