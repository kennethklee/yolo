$(function() {
	var BookList = Backbone.View.extend({
		el: '#bookList',
		
		render: function() {
			this.$el.empty().append(
				$('<span>').html('sort by: '),
				$('<ul>').append(
					$('<li>').append(
						$('<a>').html('Title & Subtitle'),
						$('<a>').html('Format'),
						$('<a>').html('Availability')
					)
				)
			);
		
		
			return this;
		}
	});
})