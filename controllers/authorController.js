var mongoose = require('mongoose')
var Author = mongoose.model('Author');
var async = require('async');
var Book = mongoose.model('Author');

exports.author_list = function (req, res, next) {
  Author.find()
    .populate('author')
    .sort([['family_name', 'ascending']])
    .exec(function (err, list_authors) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('author_list', { title: 'Author List', author_list: list_authors });
    });
};

exports.author_detail = function (req, res, next) {
  var get_author_and_books = {
    author: function(callback) {
        Author.findById(req.params.id)
          .exec(callback)
    },
    authors_books: function(callback) {
      Book.find({ 'author': req.params.id },'title summary')
      .exec(callback)
    }
  }

  var after_get = function(err, results) {
    if (err) { return next(err); } // Error in API usage.
    if (results.author==null) { // No results.
        var err = new Error('Author not found');
        err.status = 404;
        return next(err);
    }
    // Successful, so render.
    res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
  }

  async.parallel(get_author_and_books, after_get);
};

exports.author_create_get = function (req, res) {
  // TODO: AUTHOR CREATE
  res.send('');
};

exports.author_create_post = function (req, res) {
  // TODO: AUTHOR CREATE POST
  res.send('');
};

exports.author_delete_get = function (req, res) {
  // TODO: AUTHOR DELETE GET
  res.send('');
};

exports.author_delete_post = function (req, res) {
  // TODO: AUTHOR DELETE POST
  res.send('');
};

exports.author_update_get = function (req, res) {
  // TODO: AUTHOR UPDATE GET
  res.send('');
};

exports.author_update_post = function (req, res) {
  // TODO: AUTHOR UPDATE POST
  res.send('');
};
