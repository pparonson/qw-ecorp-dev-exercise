const path = require("path")
const express = require("express")
const indexRouter = require("./routes/index")
const agentsRouter = require("./routes/agents")

const app = express()
const PORT = 3000

// authenticate user at application level
app.use((req, res, next) => {
  if (req.query.api_key !== "123456789") {
    res.send("<h2>Invalid API Key</h2>")
  } else {
    next()
  }
})

app.use(express.static( path.join(__dirname, "public") ))

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use("/", indexRouter)
app.use("/agents", agentsRouter)

app.listen( PORT, () => console.log(`Server is listening on port: ${PORT}`) )
