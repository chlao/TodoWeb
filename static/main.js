// Returns today's date 
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

function addItem(){
	var todoName = $('#todo__name').val();
	var todoPriority = $('input[name=priority]:checked').val();
	var todoDescription = $('#todo__description').val();
	var todoDueDate = $('#todo__dueDate').val();

	$('.todo__list').append('<li class="todo__item"><i class="fa fa-circle ' + 'priority' + todoPriority + '" aria-hidden="true"></i>' + todoName + 
							'<span class="todo__options"><i class="fa fa-lg fa-check todo__complete" aria-hidden="true"></i>' + 
							'<i class="fa fa-lg fa-times-circle todo__delete" aria-hidden="true"></i></span></li>');

	if (todoDueDate != ''){
		var year = parseInt(todoDueDate.slice(0, 4)); 
		var month = parseInt(todoDueDate.slice(5, 7));
		var day = parseInt(todoDueDate.slice(8));

		$('<p>').text('Due: ' + month + '/' + day +'/' + year).addClass('item__dueDate').appendTo('.todo__item:last-child');
	}

	if (todoDescription.trim() != ''){
		$('<p>').text('Description: ' + todoDescription).addClass('item__description').appendTo('.todo__item:last-child').hide();
	}
}

function resetFormValues(){
	$('#todo__name').val('');
	$('.priorityHigh').prop('checked', true);
	$('#todo__description').val('');
	$('#todo__dueDate').val(new Date().toDateInputValue());
}

$(document).ready(function(){
	resetFormValues();

	attachFormListeners();
	attachFilterListeners();
	attachItemListeners();
});

function attachFilterListeners(){
	$('.filter__completed').click(function(){
		$('.todo__item').show();
		$('.todo__item:not(.completed)').hide();

		$('.filter__button').removeClass('selected__filter'); 
		$(this).addClass('selected__filter');
	});

	$('.filter__active').click(function(){
		$('.todo__item').show();
		$('.todo__item.completed').hide();

		$(this).toggleClass('selected__filter');
		$('.filter__button').removeClass('selected__filter'); 
		$(this).addClass('selected__filter');
	});

	$('.filter__all').click(function(){
		$('.todo__item').show();
		$(this).toggleClass('selected__filter');

		$('.filter__button').removeClass('selected__filter'); 
		$(this).addClass('selected__filter');
	});

}

function attachItemListeners(){
	$('.todo__list').on('click', '.todo__delete', function(){
		$(this).parents('.todo__item').remove();

		if ($('.todo__list').children().length <= 0){
			$('.todo__info').hide();
			$('.filter__button').removeClass('selected__filter'); 
		}
	});

	$('.todo__list').on('click', '.todo__complete', function(){
		$(this).parents('.todo__item').toggleClass('completed');

		if ($('.filter__active').hasClass('selected__filter')){
				$(this).parents('.todo__item').hide();
			}
	});

	$('.todo__list').on('click', '.todo__item', function(e){
		if ($(event.target).hasClass('todo__complete')){
			return;
		}
		
		$(this).find('.item__description').slideToggle();
	});
}

function attachFormListeners(){
	$('.todo__form').submit(function(e){
		e.preventDefault();

		if ($('#todo__name').val().trim() === ''){
			$('.error__message').show();
		} else{
			addItem();
			$('.todo__info').show();
			$('.error__message').hide();

			if ($('.filter__completed').hasClass('selected__filter')){
				$('todo__item:last-child').hide();
			}
		}

		resetFormValues();
	});

	$('.addarrow').click(function(){
		$('.todo__form').slideToggle();
	});
}