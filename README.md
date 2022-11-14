# socialmedia-backend
- Run `docker compose up` to get the project running in a container, all the tests can be seen in container logs. 
- Access the application at `http://localhost:3000`
- `npm test` to run tests

```
1. `POST /api/authenticate`

Create a new user with email and password sent in request body, returns a JWT. This `token` will be used for authorization of other actions, include it in authorization header as `Bearer TOKEN` of every POST request.

2. `POST /api/follow/:id`

Follow a user with the given id in req.params.

3. `POST /api/unfollow/:id`

Unfollow a user with the given id in req.params

4. `GET /api/user/:token`

Get the information of a user with the given token, including username, follower count and following count.

5. `POST /api/posts`

Create a new post, must send `title` and `desc` in request body.

6. `DELETE /api/posts/:id`

Delete the post with given id.

7. `POST /api/like/:postid`

Like a post with given id.

8. `POST /api/unlike/:postid`

Unlike a post with given id.

9. `POST /api/comments/:postid`

Add a comment on a post, the `comment` must be included in request body.

10. `GET /api/posts/:postid`

Fetch a post with the given id.

11. `GET /api/all_posts`

Fetch all posts.
```
