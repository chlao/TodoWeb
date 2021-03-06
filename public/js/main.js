var todoweb = {
	numCompletedItems: 0, 
	numItems: 0
};

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

// Converts from YYYY-MM-DD to 
function convertFromDateToString(todoDueDate){
	if (todoDueDate == ''){
		return null; 
	}

	todoDueDateObject = new Date(todoDueDate);

	var year = todoDueDateObject.getFullYear();
	var month = todoDueDateObject.getMonth() + 1;
	var day = todoDueDateObject.getDate() + 1;

	if (year !== year || month !== month || day !== day){
		return null; 
	}

	return month + '/' + day +'/' + year;
}

// Converts from MM/DD/YYYY to YYYY-MM-DD
function convertFromStringToDate(itemDueDate){
	itemDueDateVal = itemDueDate.trim().split('/');

	if (itemDueDateVal[0].length < 2){
			itemDueDateVal[0] = '0' + itemDueDateVal[0]; 
	}	

	if (itemDueDateVal[1].length < 2){
		itemDueDateVal[1] = '0' + itemDueDateVal[1]; 	
	}

	if (itemDueDateVal[2].length < 4){
		var str = ''; 
		for (var i = 0; i < (4 - itemDueDateVal[2].length); i++){
			str += '0'; 
		}
		itemDueDateVal[2] = str + itemDueDateVal[2]; 
	}

	return itemDueDateVal[2] + '-' + itemDueDateVal[0] + '-' + itemDueDateVal[1];
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

function updateItemsLeft(){ 
	$('.itemsLeft').text((todoweb.numItems - todoweb.numCompletedItems) + ' left'); 
}

$(document).ready(function(){
	resetFormValues();

	attachFormListeners();
	attachFilterListeners();
	attachItemListeners();

	readItems();
});

function readItems(){
	$.ajax({
		type: 'GET', 
		url: '/todoitems',
		datatype: 'json',
		error: function(err){
			handleError(err); 
		}, 
		success: function(data){ 
			var numItems = data.length; 

			if (numItems){
				$('.todo__info').show();
			}
			// Add database items to list  
			for (var i = 0; i < numItems; i++){
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

				if (data[i].dueDate !== ''){
					$('.todo__item:last-child .item__details').append('<p class="item__dueDate"><span class="item__title">Due: </span><span class="item__content"> ' + data[i].dueDate + '</span></p>'); 
				} 

				if (data[i].description !== ''){
					$('.todo__item:last-child .item__details').append('<p class="item__description"><span class="item__title">Description: </span><span class="item__content"> ' + data[i].description + '</span></p>'); 
					$('.todo__item:last-child').append('<i class="fa fa-lg fa-angle-down expandItem" aria-hidden="true"></i>');
					$('.todo__item:last-child .item__description').hide();
				}

				if (data[i].completed == 1){
					$('.todo__list .todo__item:last-child').addClass('completed'); 
					todoweb.numCompletedItems++; 
				}
			}
			todoweb.numItems = numItems; 
			updateItemsLeft();
		}
	}); 
}

function addItem(){
	var todoName = $('#todo__name').val();
	var todoPriority = $('input[name=priority]:checked').val();
	var todoDueDate = $('#todo__dueDate').val();
	todoDueDate = convertFromDateToString(todoDueDate); 
	var todoDescription = $('#todo__description').val();

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

			if (todoDueDate != null){
				$('.todo__item:last-child .item__details').append('<p class="item__dueDate"><span class="item__title">Due: </span><span class="item__content"> ' + todoDueDate + '</span></p>'); 
			} 

			if (todoDescription.trim() !== ''){
				$('.todo__item:last-child .item__details').append('<p class="item__description"><span class="item__title">Description: </span><span class="item__content"> ' + todoDescription + '</span></p>'); 
				$('.todo__item:last-child').append('<i class="fa fa-lg fa-angle-down expandItem" aria-hidden="true"></i>');
				$('.todo__item:last-child .item__description').hide();
			} 

			todoweb.numItems++; 
			updateItemsLeft();

			$('.todo__list .todo__item:last-child').attr('id', "item_" + data.id); 
			$("html, body").animate({ scrollTop: $(document).height() }, 250);
			$('.todo__list').prop('scrollTop', $('.todo__list').prop('scrollHeight')); 
		}
	}); 
}

function deleteItem(item){
	var item_id = item.attr('id').split('_')[1]; 
	var completed = item.hasClass('completed') ? 1 : 0; 

	$.ajax({
		type: 'DELETE', 
		url: '/todoitems/' + item_id,
		error: function(err){
			console.log(err);
		},
		success: function(){
			item.slideUp('normal', function(){$(this).remove();});

			if ($('.todo__list').length === 0){
				$('.todo__info').hide();
			}

			todoweb.numItems--; 
			if (completed){
				todoweb.numCompletedItems--;
			}
			updateItemsLeft();
		}
	}); 
}

function updateItem(item){
	var item_id = item.attr('id').split('_')[1]; 

	var newItemName = $('.item__name--edit').text();
	var newItemDueDate = convertFromDateToString($('.item__dueDate--edit').val()); 
	var newItemDescription = $('.item__description--edit').val();
	var newItemPriority = $('input[name=priority--edit]:checked').val();

	if (newItemName.trim() == ''){
		$('.error__message').text("Please provide a task name").show();
		return;
	}

	$.ajax({
		type: 'PUT', 
		url: '/todoitems/' + item_id,
		data: { name: newItemName, 
				priority: newItemPriority, 
				dueDate: newItemDueDate,
				description: newItemDescription }, 
		error: function(err){
			handleError(err); 
		},
		success: function(){	
			$('.editing .item__name').text(newItemName); 

			if (newItemDueDate == null){
				$('.editing .item__dueDate').remove();
			} else {
				if ($('.editing .item__dueDate').length){
					$('.editing .item__dueDate .item__content').text(newItemDueDate); 
				} else {
					$('.editing .item__details').append('<p class="item__dueDate"><span class="item__title">Due: </span><span class="item__content"> ' + newItemDueDate + '</span></p>')
				}	
			}
		
			if (newItemDescription == ''){
				$('.editing .item__description').remove();
			} else{
				if ($('.editing .item__description').length){
					$('.editing .item__description .item__content').text(newItemDescription);
				} else {
					$('.editing .item__details').append('<p class="item__description"><span class="item__title">Description: </span><span class="item__content"> ' + newItemDescription + '</span></p>');
				}

				$('.editing').append('<i class="fa fa-lg fa-angle-down expandItem" aria-hidden="true"></i>');
			}
			
			$('.editing .item__name--edit').remove();
			$('.editing .item__dueDate--edit').remove();
			$('.editing .item__description--edit').remove();

			var prevPriority = getPriority($('.editing .fa-circle[class*="priority"]')); 
			if (newItemPriority != prevPriority){
				$('.editing .fa-circle[class*="priority"]').addClass('priority--' + newItemPriority); 
				$('.editing .fa-circle[class*="priority"]').removeClass('priority--' + prevPriority); 
			}

			$('.item__priority--edit').remove();
			$('.todo__submit--edit').remove();

			$('.editing').removeClass('editing'); 
		}
	}); 
}

function updateItemCompleted(item){
	var item_id = item.attr('id').split('_')[1]; 
	var completed = !item.hasClass('completed') ? 1 : 0; 

	$.ajax({
		type: 'PUT', 
		url: '/todoitems/' + item_id,
		data: { completed: completed}, 
		error: function(err){
			handleError(err); 
		},
		success: function(){
			item.toggleClass('completed');
			if (item.hasClass('completed')){
				todoweb.numCompletedItems++; 
			} else {
				todoweb.numCompletedItems--; 
			}
			updateItemsLeft();
		}
	}); 
}

function editItemState(item){
	var itemName =item.find('.item__name'); 
	var itemDueDate = item.find('.item__dueDate'); 
	var itemDescription = item.find('.item__description'); 
	var itemPriority = item.find('.fa-circle[class*="priority"]'); 

	var itemNameVal = itemName.text();
	var itemPriorityVal = getPriority(itemPriority).toLowerCase(); 
	var itemDueDateVal; 
	var itemDescriptionVal; 

	$('<p class="item__name--edit" contenteditable="true">' + itemName + '</p>').insertAfter(itemName); 
	$('.item__name--edit').text(itemNameVal);
	placeCaretAtEnd($('.item__name--edit').get(0));

	item.find('.item__details').append('<input class="form__textbox form__textbox--edit item__dueDate--edit" type="date">'); 
	if (itemDueDate.length){
		itemDueDateVal = itemDueDate.find('.item__content').text(); 
		itemDueDateVal = convertFromStringToDate(itemDueDateVal); 
		$('.item__dueDate--edit').val(itemDueDateVal); 
	}

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
		itemDescriptionVal = itemDescription.find('.item__content').text().trim();
		item.find('.item__details').append('<textarea class="form__textbox form__textbox--edit item__description--edit"></textarea>'); 
		$('.item__description--edit').val(itemDescriptionVal);
	}

	item.find('.item__details').append('<button class="todo__submit todo__submit--edit">Update</button>');
	$('.todo__submit').on('click', function(){
		updateItem(item); 
	}); 

	item.addClass('editing'); 
	item.find('.expandItem').remove(); 

	item.find('.item__dueDate').slideUp();
	$(".editing [class$='--edit']:not('.item__name--edit')").slideToggle('normal', function(){
		if ($(this).is(':visible')){
        	$(this).css('display','block');
        }
	});
}

function nonEditItemState(){
	$(".editing [class$='--edit']:not('.item__name--edit')").slideUp('normal', function(){
		//$('.editing .item__content').show();

		$('.editing .item__name--edit').remove();
		$('.editing .item__dueDate--edit').remove();
		$('.editing .item__description--edit').remove();

		$('.item__priority--edit').remove();
		$('.todo__submit--edit').remove();

		if ($('.editing .item__description').length > 0){
			$('.editing').append('<i class="fa fa-lg fa-angle-down expandItem" aria-hidden="true"></i>');
		}
	

		$('.editing').removeClass('editing'); 
	});
}

function handleError(err){
	$('.error__message').text('An error has occured.').show();
	console.log(err); 
}

function resetFormValues(){
	$('#todo__name').val('');
	$('.priorityHigh').prop('checked', true);
	$('#todo__description').val('');
	$('#todo__dueDate').val(new Date().toDateInputValue());
}

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
		updateItemCompleted($(this).parents('.todo__item'));

		if ($('.filter__active').hasClass('selected__filter')){
			$(this).parents('.todo__item').hide();
		}
	});

	$('.todo__list').on('click', '.todo__edit', function(){
		var item = $(this).parents('.todo__item'); 

		item.find('.item__description').hide();

		// If an item is already being edited 
		if ($('.editing').length){
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
		if ($(e.target).hasClass('todo__complete') || $(e.target).hasClass('todo__delete') || $(e.target).hasClass('todo__edit')){
			return;
		}
		
		if (!$(this).hasClass('editing')){
			$(this).find('.item__description').slideToggle();
		}

		$(this).toggleClass('expanded'); 

		if($(this).hasClass('expanded')){
			$(this).find('.expandItem').replaceWith('<i class="fa fa-lg fa-angle-up expandItem" aria-hidden="true"></i>'); 
		} else {
			$(this).find('.expandItem').replaceWith('<i class="fa fa-lg fa-angle-down expandItem" aria-hidden="true"></i>'); 
		}
	});
}

function attachFormListeners(){
	$('.todo__form').submit(function(){
		if ($('#todo__name').val().trim() === ''){
			$('.error__message').text("Please provide a task name").show();
			var width = $('.todo__list').css('width');
			$('.error__message').css('width', width);
			width = parseInt(width.substring(0, width.length - 2));  
			$('.error__message').css('margin-left', '-' + (width/2) + 'px');
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

	$('.addItem').click(function(){
		$('.todo__form').slideToggle();
	});
}