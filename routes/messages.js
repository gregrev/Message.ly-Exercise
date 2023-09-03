const express = require('express');
const router = express.Router();
const { ensureCorrectUser, ensureLoggedIn } = require('../middleware/auth');
const User = require('../models/user');
const ExpressError = require("../expressError");
const Message = require('../models/message');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', async (req, res, next) => {
    try {
        const msg = await Message.get(req.params.id);
        if (req.user.username === msg.from_user.username || req.user.username === msg.to_user.username) {
            return res.json(msg)
        } else {
            throw new ExpressError("Unauthorized Access", 400)
        }

    } catch (error) {
        return next(error)
    }
})




/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const { to_username, body } = req.body;
        const { username } = req.user;
        const msg = await Message.create({ from_username: username, to_username: to_username, body: body });
        return res.json(msg)
    } catch (err) {
        return next(err)
    }
})

// {
// 	"to_username": "LucaG",
// 	"body": "You will be a footballer",
//    "_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InMuY29sb24iLCJpYXQiOjE2OTM3NjcyMjd9.qQ2N6wjp1YmbTL2j4CoeFgT2itBQ26SBmTYySiZBRrg"

// }



/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    try {
        const msg = await Message.get(req.params.id);
        if (req.user.username === msg.to_user.username) {
            const readMsg = await Message.markRead(req.params.id)
            return res.json(readMsg)
        } else {
            throw new ExpressError("Unauthorized to read message", 404);
        }
    } catch (err) {
        return next(err)
    }
})




module.exports = router;
