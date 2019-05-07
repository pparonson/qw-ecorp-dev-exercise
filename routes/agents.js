const path = require("path")
const fs = require("fs")
const router = require("express").Router()
const agents = require("../data/agents")

// global to increment agent._id
let index = agents.length - 1
let agentsCreated = agents[index]._id

// GET agents page: /agents/
router.get("/", (req, res, next) => {
  let page = req.query.page
  if (page === undefined) {page = 1}

  // return a limited 20 items / page to allow scale
  const startIndex = (page - 1) * 20
  let results = agents.slice( startIndex, startIndex + 19 )

  // return an obj with a results prop via obj literal syntax
  results.length > 0 ? res.json({page, results}) :
    res.json({msg: "None found"})
})

router.get("/:agentId", (req, res, next) => {
  const agentId = parseInt(req.params.agentId)

  // find method returns undefined if no matching id
  let agent = agents.find( agent => agent._id === agentId )

  agent !== undefined ? res.json(agent) : res.json({msg: "Not found"})
})

router.post("/", (req, res, next) => {
  // req content-type validation
  // this validation snippet should probably exist as a helper fn or express middleware
  if (!req.is("application/json")) {
    res.json({msg: "content-type must be application/json"})
    return
  }

  const agent = {
    _id: ++agentsCreated
    , ...req.body
  }
  // TODO: something weird is going on with the appending of new obj the array..
  // fs.readFileSync to get access to the array is a temp work-around and this is
  // probably okay for now since the the json datasource is temp
  const agentsArr = JSON.parse(
    fs.readFileSync(
      path.resolve(
        __dirname
        , "../data/agents.json")))

  const newAgents = [...agentsArr, agent]

  fs.writeFile(
    path.resolve(__dirname, "../data/agents.json")
    , JSON.stringify(newAgents, null, 2)
    , err => {
      if (err) {
          res.json({msg: err})
          return
      }
      res.json({msg: "Success"})
    }
  )
})

router.patch("/:agentId", (req, res, next) => {
  // req content-type validation
  if (!req.is("application/json")) {
    res.json({msg: "content-type must be application/json"})
    return
  }

  const agentsArr = JSON.parse(
    fs.readFileSync(
      path.resolve(
        __dirname
        , "../data/agents.json")))

  const agentId = parseInt(req.params.agentId)
  const agentIndex = agentsArr.findIndex(agent => agent._id === agentId)

  if (agentIndex < 0) {
    res.json({msg: `Agent index: ${agentIndex} not found`})
    return
  }

  const updatedAgent = {
    ...agentsArr[agentIndex]
    , ...req.body
  }

  // NOTE: splice mutates the orig array
  agentsArr.splice(agentIndex, 1, updatedAgent)

  fs.writeFile(
    path.resolve(__dirname, "../data/agents.json")
    , JSON.stringify(agentsArr, null, 2)
    , err => {
      if (err) {
          res.json({msg: err})
          return
      }
      res.json({msg: "Success."})
    }
  )
})

module.exports = router
