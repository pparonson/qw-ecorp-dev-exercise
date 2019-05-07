const path = require("path")
const fs = require("fs")
const router = require("express").Router()

// global to increment agent._id
let index = getJSONFile().length - 1
let agentsCreated = getJSONFile()[index]._id

// GET agents page: /agents/
router.get("/", (req, res, next) => {
  let page = req.query.page
  if (page === undefined) {page = 1}

  // return a limited 20 items / page to allow scale
  const startIndex = (page - 1) * 20
  // NOTE: slice method does not mutate the orig array
  const agentsArr = getJSONFile().slice( startIndex, startIndex + 19 )

  // return an obj with a results prop via obj literal syntax
  agentsArr.length > 0 ?
    res.json({page, agentsArr}) :
    res.json({msg: "None found"})
})

router.get("/:agentId", (req, res, next) => {
  const agentId = parseInt(req.params.agentId)

  // find method returns undefined if no matching id
  let agent = getJSONFile().find( agent => agent._id === agentId )

  agent !== undefined ?
    res.json(agent) :
    res.json({msg: "Not found"})
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

  const agents = [...getJSONFile(), agent]
  setJSONFile(req, res, next, agents)
})

router.patch("/:agentId", (req, res, next) => {
  // req content-type validation
  if (!req.is("application/json")) {
    res.json({msg: "content-type must be application/json"})
    return
  }

  let agents = getJSONFile()
  const agentId = parseInt(req.params.agentId)
  const agentIndex = agents.findIndex(agent => agent._id === agentId)

  if (agentIndex < 0) {
    res.json({msg: `Agent index: ${agentIndex} not found`})
    return
  }

  const updatedAgent = {
    ...agents[agentIndex]
    , ...req.body
  }

  // NOTE: splice mutates the orig array
  agents.splice(agentIndex, 1, updatedAgent)
  setJSONFile(req, res, next, agents)
})

// helpers
function getJSONFile() {
  return JSON.parse(
    fs.readFileSync(
      path.resolve(
        __dirname
        , "../data/agents.json")))
}

function setJSONFile(req, res, next, arr) {
  fs.writeFile(
    path.resolve(__dirname, "../data/agents.json")
    , JSON.stringify(arr, null, 2)
    , err => {
      if (err) {
          res.json({msg: err})
          return
      }
      res.json({msg: "Success"})
    }
  )
}

module.exports = router
