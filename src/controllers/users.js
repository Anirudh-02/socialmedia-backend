const { Users } = require('../db/models')

async function createUser(email, password) {
  const user = await Users.create({
    email: email,
    password: password
  })
  return user
}


module.exports = {
  createUser
}

