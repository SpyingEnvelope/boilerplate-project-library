/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('dotenv').config();

// Connect to database using mongoose
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true});

// Book Schema for new books
const bookSchema = new Schema({
  "title": {type: String, required: true},
  "comments": [String],
  "commentcount": Number
})

// Model for library
const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find().select('-comments -__v').exec((err, data) => {
        if (err) {
          console.log(err);
          res.json({'error': err})
        } else {
          console.log(data);
          res.json(data);
        }
      })
    })
    
    .post(function (req, res){

      //response will contain new book object including atleast _id and title

      let title = req.body.title;

      if (!req.body.title) { res.send('missing required field title') }

      if (req.body.title) {
        let newBook = new Book({
          'title': title,
          'comments': [],
          "commentcount": 0
        }).save((err, data) => {
          if (err) {
            console.log(err);
            res.send(err)
          } else {
            console.log(data);
            res.json({
              "_id": data["_id"],
              "title": data.title
            })
          }
        })
      }


      
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'\
      Book.deleteMany({}, (err, data) => {
        if (err) {
          console.log(err);
          res.send('failed to delete ' + err);
        } else {
          console.log(data);
          res.send('complete delete successful');
        }
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      let bookid = req.params.id;
      if (!req.params.id) {res.send('missing required id field')};
      if (req.params.id) {
        Book.findById(bookid).select('-commentcount -__v').exec((err, book) => {
          if (err) {
            console.log(err);
            res.send('no book exists')
          } else if (!book) {
            res.send('no book exists')
          } else if (book) {
            console.log(book);
            res.json(book);
          }
        })
      }
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      if (!req.body.comment) {res.send('missing required field comment')}
      else if (!req.params.id) {res.send('missing required bookId field')}
      else {
        Book.findById(bookid, (err, book) => {
          if (err) {
            console.log(err);
            res.send('no book exists');
          } else if(!book) {
            res.send('no book exists')
          } else {
            book['comments'].push(comment);
            book['commentcount']++
            book.save((err, data) => {
              if (err) {
                console.log(err);
                res.send('error updating comments ' + err)
              } else {
                console.log(data);
                res.json({
                  '_id': data.id,
                  'title': data.title,
                  'comments': data.comments
                })
              }
            })
          }
        })
      }
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findByIdAndRemove(bookid, (err, data) => {
        if (err) {
          console.log(err);
          res.send('no book exists');
        } else if (!data) {
          res.send('no book exists');
        } else {
          console.log(data);
          res.send('delete successful');
        }
      })
    });
  
};
