const app = require('../src/server')
const { db, Posts, Users } = require('../src/db/models')

let chai = require('chai')
const chaiHttp = require('chai-http')
let should = chai.should()

chai.use(chaiHttp)
let token = ""

describe("Authenticate user /POST /api/authenticate", () => {
    before((done) => {
        let user = { email: "test_user_1@users.com", password: "testuserpassword" }
        chai.request(app)
            .post('/api/authenticate')
            .send(user)
            .end((err, res) => {
                token = res.body.token
                done()
            })
    })

    it('Authenticate a user', (done) => {
        let user = { email: "test_user_2@users.com", password: "testuserpassword" }
        chai.request(app)
            .post('/api/authenticate')
            .send(user)
            .end((err, res) => {
                res.body.should.be.a('object')
                res.should.have.status(200)
                res.body.should.have.property('token')
                done()
            })
    })

    it('Authentication should not work if  either email or password is missing', (done) => {
        let user = { email: "test_mail@users.com" }
        chai.request(app)
            .post('/api/authenticate')
            .send(user)
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('message')
                res.body.message.should.be.eql('Need email and password to login')
                done()
            })
    })

    it('Authentication should not work if  either email or password is an empty string', (done) => {
        let user = { email: "test_mail@users.com", password: " " }
        chai.request(app)
            .post('/api/authenticate')
            .send(user)
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('message')
                res.body.message.should.be.eql('Need email and password to login')
                done()
            })
    })

    describe('/POST /api/follow/:userId', () => {
        it('should follow a user', (done) => {
            chai.request(app)
                .post('/api/follow/2')
                .set("Authorization", "Bearer " + token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('message')
                    res.body.message.should.be.eql('User has been followed')
                    done()
                })
        })
    })

    describe('/POST /api/posts', () => {
        it('should create a post in database', (done) => {
            let postid
            let postToCreate = { title: 'test_post', desc: 'description of test post' }
            chai.request(app)
                .post('/api/posts')
                .set("Authorization", "Bearer " + token)
                .send(postToCreate)
                .end(async (err, res) => {
                    res.should.have.status(201)
                    res.body.should.have.property('postId')
                    postid = res.body.postId
                    postInDb = await Posts.findAll({
                        where: {
                            id: postid
                        }
                    })
                    postInDb[0].should.have.property('id')
                    done()
                })
        })

        it('should not create a post in database if description is missing', (done) => {
            let postid
            let postToCreate = { title: 'test_post_no_desc' }
            chai.request(app)
                .post('/api/posts')
                .set("Authorization", "Bearer " + token)
                .send(postToCreate)
                .end(async (err, res) => {
                    res.should.have.status(400)
                    res.body.message.should.be.eql("Title or Description empty or unavailable")
                    postInDb = await Posts.findAll({
                        where: {
                            title: postToCreate.title
                        }
                    })
                    postInDb.length.should.be.eql(0)
                    done()
                })
        })

        it('should not create a post if user token is invalid', (done) => {
            let postToCreate = { title: 'test_post_invalid_token', desc: 'desc test post, invalid token' }
            chai.request(app)
                .post('/api/posts')
                .set("Authorization", "Bearer " + 'invalid token')
                .send(postToCreate)
                .end(async (err, res) => {
                    res.should.have.status(401)
                    res.body.message.should.be.eql("Invalid token")
                    postInDb = await Posts.findAll({
                        where: {
                            title: postToCreate.title
                        }
                    })
                    postInDb.length.should.be.eql(0)
                    done()
                })
        })


    })

    describe('POST /api/like/:postid', () => {
        it('should like a post', (done) => {
            chai.request(app)
                .post('/api/like/1')
                .set("Authorization", "Bearer " + token)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.message.should.be.eql('Post has been liked')
                    done()
                })
        })
    })

    describe('POST /api/comment/:postid', () => {
        it('should comment on a post', (done) => {
            let comment = { comment: 'test comment' }
            chai.request(app)
                .post('/api/comment/1')
                .set("Authorization", "Bearer " + token)
                .send(comment)
                .end(async (err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('commentid')
                    done()
                })
        })
    })

    describe('GET /api/all_posts', () => {
        it('should fetch all posts', (done) => {
            chai.request(app)
                .get('/api/all_posts')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('array')
                    done()
                })
        })
    })

    describe('DELETE api/posts/:postid', () => {
        it('should delete a post', (done) => {
            chai.request(app)
                .delete('/api/posts/1')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.message.should.be.eql('Post has been deleted')
                    done()
                })
        })
    })

    after((done) => {
        db.sync({ force: true })
        done()
        // process.exit()
    })
})