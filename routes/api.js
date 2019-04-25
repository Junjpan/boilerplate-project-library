/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
require('dotenv').config();
var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});


module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res) {
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if (err) throw err;
        db.collection('books').find().toArray((err, docs) => {
          if (err) throw err;
          
       var newDocs=docs.map((doc)=>{
           var newDoc={
            "_id": doc._id, 
            "title": doc.title, 
            "commentcount":doc.commentcount,
           }
           return newDoc;
          })
          res.json(newDocs);
        })
      });
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    .post(function (req, res) {
      var title1 = req.body.title;
      var count = Number(0);
      var newBook = {
        title: title1,
        commentcount: count,
        comments: []
      };
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if (err) throw err;
        db.collection('books').save(newBook, (err, book) => {
          //console.log(book);
          res.json({
            title: book.ops[0].title,
            _id: book.ops[0]._id
          });
          db.close();
        })
      })

      //response will contain new book object including atleast _id and title
    })

    .delete(function (req, res) {
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        db.collection('books').remove({},(err,doc)=>{
          console.log('deleted completely');
         return res.send('complete delete successful');
        })

      })
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res) {
      var bookid = ObjectId(req.params.id);
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if (err) throw err;
        db.collection('books').findOne(bookid, (err, book) => {
          if (err) { console.log(err) }
          if (!book){res.send("no book exists");}
          res.json({'_id': book._id,
            'title': book.title,
            'comments': book.comments })
      })

    })

  //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
})
    
    .post(function (req, res) {
  var bookid = ObjectId(req.params.id);
  var comment = req.body.comment;

  var query = { _id: bookid };

  MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
    var books = db.collection('books');

    books.findOne(bookid, (err, doc) => {
      if (err) throw err;
      if (!doc){res.send("no book exists");}
      var commentsArr = doc.comments;
      commentsArr.push(comment);
     // console.log(commentsArr);
     var length=commentsArr.length
      books.updateOne(query, { $set: { comments: commentsArr,commentcount: length}}, (err, book) => {
        if (err) throw err;
      })
      res.json({
        '_id': doc._id,
        'title': doc.title,
        'comments': doc.comments,
        "commentcount":doc.commentcount
      });
    });

  })

  //json res format same as .get
})

  .delete(function (req, res) {
    var bookid = req.params.id;
    var query={_id:ObjectId(bookid)}
    MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
      if (err) throw err;
      db.collection('books').remove(query,(err,doc)=>{
        if (err) {res.json('could not delete'+bookid)}
        else{
          return res.send('delete successful');
        }
        db.close();
      })
    })
    //if successful response will be 'delete successful'
  });
  
};
