const { Router } = require('express')
const jwt = require("jsonwebtoken")
const { Posts, Users } = require('../db/models')
const { createUser } = require('../controllers/users')
const {
    createPost,
    deletePost,
} = require('../controllers/posts')


const route = Router()

route.post('/authenticate', async (req, res) => {
    try {
        if (!(req.body.email?.trim(), req.body.password?.trim())) {
            res.status(400).send({ message: 'Need email and password to login' })
            return
        }
        const user = await createUser(req.body.email?.trim(), req.body.password?.trim())
        const uuid = user.uuid
        const id = user.id
        const token = await jwt.sign({ uuid, id }, "secret")
        res.status(200).send({ "token": token })

    } catch (err) {
        res.status(500).send({ message: 'Error' })
    }
})

route.post('/follow/:id', async (req, res) => {
    try {
        const userVerified = jwt.verify(req.headers.authorization?.split(" ")[1], "secret")
        const userid = userVerified.id
        if (userid == req.params.id) {
            res.status(400).send({ message: "Can't follow yourself" })
            return
        }
        const entry = await Users.findAll({
            where: {
                id: req.params.id
            }
        })
        if (entry.length !== 0) {
            const entry1 = await Users.findAll({
                where: {
                    id: req.params.id
                },
                attributes: ['followers'],
            })
            const entry2 = await Users.findAll({
                where: {
                    id: userid
                },
                attributes: ['following'],
            })
            const index = entry1[0].followers.indexOf(userid);
            if (index > -1) {
                res.status(400).send({ message: "User has already been followed" })
            }
            else {
                let arr1 = entry1[0].followers
                let arr2 = entry2[0].following
                arr1.push(userid)
                arr2.push(req.params.id)
                await Users.update(
                    { followers: arr1 },
                    { where: { id: req.params.id } })
                await Users.update(
                    { following: arr2 },
                    { where: { id: userid } })

                res.status(200).send({ message: "User has been followed" })
            }
        }
        else {
            res.status(404).send({ message: "User does not exist" })
        }

    } catch (err) {
        res.status(401).send({ message: 'Invalid token' })
        return
    }
})

route.post('/unfollow/:id', async (req, res) => {
    try {
        const userVerified = jwt.verify(req.headers.authorization?.split(" ")[1], "secret")
        const userid = userVerified.id
        if (userid == req.params.id) {
            res.status(400).send({ message: "Can't unfollow yourself" })
            return
        }
        const entry = await Users.findAll({
            where: {
                id: req.params.id
            }
        })
        if (entry.length !== 0) {
            const entry1 = await Users.findAll({
                where: {
                    id: req.params.id
                },
                attributes: ['followers'],
            })
            const entry2 = await Users.findAll({
                where: {
                    id: userid
                },
                attributes: ['following'],
            })
            const index1 = entry1[0].followers.indexOf(userid);
            const index2 = entry2[0].following.indexOf(req.params.id);
            if (index1 > -1) {
                let arr1 = entry1[0].followers
                let arr2 = entry2[0].following
                arr1.splice(index1, 1)
                arr2.splice(index2, 1)
                await Users.update(
                    { followers: arr1 },
                    { where: { id: req.params.id } })
                await Users.update(
                    { following: arr2 },
                    { where: { id: userid } })
                res.status(200).send({ message: "User has been unfollowed" })
            }
            else {
                res.status(400).send({ message: "User was never followed in the first place" })
            }
        }
        else {
            res.status(404).send({ message: "User does not exist" })
        }

    } catch (err) {
        res.status(401).send('Invalid token')
        return
    }                                 //ok
})

route.get('/user', async (req, res) => {
    try {
        const userVerified = jwt.verify(req.headers.authorization?.split(" ")[1], "secret")
        const userid = userVerified.id
        const entry = await Users.findAll({
            where: {
                id: userid
            }
        })
        res.status(200).send({
            "User Name": entry[0].email,
            "followers": entry[0].followers.length,
            "following": entry[0].following.length,
        })
    } catch (err) {
        res.status(401).send('Invalid token')
        return
    }                                        //ok
})

route.post('/posts', async (req, res) => {
    try {
        const userVerified = jwt.verify(req.headers.authorization?.split(" ")[1], "secret")
        const userid = userVerified.id
        if (!(req.body.title?.trim() && req.body.desc?.trim())) {
            res.status(400).send({ message: "Title or Description empty or unavailable" })
            return
        }
        const post = await createPost(userid, req.body.title, req.body.desc)
        const postData = {
            "postId": post.id,
            "Title": post.title,
            "Description": post.desc,
            "Created Time": post.createdAt,
        }
        res.status(201).send(postData)
    } catch (err) {
        res.status(401).send({ message: 'Invalid token' })
        return
    }
})

route.delete('/posts/:id', async (req, res) => {
    try {
        const post = await Posts.findAll({
            where: {
                id: req.params.id
            }
        })
        if (post.length !== 0) {
            await deletePost(req.params.id)
            res.status(200).send({ message: "Post has been deleted" })
        }
        else {
            res.status(404).send({ message: "There is no such post" })
        }
    } catch (err) {
        res.status(500).send({ message: "Error" })
    }
})

route.post('/like/:postid', async (req, res) => {
    try {
        const userVerified = jwt.verify(req.headers.authorization.split(" ")[1], "secret")
        const userid = userVerified.id
        const post = await Posts.findAll({
            where: {
                id: req.params.postid
            }
        })
        if (post.length !== 0) {
            const entry = await Posts.findAll({
                where: {
                    id: req.params.postid
                },
                attributes: ['likes'],
            })
            const index = entry[0].likes.indexOf(userid);
            if (index > -1) {
                res.status(400).send({ message: "Post has already been liked" })
            }
            else {
                let arr = entry[0].likes
                let num = userid
                arr.push(num)
                await Posts.update(
                    { likes: arr },
                    { where: { id: req.params.postid } })
                res.status(200).send({ message: "Post has been liked" })
            }
        }
        else {
            res.status(404).send({ message: "Post does not exist" })
        }
    } catch (err) {
        res.status(401).send({ message: "Invalid token" })
    }
})

route.post('/unlike/:postid', async (req, res) => {
    try {
        const userVerified = jwt.verify(req.headers.authorization.split(" ")[1], "secret")
        const userid = userVerified.id
        const post = await Posts.findAll({
            where: {
                id: req.params.postid
            }
        })
        if (post.length !== 0) {
            const entry = await Posts.findAll({
                where: {
                    id: req.params.postid
                },
                attributes: ['likes'],
            })
            const index = entry[0].likes.indexOf(userid);
            if (index > -1) {
                let arr = entry[0].likes
                arr.splice(index, 1)
                await Posts.update(
                    { likes: arr },
                    { where: { id: req.params.postid } })
                res.status(200).send({ message: "Post has been unliked" })
            }
            else {
                res.status(400).send({ message: "You haven't liked this post" })
            }
        }
        else {
            res.status(404).send({ message: "Post does not exist" })
        }

    } catch (err) {
        res.status(401).send({ message: "Invalid token" })
    }
})

route.post('/comment/:postid', async (req, res) => {
    try {
        const userVerified = jwt.verify(req.headers.authorization.split(" ")[1], "secret")
        const userid = userVerified.id
        const post = await Posts.findAll({
            where: {
                id: req.params.postid
            }
        })
        const entry = await Posts.findAll({
            where: {
                id: req.params.postid
            },
            attributes: ['comments'],
        })
        if (post.length !== 0) {
            let arr = entry[0].comments
            let commentStr = req.body.comment
            if (commentStr?.trim()) {
                arr.push(commentStr)
                await Posts.update(
                    { comments: arr },
                    { where: { id: req.params.postid } })
                const commentid = ((arr.length) - 1)
                res.status(200).send({ commentid })
            }
            else {
                res.status(400).send({ message: "comment value empty or unavailable" })
            }
        }
        else {
            res.status(404).send({ message: "post does not exist" })
        }
    } catch (err) {
        res.status(401).send('Invalid token')
    }
})

route.get('/posts/:postid', async (req, res) => {
    try {
        const entry = await Posts.findAll({
            where: {
                id: req.params.postid
            }
        })
        if (entry.length !== 0) {
            const postData = {
                'title': entry[0].title,
                'desc': entry[0].desc,
                'comments': entry[0].comments,
                'likes': entry[0].likes.length,
            }
            res.status(200).send(postData)
        }
        else {
            res.status(404).send({ message: "post does not exist" })
        }
    } catch (err) {
        res.status(500).send({ message: 'Error' })
        return
    }
})

route.get('/all_posts', async (req, res) => {                       //ok
    try {
        const arr = await Posts.findAll({
            attributes: ['id', 'title', 'desc', 'createdAt', 'comments', 'likes'],
        })
        const allPostsArray = []
        arr.forEach(entry => {
            const postData = {
                'id': entry.id,
                'title': entry.title,
                'desc': entry.desc,
                'created_at': entry.createdAt,
                'comments': entry.comments,
                'likes': entry.likes.length,
            }
            allPostsArray.push(postData);
        });
        res.status(200).send(allPostsArray)
    } catch (err) {
        res.status(500).send('Error')
        return
    }
})


module.exports = {
    apiRoute: route
}