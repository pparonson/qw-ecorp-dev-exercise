const router = require("express").Router()

// GET home page: /
router.get("/", (req, res, next) => {
  // res.render("index", {title: "ECorp"})
  res.send("<h2>Index Page</h2>")
})

module.exports = router
