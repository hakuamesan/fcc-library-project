/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.MONGO_URI;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        expect(err, 'database error').to.not.exist;
        var collection = db.collection('books');
        collection.find().toArray(function(err, result) {
          expect(err, 'database find error').to.not.exist;
          expect(result).to.exist;
          expect(result).to.be.a('array');
          for(var i=0;i<result.length;i++) {
            result[i].commentcount = result[i].comments.length;
            delete result[i].comments;
          }
          res.json(result);
        });
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
    
      if(!title) {
        res.send('missing title');
      } else {
        expect(title, 'posted title').to.be.a('string');
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          expect(err, 'database error').to.not.exist;
          var collection = db.collection('books');
          var doc = {title:title, comments:[]};
          collection.insert(doc, {w:1}, function(err, result) {
            expect(err, 'database insert error').to.not.exist;
            res.json(result.ops[0]);
          });
        });
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
  
};
