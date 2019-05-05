const path = require("path")
const express = require("express")
const indexRouter = require("./routes/index")
const agentsRouter = require("./routes/agents")

const app = express()
const PORT = 3000

app.use(express.static( path.join(__dirname, "public") ))

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use("/", indexRouter)
app.use("/agents", agentsRouter)

app.listen( PORT, () => console.log(`Server is listening on port: ${PORT}`) )
