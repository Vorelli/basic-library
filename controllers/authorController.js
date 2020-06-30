var mongoose = require('mongoose');
var Author = mongoose.model('Author');
var async = require('async');
var Book = mongoose.model('Book');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.author_list = function (req, res, next) {
  Author.find()
    .populate('author')
    .sort([['family_name', 'ascending']])
    .exec(function (err, listOfAuthors) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render('author_list', {
        title: 'Author List',
        author_list: listOfAuthors
      });
    });
};

exports.author_detail = function (req, res, next) {
  var getAuthorAndBooks = {
    author: function (callback) {
      Author.findById(req.params.id).exec(callback);
    },
    authors_books: function (callback) {
      Book.find({ author: req.params.id }, 'title summary').exec(callback);
    }
  };

  var afterGet = function (err, results) {
    if (err) return next(err);
    if (results.author == null) {
      // No results.
      err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render.
    res.render('author_detail', {
      title: 'Author Detail',
      author: results.author,
      authors_books: results.authors_books
    });
  };

  async.parallel(getAuthorAndBooks, afterGet);
};

exports.author_create_get = function (req, res) {
  res.render('author_form', { title: 'Create Author' });
};

exports.author_create_post = [
  sanitizeBody('first_name').escape(),
  sanitizeBody('family_name').escape(),
  sanitizeBody('date_of_birth').escape(),
  sanitizeBody('date_of_death').escape(),

  body('first_name')
    .isLength({ min: 1 })
    .trim()
    .withMessage('First name must be specified')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .isLength({ min: 1 })
    .trim()
    .withMessage('Family name must be specified')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters.'),
  body('date_of_birth', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601(),
  body('date_of_death', 'Invalid date of death')
    .optional({ checkFalsy: true })
    .isISO8601(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('author_form', {
        title: 'Create Author',
        author: req.body,
        errors: errors.array()
      });
    } else {
      var author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
      });
      author.save(function (err) {
        if (err) return next(err);
        res.redirect(author.url);
      });
    }
  }
];

exports.author_delete_get = function (req, res, next) {
  async.parallel(
    {
      author: function (cb) {
        Author.findById(req.params.id).exec(cb);
      },
      authors_books: function (cb) {
        Book.find({ author: req.params.id }).exec(cb);
      }
    },
    function (err, results) {
      if (err) return next(err);
      if (results.author == null) {
        res.redirect('/catalog/authors');
      }
      res.render('author_delete', {
        title: 'Delete Author',
        author: results.author,
        authors_books: results.authors_books
      });
    }
  );
};

exports.author_delete_post = function (req, res, next) {
  const getAuthorAndAuthorsBooks = {
    author: function (cb) {
      Author.findById(req.body.authorid).exec(cb);
    },
    authors_books: function (cb) {
      Book.find({ author: req.body.authorid }).exec(cb);
    }
  };

  const afterGet = function (err, results) {
    if (err) return next(err);
    if (results.authors_books.length > 0) {
      res.render('author_delete', {
        title: 'Delete Author',
        author: results.author,
        authors_books: results.authors_books
      });
    } else {
      if (results.author == null) res.redirect('/catalog/authors');
      Author.findByIdAndRemove(req.body.authorid, function (err) {
        if (err) return next(err);
        res.redirect('/catalog/authors');
      });
    }
  };

  async.parallel(getAuthorAndAuthorsBooks, afterGet);
};

exports.author_update_get = function (req, res) {
  // TODO: AUTHOR UPDATE GET
  res.send('');
};

exports.author_update_post = function (req, res) {
  // TODO: AUTHOR UPDATE POST
  res.send('');
};
