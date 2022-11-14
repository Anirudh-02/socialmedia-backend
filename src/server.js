const express = require('express')

const { db } = require('./db/models')
const { apiRoute } = require('./routes/api')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', apiRoute)
const PORT = process.env.PORT || 3000

if (process.env.NODE_ENV !== 'test') {
    db.sync()
  .then(() => {
    let server = app.listen(PORT, () => {
      console.log(`server started at http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error(new Error('Could not start database'))
    console.error(err)
  })
}

module.exports = app