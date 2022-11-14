const { Posts } = require('../db/models')

async function createPost(userId, title, desc) {
  const post = await Posts.create({
    title,
    desc,
    userId,
  })
  return post
}

async function deletePost(id) {
  const post = await Posts.destroy({
    where: { id }
  })
}



module.exports = {
  createPost,
  deletePost
}

