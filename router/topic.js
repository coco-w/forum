const express = require('express')
const Topic = require('../modles/topic')
const User = require('../modles/user')
const Comment = require('../modles/comment').model

const router = express.Router()
const assert = require('assert')

router.get('/new', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login')
    }
    res.render('../views/topic/new.html')
})

router.post('/topics/new', (req, res) => {
    let author = req.session.user._id
    let topic = req.body
    topic.author = author
    topic.pic = req.session.user.pic
    new Topic(topic).save()
    res.redirect('/')
})

router.get('/topics',async (req, res) => {
    let id = req.query.id.replace(/"/g, '')
    let query =await Topic.findById(id)
    let author =await User.findById(query.author.replace(/"/g, ''))
    if (query.comment === 'kong') {
        res.render('../views/topic/show.html',{
            user: req.session.user,
            topic: query,
            author: author.nickname,
        })
    } else {
        let comment = await Comment.findById(query.comment.replace(/"/g, ''))
        // comment = Array(comment)
        // console.log(comment)
        // console.log(comment.comments, typeof  comment.comments)
        res.render('../views/topic/show.html',{
            user: req.session.user,
            topic: query,
            author: author.nickname,
            // comment: comment.comments    
        })
    }
    
    
})

router.get('/push',async (req, res) => {
    if(!req.session.user) {
        
        return res.status(200).json({
            err_code: 1,
        })
    }
    // console.log()
    let comment = {}
    comment.content = req.query.content
    comment.author = req.session.user._id
    comment.pic = req.session.user.pic
    comment.nickname = req.session.user.nickname
    comment.create_time = Date.now()
    let topic =await Topic.findById(req.query.id.replace(/"/g, ''))
    if (topic.comment === 'kong'){

        let a =await new Comment().save()
        console.log(a)
        await a.comments.push(comment)
        await a.save()
        topic.comment = a._id
        await topic.save()
    }else {
        let comments = await Comment.findById(topic.comment.replace(/"/g, ''))
        await comments.comments.push(comment)
        await comments.save()
    }
    // let data = await new Comment(comment).save()
    // console.log(comment)
    // let topic = await Topic.findByIdAndUpdate(req.query.id.replace(/"/g, ''),{
    //     comment: {$push : {arr : data._id}}
    // }, {new:true})
    
    // console.log(topic)        

    return res.status(200).json(comment)

})

module.exports = router

