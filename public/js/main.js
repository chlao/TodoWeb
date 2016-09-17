// Returns today's date 
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

function readItems(){
	$.ajax({
		type: 'GET', 
		url: '/todoitems',
		datatype: 'json',
		error: function(err){
			console.log(err); 
		}, 
		success: function(data){
			console.log(data);

			if (data.length > 0){
				$('.todo__info').show();
			}
			// Add database items to list  
			for (var i = 0; i < data.length; i++){
				$('.todo__list').append('<li class="todo__item" id="item_' + data[i].id + '">' + 
											'<i class="fa fa-circle ' + 'priority' + data[i].priority + '" aria-hidden="true"></i>' + 
											'<p class="item__name">' + data[i].name + '</p>' + 
											'<div class="todo__options">' + 
												'<i class="fa fa-lg fa-check todo__complete" aria-hidden="true"></i>' + 
												'<i class="fa fa-pencil todo__edit" aria-hidden="true"></i>' + 
												'<i class="fa fa-lg fa-times-circle todo__delete" aria-hidden="true"></i></div></li>');

				if (data[i].duedate !== ''){
					$('.todo__item:last-child').append('<p class="item__dueDate"><span class="item__title">Due: </span>' + data[i].dueDate + '</p>'); 
				}

				if (data[i].description !== ''){
					$('.todo__item:last-child').append('<p class="item__description"><span class="item__title">Description: </span>' + data[i].description + '</p>'); 
					$('.todo__item:last-child .item__description').hide();
				}

				if (data[i].completed == 1){
					$('.todo__list .todo__item:last-child').addClass('completed'); 
				}
			}
		}
	}); 
}

function addItem(){
	var todoName = $('#todo__name').val();
	var todoPriority = $('input[name=priority]:checked').val();
	var todoDueDate = $('#todo__dueDate').val();
	var todoDescription = $('#todo__description').val();

	$('.todo__list').append('<li class="todo__item">' + 
								'<i class="fa fa-circle ' + 'priority' + todoPriority + '" aria-hidden="true"></i>' + 
								'<p class="item__name">' + todoName + '</p>' + 
								'<div class="todo__options">' + 
									'<i class="fa fa-lg fa-check todo__complete" aria-hidden="true"></i>' + 
									'<i class="fa fa-pencil todo__edit" aria-hidden="true"></i>' + 
									'<i class="fa fa-lg fa-times-circle todo__delete" aria-hidden="true"></i></div></li>');

	if (todoDueDate !== ''){
		var year = parseInt(todoDueDate.slice(0, 4)); 
		var month = parseInt(todoDueDate.slice(5, 7));
		var day = parseInt(todoDueDate.slice(8));

		todoDueDate = month + '/' + day +'/' + year;

		$('.todo__item:last-child').append('<p class="item__dueDate"><span class="item__title">Due: </span>' + todoDueDate + '</p>'); 
	} 

	if (todoDescription.trim() !== ''){
		$('.todo__item:last-child').append('<p class="item__description"><span class="item__title">Description: </span>' + todoDescription + '</p>'); 
		$('.todo__item:last-child .item__description').hide();
	} 

	$.ajax({
		type: 'POST', 
		url: '/todoitems',
		data: { name: todoName, 
				priority: todoPriority, 
				dueDate: todoDueDate, 
				description: todoDescription, 
				completed: 0 }, 
		error: handleError,
		success: function(data){
			$('.todo__list .todo__item:last-child').attr('id', "item_" + data.id); 
		}
	}); 
}

function deleteItem(item){
	var item_id = item.attr('id').split('_')[1]; 

	$.ajax({
		type: 'DELETE', 
		url: '/todoitems/' + item_id,
		error: function(err){
			console.log(err);
		},
		success: function(){
			item.remove();
		}
	}); 
}

function updateItem(item){
	var item_id = item.attr('id').split('_')[1]; 

	$.ajax({
		type: 'PUT', 
		url: '/todoitems/' + item_id,
		data: {completed: 1}, 
		error: function(err){
			console.log(err);
		}
	}); 
}

// TEST 
function handleError(jqXHR, textStatus, errorThrown){
	$('error__message').text(textStatus + ' - ' + errorThrown).show();
	// Remove the item added on the client-side 
	$('.todo__list .todo__item:last-child').remove();
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

	readItems();
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
		deleteItem($(this).parents('.todo__item'));

		if ($('.todo__list').children().length <= 0){
			$('.todo__info').hide();
			$('.filter__button').removeClass('selected__filter'); 
		}
	});

	$('.todo__list').on('click', '.todo__complete', function(){
		$(this).parents('.todo__item').toggleClass('completed');

		if ($(this).parents('.todo__item').hasClass('completed')){
			updateItem($(this).parents('.todo__item'));
		}

		if ($('.filter__active').hasClass('selected__filter')){
				$(this).parents('.todo__item').hide();
			}
	});

	$('.todo__list').on('click', '.todo__edit', function(){
		console.log($(this).parents('.todo__item ').text());
	});

	$('.todo__list').on('click', '.todo__item', function(e){
		if ($(event.target).hasClass('todo__complete') || $(event.target).hasClass('todo__delete') || $(event.target).hasClass('todo__edit')){
			return;
		}
		
		$(this).find('.item__description').slideToggle();
	});
}

function attachFormListeners(){
	$('.todo__form').submit(function(e){

		if ($('#todo__name').val().trim() === ''){
			$('.error__message').text("Please provide a valid entry").show();
		} else{
			addItem();
			$('.todo__info').show();
			$('.error__message').hide();

			if ($('.filter__completed').hasClass('selected__filter')){
				$('todo__item:last-child').hide();
			}
		}

		resetFormValues();
		return false; 
	});

	$('.addarrow').click(function(){
		$('.todo__form').slideToggle();
	});

}