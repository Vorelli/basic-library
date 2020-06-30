var mongoose = require('mongoose');
var BookInstance = mongoose.model('BookInstance');
var Book = mongoose.model('Book');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {
  BookInstance.find()
    .populate('book')
    .exec(function (err, list) {
      if (err) return next(err);
      res.render('bookinstance_list', {
        title: 'Book Instance List',
        bookinstance_list: list
      });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function (req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookInstance) {
      if (err) return next(err);
      if (bookInstance == null) {
        err = new Error('Book copy not found!');
        err.status = 404;
        return next(err);
      }
      res.render('bookinstance_detail', {
        title: 'Copy ' + bookInstance.book.title,
        bookInstance: bookInstance
      });
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {
  Book.find({}, 'title author')
    .populate('author')
    .exec(function (err, books) {
      if (err) return next(err);
      res.render('bookinstance_form', {
        title: 'Create Book Copy',
        book_list: books
      });
    });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  sanitizeBody('book').escape(),
  sanitizeBody('imprint').escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  body('book', 'Book must be specified.').trim().isLength({ min: 1 }),
  body('imprint', 'Imprint must be specified.').trim().isLength({ min: 1 }),
  body('due_back', 'Invalid date.').optional({ checkFalsy: true }).isISO8601(),

  (req, res, next) => {
    const errors = validationResult(req);

    var bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back
    });

    if (!errors.isEmpty()) {
      Book.find({}, 'title author')
        .populate('author')
        .exec(function (err, books) {
          if (err) return next(err);
          res.render('bookinstance_form', {
            title: 'Create Book Copy',
            book_list: books,
            selected_book: bookinstance.book._id,
            errors: errors.array(),
            bookinstance: bookinstance
          });
        });
    } else {
      bookinstance.save(function (err) {
        if (err) return next(err);
        res.redirect(bookinstance.url);
      });
    }
  }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance update POST');
};
