

(function() {
    var Book = Backbone.Model.extend();
    var Library = Backbone.Collection.extend({
        model: Book
    });
    
    var LibraryView = Backbone.View.extend({
    	el: '#library',
		
        initialize: function() {
		    this.collection.on('reset', this.render, this);
		},
        
		render: function() {
            //console.log('render books');
            var self = this;
			this.$el.empty();
            
            this.collection.each(function(book) {
                // TODO: Use JST instead of err jQuery
                var authors = '';
                if (book.get('authors')) {
                    authors = book.get('authors').map(function(author) {return author.name}).join(', ');
                }
                self.$el.append(
                    $('<tr>').append(
                        $('<td>').append(
                            $('<h4>').html('<a href="' + book.get('details_url') + '">' + book.get('title') + '</a> <span class="small">' + book.get('format').name + '</span>'),
                            $('<h6>').text(book.get('sub_title')),
                            $('<div class="authors">').text(authors),
                            $('<div class="availability ' + book.get('availability').id + '">').text(book.get('availability').name)
                        )
                    )
                )
            });
		}
	});
    
    var SortView = Backbone.View.extend({
        el: '#sort',
        
        initialize: function() {
            this.sort = null;
            this.isAscending = true;
        },
        
        events: {
            'click .titles': 'sortByTitle',
            'click .format': 'sortByFormat',
            'click .availability': 'sortByAvailability',
        },
        
        'sortByFormat': function() {
            if (this.sort !== 'format') {
                this.sort = 'format';
                this.isAscending = false;
            }
            this.isAscending = !this.isAscending;
            var results = this.collection.sortBy(function(book) {
                return book.get('format').name;
            });
            if (!this.isAscending) {
                results.reverse();
            }
            this.collection.reset(results);
        },
        'sortByTitle': function() {
            // TODO: Optimize sort
            if (this.sort !== 'title') {
                this.sort = 'title';
                this.isAscending = false;
            }
            this.isAscending = !this.isAscending;
            var results = this.collection.sortBy(function(book) {
                return book.get('sub_title');
            });
            if (!this.isAscending) {
                results.reverse();
            }
            results = new Library(results);
            results = results.sortBy(function(book) {
                return book.get('title');
            });
            if (!this.isAscending) {
                results.reverse();
            }
            
            this.collection.reset(results);
        },
        'sortByAvailability': function() {
            if (this.sort !== 'format') {
                this.sort = 'format';
                this.isAscending = false;
            }
            this.isAscending = !this.isAscending;
            var results = this.collection.sortBy(function(book) {
                return book.get('availability').id;
            });
            if (!this.isAscending) {
                results.reverse();
            }
            this.collection.reset(results);
        },
        
    });

    var app = function() {
        this.books = new Library(titles);
		this.libraryView = new LibraryView({collection: this.books});
        this.sortView = new SortView({collection: this.books});
	};
	app.prototype.init = function() {
		this.libraryView.render();
	}
	
	window.Application = app;
})();

$(function() {
	window.app = new Application();
    window.app.init();
});