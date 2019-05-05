const router = require("express").Router()
const agents = require("../data/agents")

// GET agents page: /agents/
router.get("/", (req, res, next) => {
  let page = req.query.page
  if (page === undefined) {page = 1}

  if (req.query.api_key !== "123456789") {
    console.log("Invalid API Key")
    res.redirect("/")
  } else {
    // return a limited 20 items / page to allow scale
    const startIndex = (page - 1) * 20
    let results = agents.slice( startIndex, startIndex + 19 )
    // return an obj with a results prop via obj literal syntax
    results.length > 0 ? res.json({page, results}) :
      res.send("<h2>None Found.</h2>")
  }
})

// router.get("/:id", (req, res, next) => {
//   const agentId = parseInt(req.params.id)
//   const result = agents.filter(agent => {
//     console.log(`agent._id: ${typeof agent._id}`)
//     console.log(`agentId: ${typeof agentId}`)
//     return agent._id === agentId
//   })[0]
//   console.log(result)
//   res.json(result)
// })

router.get("/:agentId", (req, res, next) => {
  const agentId = parseInt(req.params.agentId)
  if (req.query.api_key !== "123456789") {
    console.log("Invalid API Key")
    res.redirect("/")
  } else {
    // find method return undefined if no matching id
    let result = agents.find( agent => agent._id === agentId )
    result !== undefined ? res.json(result) :
      res.send("Agent not found.")
  }
})

module.exports = router
