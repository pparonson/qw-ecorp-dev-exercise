const path = require("path")
const fs = require("fs")
const router = require("express").Router()

const agentsPartialPath = "../data/agents.json"
const customersPartialPath = "../data/customers.json"

// List all agents
router.get("/", (req, res, next) => {
  let page = req.query.page
  if (page === undefined) {page = 1}

  // return a limited 20 items / page to allow scale
  const startIndex = (page - 1) * 20
  // NOTE: slice method does not mutate the orig array
  const results = getJSONFile(agentsPartialPath)
    .slice( startIndex, startIndex + 19 )

  // return an obj with a results prop via obj literal syntax
  results.length > 0 ?
    res.json({page, results}) :
    res.json({msg: "None found"})
})

// Get agent details
router.get("/:agentId", (req, res, next) => {
  const agentId = parseInt(req.params.agentId)

  // find method returns undefined if no matching id
  const agent = getJSONFile(agentsPartialPath)
    .find( agent => agent._id === agentId )

  agent !== undefined ?
    res.json(agent) :
    res.json({msg: "Not found"})
})

// Add new agent
router.post("/", (req, res, next) => {
  // req content-type validation
  // this validation snippet should probably exist as a helper fn or express middleware
  if (!req.is("application/json")) {
    res.json({msg: "content-type must be application/json"})
    return
  }

  const agent = {
    _id: getMaxId( getJSONFile(agentsPartialPath) ) + 1
    , ...req.body
  }

  const agents = [...getJSONFile(agentsPartialPath), agent]
  setJSONFile(req, res, next, agentsPartialPath, agents)
})

// Update agent details
router.put("/:agentId", (req, res, next) => {
  // req content-type validation
  if (!req.is("application/json")) {
    res.json({msg: "content-type must be application/json"})
    return
  }

  let agents = getJSONFile(agentsPartialPath)
  const agentId = parseInt(req.params.agentId)
  const agentIndex = agents.findIndex(agent => agent._id === agentId)

  // findIndex return -1 if no value is found
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
  setJSONFile(req, res, next, agentsPartialPath, agents)
})

// List all customers associated an agent's INT ID
router.get("/:agentId/customers", (req, res, next) => {
  const agentId = parseInt(req.params.agentId)
  let page = req.query.page
  if (page === undefined) {page = 1}

  // return a limited 20 items / page to allow scale
  const startIndex = (page - 1) * 20

  // NOTE: slice (pagination) method does not mutate the orig array
  let customers = getJSONFile(customersPartialPath)
    .filter(customer => customer.agent_id === agentId)
  let results = customers.map(customer => {
    return {
      last: customer.name.last
      , first: customer.name.first
      , city: getCity(customer.address)
    }
  }).slice( startIndex, startIndex + 19 )

  // return an obj with a results prop via obj literal syntax
  results.length > 0 ?
    res.json({page, results}) :
    res.json({msg: "None found"})
})

// Add new customer
router.post("/:agentId/customers", (req, res, next) => {
  // req content-type validation
  // this validation snippet should probably exist as a helper fn or express middleware
  if (!req.is("application/json")) {
    res.json({msg: "content-type must be application/json"})
    return
  }

  const customer = {
    _id: getMaxId( getJSONFile(customersPartialPath) ) + 1
    , ...req.body
  }

  const customers = [...getJSONFile(customersPartialPath), customer]
  setJSONFile(req, res, next, customersPartialPath, customers)
})

// Get customer details
router.get("/:agentId/customers/:customerId", (req, res, next) => {
  const agentId = parseInt(req.params.agentId)
  const customerId = parseInt(req.params.customerId)

  // find method returns undefined if no matching id
  const customer = getJSONFile(customersPartialPath)
    .find(customer => customer._id === customerId)

  // if statement is evaluating a returned value
  // nested if statement is validating the customer
  if (customer !== undefined) {
    if (customer.agent_id === agentId) {
      res.json(customer)
    } else {
      res.json({msg: "Invalid customer"})
    }
  } else {
    res.json({msg: "Not found"})
  }
})

// Update customer details
router.put("/:agentId/customers/:customerId", (req, res, next) => {
  // req content-type validation
  if (!req.is("application/json")) {
    res.json({msg: "content-type must be application/json"})
    return
  }

  const customerId = parseInt(req.params.customerId)
  const agentId = parseInt(req.params.agentId)

  let customers = getJSONFile(customersPartialPath)
  const customerIndex = customers
    .findIndex(customer => customer._id === customerId)

  // findIndex return -1 if no value is found
  if (customerIndex < 0) {
    res.json({msg: `Customer not found`})
    return
  }

  if (customers[customerIndex].agent_id !== agentId) {
    res.json({msg: "Invalid customer"})
    return
  }

  const updatedCustomer = {
    ...customers[customerIndex]
    , ...req.body
  }

  // NOTE: splice mutates the orig array
  customers.splice(customerIndex, 1, updatedCustomer)
  setJSONFile(req, res, next, customersPartialPath, customers)
})

// Delete existing customer
router.delete("/:agentId/customers/:customerId", (req, res, next) => {
  // req content-type validation
  if (!req.is("application/json")) {
    res.json({msg: "content-type must be application/json"})
    return
  }

  const customerId = parseInt(req.params.customerId)
  const agentId = parseInt(req.params.agentId)

  let customers = getJSONFile(customersPartialPath)
  const customerIndex = customers
    .findIndex(customer => customer._id === customerId)

  // findIndex return -1 if no value is found
  if (customerIndex < 0) {
    res.json({msg: `Customer not found`})
    return
  }

  if (customers[customerIndex].agent_id !== agentId) {
    res.json({msg: "Invalid customer"})
    return
  }

  // NOTE: splice mutates the orig array
  customers.splice(customerIndex, 1)
  setJSONFile(req, res, next, customersPartialPath, customers)
})


// helpers
function getMaxId(arr) {
  // returns the largest ID from a list to use as a proxy db ID
	let subArr = arr.map(item => item._id)
	return Math.max.apply(null, subArr)
}

function getJSONFile(partialPath) {
  return JSON.parse(
    fs.readFileSync(
      path.resolve(
        __dirname
        , partialPath)))
}

function setJSONFile(req, res, next, partialPath, arr) {
  fs.writeFile(
    path.resolve(__dirname, partialPath)
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

function getCity(address) {
  // parse city from the customer address string
  return address.split(",")[1].trim()
}

module.exports = router
