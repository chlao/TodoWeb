// Returns today's date 
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

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
											'<i class="fa fa-circle ' + 'priority--' + data[i].priority + '" aria-hidden="true"></i>' + 
											'<div class="todo__options">' + 
												'<i class="fa fa-lg fa-check todo__complete" aria-hidden="true"></i>' + 
												'<i class="fa fa-pencil todo__edit" aria-hidden="true"></i>' + 
												'<i class="fa fa-lg fa-times-circle todo__delete" aria-hidden="true"></i>' + 
											'</div>' + 
											'<p class="item__name">' + data[i].name + '</p>' +
											'<div class="item__details">' + 
												'</div></li>');

				if (data[i].duedate !== ''){
					$('.todo__item:last-child .item__details').append('<p class="item__dueDate"><span class="item__title">Due:</span>' + data[i].dueDate + '</p>'); 
				}

				if (data[i].description !== ''){
					$('.todo__item:last-child .item__details').append('<p class="item__description"><span class="item__title">Description:</span>' + data[i].description + '</p>'); 
					$('<i class="fa fa-lg fa-angle-down expandItem" aria-hidden="true"></i>').insertAfter('.todo__item:last-child .item__name'); 
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

	todoDueDate = convertFromDateToString(todoDueDate); 

	$('.todo__list').append('<li class="todo__item">' + 
								'<i class="fa fa-circle ' + 'priority--' + todoPriority + '" aria-hidden="true"></i>' + 
								'<div class="todo__options">' + 
									'<i class="fa fa-lg fa-check todo__complete" aria-hidden="true"></i>' + 
									'<i class="fa fa-pencil todo__edit" aria-hidden="true"></i>' + 
									'<i class="fa fa-lg fa-times-circle todo__delete" aria-hidden="true"></i>' + 
								'</div>' + 
								'<p class="item__name">' + todoName + '</p>' +
								'<div class="item__details">' + 
									'</div></li>');


	if (todoDueDate !== ''){
		$('.todo__item:last-child .item__details').append('<p class="item__dueDate"><span class="item__title">Due:</span>' + todoDueDate + '</p>'); 
	} 

	if (todoDescription.trim() !== ''){
		$('.todo__item:last-child .item__details').append('<p class="item__description"><span class="item__title">Description:</span>' + todoDescription + '</p>'); 
		$('<i class="fa fa-lg fa-angle-down expandItem" aria-hidden="true"></i>').insertAfter('.todo__item:last-child .item__name'); 
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

	var newItemName = $('.item__name--edit').val();
	var newItemDueDate = convertFromDateToString($('.item__dueDate--edit').val()); 
	var newItemDescription = $('.item__description--edit').val();
	var newItemPriority = $('input[name=priority--edit]:checked').val();
	var completed = item.hasClass('completed') ? 1 : 0; 

	$.ajax({
		type: 'PUT', 
		url: '/todoitems/' + item_id,
		data: { name: newItemName, 
				priority: newItemPriority, 
				dueDate: newItemDueDate,
				description: newItemDescription, 
				completed: completed }, 
		error: function(err){
			console.log(err);
		},
		success: function(){
			nonEditItemState();
		}
	}); 
}

function editItemState(item){
	var itemName =item.find('.item__name'); 
	var itemDueDate = item.find('.item__dueDate'); 
	var itemDescription = item.find('.item__description'); 
	var itemPriority = item.find('.fa-circle[class*="priority"]'); 

	var itemNameVal = itemName.text();

	var itemDueDateVal = itemDueDate.text().split(':')[1]; 
	itemDueDateVal = convertFromStringToDate(itemDueDateVal); 

	var itemDescriptionVal = itemDescription.text().split(':').slice(1);

	itemPriorityVal = getPriority(itemPriority).toLowerCase(); 

	console.log(itemDescription);

	$(itemName).prop('contenteditable', 'true'); 
	placeCaretAtEnd(itemName.get(0));
	/*
	$(itemName).replaceWith('<input class="form__textbox form__textbox--edit item__name--edit" type="text">');
	$('.item__name--edit').val(itemNameVal); 
	*/
	//$(itemDueDate).replaceWith('<input class="form__textbox form__textbox--edit item__dueDate--edit" type="date">'); 
	$('<input class="form__textbox form__textbox--edit item__dueDate--edit" type="date">').insertAfter(itemDueDate); 
	$('.item__dueDate--edit').val(itemDueDateVal); 

	$('<fieldset class="inputgroup item__priority--edit">' + 
		'<input id="priority__high--edit" type="radio" name="priority--edit" value="High">' +
		'<label for="priority__high--edit">High</label>' +
		'<br>' + 
		'<input id="priority__normal--edit" type="radio" name="priority--edit" value="Normal">' +
		'<label for="priority__norma--editl">Normal</label>' + 
		'<br>' + 
		'<input id="priority__low--edit" type="radio" name="priority--edit" value="Low">' + 
		'<label for="priority__low--edit">Low</label>' + 
		'</fieldset>').insertAfter($('.item__dueDate--edit')); 
	$('.item__priority--edit #priority__' +  itemPriorityVal + '--edit').prop('checked', true);

	if ($(itemDescription).length < 1){
		item.find('.item__details').append('<textarea class="form__textbox form__textbox--edit item__description--edit" placeholder="Description"></textarea>');
	} else {
		$('<textarea class="form__textbox form__textbox--edit item__description--edit"></textarea>').insertAfter(itemDescription); 
		//$(itemDescription).replaceWith('<textarea class="form__textbox form__textbox--edit item__description--edit"></textarea>');
		$('.item__description--edit').val(itemDescriptionVal);
	}

	item.find('.item__details').append('<input class="todo__submit todo__submit--edit" type="submit">');
	$('.todo__submit').on('click', function(){
		updateItem(item); 
	}); 

	item.addClass('editing'); 
}

function nonEditItemState(){
	var newItemName = $('.item__name--edit').val();
	var newItemDueDate = convertFromDateToString($('.item__dueDate--edit').val()); 
	var newItemDescription = $('.item__description--edit').val();
	var newItemPriority = $('input[name=priority--edit]:checked').val();

	$('.editing .item__name--edit').replaceWith('<p class="item__name">' + newItemName + '</p>');
	$('.editing .item__dueDate--edit').replaceWith('<p class="item__dueDate"><span class="item__title">Due:</span>' + newItemDueDate + '</p>'); 
	$('.editing .item__description--edit').replaceWith('<p class="item__description"><span class="item__title">Description:</span>' + newItemDescription + '</p>');
	$('.editing .item__description').hide();

	var prevPriority = getPriority($('.editing .fa-circle[class*="priority"]')); 
	if (newItemPriority != prevPriority){
		$('.editing .fa-circle[class*="priority"]').addClass('priority--' + newItemPriority); 
		$('.editing .fa-circle[class*="priority"]').removeClass('priority--' + prevPriority); 
	}

	$('.item__priority--edit').remove();
	$('.todo__submit--edit').remove();

	$('.editing').removeClass('editing'); 
}

function getPriority(itemPriority){
	var itemPriorityVal = itemPriority.attr('class').split(' '); 
	for (var i = itemPriorityVal.length -1; i >= 0; i--){
		if (itemPriorityVal[i].indexOf('priority') > -1){
			itemPriorityVal = itemPriorityVal[i]; 
			break;
		}
	}

	return itemPriorityVal.split('--')[1]; 
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

// Converts from YYYY-MM-DD to 
function convertFromDateToString(todoDueDate){
	var year = parseInt(todoDueDate.slice(0, 4)); 
	var month = parseInt(todoDueDate.slice(5, 7));
	var day = parseInt(todoDueDate.slice(8));

	return month + '/' + day +'/' + year;
}

// Converts from MM/DD/YYYY to YYYY-MM-DD
function convertFromStringToDate(itemDueDate){
	console.log(itemDueDate);
	itemDueDateVal = itemDueDate.split('/');

	if (itemDueDateVal[0].length < 2){
			itemDueDateVal[0] = '0' + itemDueDateVal[0]; 
	}	

	if (itemDueDateVal[1].length < 2){
		itemDueDateVal[1] = '0' + itemDueDateVal[1]; 	
	}

	return itemDueDateVal[2] + '-' + itemDueDateVal[0] + '-' + itemDueDateVal[1];
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
		var item = $(this).parents('.todo__item'); 

		// If an item is already being edited 
		if ($('.editing').length > 0){
			var prevItem = $('.editing'); 
			nonEditItemState();
			// Check if clicked on a different item 
			if(!prevItem.is(item)){
				editItemState(item);
			}
		} else {
			editItemState(item); 
		}
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