(function ($) {
	"use strict";

	$.fn.adcImageSelect = function adcImageSelect(options) {

		(options.responseWidth = options.responseWidth || "auto");
		(options.responseHeight = options.responseHeight || "auto");
		(options.isSingle = Boolean(options.isSingle));
		(options.isMultiple = Boolean(options.isMultiple));
		(options.animate = Boolean(options.animate));
		(options.autoForward = Boolean(options.autoForward));

		// Delegate .transition() calls to .animate() if the browser can't do CSS transitions.
		if (!$.support.transition) $.fn.transition = $.fn.animate;
		
		$(this).css({'max-width':options.maxWidth,'width':options.controlWidth});
		$(this).parents('.controlContainer').css({'width':'100%','overflow':'hidden'});
		
		if ( options.controlAlign === "center" ) {
			$(this).parents('.controlContainer').css({'text-align':'center'});
			$(this).css({'margin':'0px auto'});
		} else if ( options.controlAlign === "right" ) {
			$(this).css({'margin':'0 0 0 auto'});
		}
		
		if ( options.columns > 1 )  {
			/*$('.column').width( (100/options.columns) + '%' ).css('float','left')*/ 
			$('.column').css({'display':'block','width':'100%'});
			$('.responseItem').css({'display':'block','float':'left'});
		}
		
		// Global variables
		var $container = $(this),
			items = options.items,
            isMultiple = options.isMultiple,
			total_images = $container.find("img").length,
			images_loaded = 0;
		
		// For multi-coded question
		// Add the @valueToAdd in @currentValue (without duplicate)
		// and return the new value
		function addValue(currentValue, valueToAdd) {
			if (currentValue == '') {
				return valueToAdd;
			}

			var arr = String(currentValue).split(','), i, l, wasFound = false;

			for (i = 0, l = arr.length; i < l; i += 1) {
				if (arr[i] == valueToAdd) {
					wasFound = true;
					break;
				}
			}

			if (!wasFound) {
				currentValue += ',' + valueToAdd;
			}
			return currentValue;
		}

		// For multi-coded question
		// Remove the @valueToRemove from the @currentValue
		// and return the new value
		function removeValue(currentValue, valueToRemove) {
			if (currentValue === '') {
				return currentValue;
			}
			var arr = String(currentValue).split(','),
                        i, l,
                        newArray = [];
			for (i = 0, l = arr.length; i < l; i += 1) {
				if (arr[i] != valueToRemove) {
					newArray.push(arr[i]);
				}
			}
			currentValue = newArray.join(',');
			return currentValue;
		}
		
		// Select a statement
		// @this = target node
		function selectStatementSingle() {

			var $input = items[0].element,
				$target = $(this),
				value = $target.attr('data-value');

			$container.find('.selected').removeClass('selected').css('filter','');
			$target.addClass('selected');
			$input.val(value);
			
			// if auto forward do something
			if ( options.autoForward ) $(':input[name=Next]:last').click();
		}
		
		// Select a statement for multiple
		// @this = target node
		function selectStatementMulitple() {
			
			var $target = $(this),
				value = $target.data('value'),
				$input = items[$target.data('id')].element,
				isExclusive = items[$target.data('id')].isExclusive,
				currentValue = $input.val();

			if ($target.hasClass('selected')) {
				// Un-select

				$target.removeClass('selected').css('filter','');
				//$input.prop('checked', false);
				currentValue = removeValue(currentValue, value);
			} else {

				// Select

				if (!isExclusive) {
					
					// Check if any exclusive
					currentValue = addValue(currentValue, value);

					// Un-select all exclusives
					$container.find('.exclusive').each(function forEachExclusives() {
						$(this).removeClass('selected').css('filter','');
						currentValue = removeValue(currentValue, $(this).data('value'));
					});

				} else {

					// When exclusive un-select all others
					$container.find('.selected').removeClass('selected').css('filter','');
					currentValue = value;

				}
				$target.addClass('selected');
			}

			// Update the value
			$input.val(currentValue);
		}
				
		// add ns to last x items
		if ( options.numberNS > 0 ) $('.responseItem').slice(-options.numberNS).addClass('ns');
		
		// Retrieve previous selection
		if ( !isMultiple ) {
			
			var $input = items[0].element;
			var currentValue = $input.val();
								
			$container.find('.responseItem').each(function () {
				var value = $(this).attr('data-value'),
					isSelected = $(this).attr('data-value') == currentValue ? true : false;
				if (isSelected) {
					$(this).addClass('selected');
				} else {
					$(this).removeClass('selected').css('filter','');
				}
			});
		
		} else if ( isMultiple ) {
			
			var $input = items[0].element;
			var currentValues = String($input.val()).split(","),
				currentValue;
			
			for ( var i=0; i<currentValues.length; i++ ) {
				//currentValue = items[i].element.val();
				currentValue = currentValues[i];
				$container.find('.responseItem').each(function () {
					var value = $(this).attr('data-value'),
						isSelected = $(this).attr('data-value') == currentValue ? true : false;
					if (isSelected) {
						$(this).addClass('selected');
					}
				});
				
			}
		}
		
		// Attach all events
		//$container.delegate('.responseItem', 'click', (!isMultiple) ? selectStatementSingle : selectStatementMulitple);
		if ( total_images > 0 ) {
			$container.find('img').each(function() {
				var fakeSrc = $(this).attr('src');
				$("<img/>").css('display', 'none').load(function() {
					images_loaded++;
					if (images_loaded >= total_images) {
						// now all images are loaded.
						
						if ( options.forceResponseSize === 'no' ) {
							//$('.responseItem').width($('.responseItem').width());
						} else if ( options.forceResponseSize === 'width' ) {
							$('.responseItem').width( options.forcedResponseWidth );
						} else if ( options.forceResponseSize === 'height' ) {
							$('.responseItem').height( options.forcedResponseHeight );
						} else if ( options.forceResponseSize === 'both' ) {
							$('.responseItem').width( options.forcedResponseWidth ).height( options.forcedResponseHeight );
						}
						
						// Check for missing images and resize
						$container.find('.responseItem img').each(function forEachImage() {
							var size = {
								width: $(this).width(),
								height: $(this).height()
							};
							
							if (options.forceImageSize === "height" ) {
								if ( size.height > options.maxImageHeight ) {
									var ratio = (options.maxImageHeight / size.height);
									size.height *= ratio,
									size.width  *= ratio;
								} /*else applyPaddingTo = "height";*/
							} else if (options.forceImageSize === "width" ) {
								if ( size.width > options.maxImageWidth) {
									var ratio = (options.maxImageWidth / size.width);
									size.width  *= ratio,
									size.height *= ratio;
								} /*else applyPaddingTo = "width";*/
								
							} else if (options.forceImageSize === "both" ) {
								if (options.maxImageHeight > 0 && size.height > options.maxImageHeight) {
									var ratio = (options.maxImageHeight / size.height);
									size.height *= ratio,
									size.width  *= ratio;
								}
					
								if (options.maxImageWidth > 0 && size.width > options.maxImageWidth) {
									var ratio = (options.maxImageWidth / size.width);
									size.width  *= ratio,
									size.height *= ratio;
								}
							} 
							$(this).css(size);
						});
						
						$container.on('click', '.responseItem', (!isMultiple) ? selectStatementSingle : selectStatementMulitple);
						$container.css('visibility','visible');
						
						if ( options.animate ) {
							var delay = 0,
								easing = (!$.support.transition)?'swing':'snap';
							
							$container.find('.responseItem').each(function forEachItem() {
								$(this).css({ y: 2000, opacity: 0 }).transition({ y: 0, opacity: 1, delay: delay }, options.animationSpeed, easing);
								delay += 30;
							});
						}
					}
				}).attr("src", fakeSrc);
			});
		} else {
			$container.on('click', '.responseItem', (!isMultiple) ? selectStatementSingle : selectStatementMulitple);
			$container.css('visibility','visible');
			
			if ( options.animate ) {
				var delay = 0,
					easing = (!$.support.transition)?'swing':'snap';
				
				$container.find('.responseItem').each(function forEachItem() {
					$(this).css({ y: 2000, opacity: 0 }).transition({ y: 0, opacity: 1, delay: delay }, options.animationSpeed, easing);
					delay += 30;
				});
			}
		}

		// Returns the container
		return this;
	};

} (jQuery));