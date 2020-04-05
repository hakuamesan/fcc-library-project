/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
const MONGODB_CONNECTION_STRING = process.env.MONGO_URI;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

var db;

module.exports = function(app) {
  app
    .route("/api/books")
    .get(function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) return console.log(err);
        //db = client.db("mytestdb");

        expect(err, "database error").to.not.exist;
        //var collection = db.collection("books");
        db.db("mytestdb").collection('books').find().toArray(function(err, result) {
          expect(err, "database find error").to.not.exist;
          expect(result).to.exist;
          expect(result).to.be.a("array");
          for (var i = 0; i < result.length; i++) {
            result[i].commentcount = result[i].comments.length;
            delete result[i].comments;
          }
          res.json(result);
        });
      });
    })

    .post(function(req, res) {
      var title = req.body.title;
      //response will contain new book object including atleast _id and title

      if (!title) {
        res.send("Please enter a book's title");
      } else {
        expect(title, "posted title").to.be.a("string");


        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) return console.log(err);
          //db = client.db("mytestdb");
          //var collection = db.collection("books");
          
          var doc = { title: title, comments: [] };
          
          db.db("mytestdb").collection("books").insertOne(doc, { w: 1 }, function(err, result) {
            expect(err, "database insert error").to.not.exist;
            res.json(result.ops[0]);
          });
        });
      }
    })

    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
    
     MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) return console.log(err);
          
         db.collection("books").remove({});
          res.send('complete delete successful');

     });
    
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
        var bookid = req.params.id;
        var oid = new ObjectId(bookid);
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) return console.log(err);
          //db = client.db("mytestdb");
          //var collection = db.collection("books");

          db.db("mytestdb").collection("books").find({_id:oid}).toArray(function(err, result) {
          expect(err, 'database find error').to.not.exist;
          if(result.length === 0) {
            res.send('no book exists');
          } else {
            res.json(result[0]);
          }
         });
         
       });  
    
    })

    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      var oid = new ObjectId(bookid);
      var comment = req.body.comment;

        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
          if (err) return console.log(err);
          db = client.db("mytestdb");
          var collection = db.collection("books");
    
    
      //json res format same as .get
            collection.findAndModify(
          {_id: oid},
          {},
          {$push: { comments: comment }},
          {new: true, upsert: false},
          function(err, result){
            expect(err, 'database findAndModify error').to.not.exist;
            res.json(result.value);
          });

    
        });
    
    
    })

    .delete(function(req, res) {
      var bookid = req.params.id;
      var oid = new ObjectId(bookid);
    
      //if successful response will be 'delete successful'
    
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, client) {
          if (err) return console.log(err);
          db = client.db("mytestdb");
          var collection = db.collection("books");
    
          collection.findOneAndDelete({_id:oid}, function(err, result) {
          expect(err, 'database findOneAndDelete error').to.not.exist;
          expect(result, 'result error').to.exist;
          res.send("delete successful");
        });
          
    
        });
    });
};
