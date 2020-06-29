var mongoose = require('mongoose');
var Book = mongoose.model('Book');
var Author = mongoose.model('Author');
var Genre = mongoose.model('Genre');
var BookInstance = mongoose.model('BookInstance');

var async = require('async')

exports.index = function (req, res) {
	var counts = {
		book_count: function(cb) {
			Book.countDocuments({}, cb);
		},
		book_instance_count: function(cb) {
			BookInstance.countDocuments({}, cb);
		},
		book_instance_available_count: function(cb) {
			BookInstance.countDocuments({status: 'Available'}, cb);
		},
		author_count: function(cb) {
			Author.countDocuments({}, cb);
		},
		genre_count: function(cb) {
			Genre.countDocuments({}, cb);
		}
	}

	var success = function(err, results) {
		res.render('index', { title: "Basic Library Home", error: err, data: results })
	}

	async.parallel(counts, success)
};

// Display list of all books.
exports.book_list = function (req, res) {
  Book.find({}, 'title author')
  .populate('author')
  .exec(function(err, list_books) {
  	if(err) return next(err);
  	res.render('book_list', {title: 'Book List', book_list: list_books });
  });
};

// Display detail page for a specific book.
exports.book_detail = function (req, res, next) {
	var book_and_bookinstances_by_id = {
		book:function(cb) {
			Book.findById(req.params.id)
			.populate('author')
			.populate('genre')
			.exec(cb);
		},
		book_instance: function(cb) {
			BookInstance.find({ 'book' : req.params.id })
			.exec(cb);
		}
	}

	var get_done = function(err, results) {
		if(err) return next(err);
		if(results.book == null) {
			var err = new Error('Book not found');
			err.status = 404;
			return next(err);
		}
		res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance } );
	}

	async.parallel(book_and_bookinstances_by_id, get_done);	
};

// Display book create form on GET.
exports.book_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book create GET');
};

// Handle book create on POST.
exports.book_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book create POST');
};

// Display book delete form on GET.
exports.book_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book update POST');
};
