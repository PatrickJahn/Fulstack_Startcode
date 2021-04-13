import express from "express"
const app = express();
import fetch from "node-fetch";

app.get("/whattodo", async (req, res) => {
  const whatToDo = await fetch("https://www.boredapi.com/api/activity").then(r => r.json())
  res.json(whatToDo)
})


app.get("/nameinfo/:name", async (req, res) => {
  const name = req.params.name;

  const gender = fetch("https://api.genderize.io?name=" + name).then(res => res.json())
  const nation = fetch("https://api.nationalize.io?name=" + name).then(res => res.json())
  const age = fetch("https://api.agify.io?name=" + name).then(res => res.json())

 const info = await Promise.all([gender,nation, age])

 const nameInfo = {gender: info[0].gender, nation: info[1].country[0].country_id, age: info[2].age}
 console.log(nameInfo)
 res.json(nameInfo)
})

export default app
