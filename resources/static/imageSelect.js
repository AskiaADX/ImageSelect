(function () {

    // Polyfill: Add a getElementsByClassName function IE < 9
    function polyfillGetElementsByClassName() {
        if (!document.getElementsByClassName) {
            document.getElementsByClassName = function(search) {
                var d = document, elements, pattern, i, results = [];
                if (d.querySelectorAll) { // IE8
                    return d.querySelectorAll("." + search);
                }
                if (d.evaluate) { // IE6, IE7
                    pattern = ".//*[contains(concat(' ', @class, ' '), ' " + search + " ')]";
                    elements = d.evaluate(pattern, d, null, 0, null);
                    while ((i = elements.iterateNext())) {
                        results.push(i);
                    }
                } else {
                    elements = d.getElementsByTagName("*");
                    pattern = new RegExp("(^|\\s)" + search + "(\\s|$)");
                    for (var j = 0, l = elements.length; j < l; j++) {
                        if ( pattern.test(elements[j].className) ) {
                            results.push(elements[j]);
                        }
                    }
                }
                return results;
            }
        }
    }

    function hasClass(el, className) {
        return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className);
    }

    function addClass(el, className) {
        if (el.classList) el.classList.add(className);
        else if (!hasClass(el, className)) el.className += ' ' + className;
    }

    function removeClass(el, className) {
        if (el.classList) el.classList.remove(className);
        else el.className = el.className.replace(new RegExp('\\b'+ className+'\\b', 'g'), '');
    }

    /**
   * Add zoom to images present in the loop responses
   *
   * @param {string} strId Id of the zoom
   */
    function simplboxConstructorCall(strId) {
        var preLoadIconOn = function () {
            var newE = document.createElement("div"),
                newB = document.createElement("div");
            newE.setAttribute("id", "simplbox-loading");
            newE.appendChild(newB);
            document.body.appendChild(newE);
        },
            preLoadIconOff = function () {
                var elE = document.getElementById("simplbox-loading");
                elE.parentNode.removeChild(elE);
            },
            overlayOn = function () {
                var newA = document.createElement("div");
                newA.setAttribute("id", "simplbox-overlay");
                document.body.appendChild(newA);
            },
            overlayOff = function () {
              var elA = document.getElementById("simplbox-overlay");
              if (elA) {
                elA.parentNode.removeChild(elA);
              }
            };
        var img = new SimplBox(document.querySelectorAll("[data-simplbox='" + strId + "']"), {
            quitOnImageClick: true,
            quitOnDocumentClick: false,
            onStart: overlayOn,
            onEnd: overlayOff,
            onImageLoadStart: preLoadIconOn,
            onImageLoadEnd: preLoadIconOff
        });
        img.init();
    }

    function ImageSelect(options) {
        this.instanceId = options.instanceId || 1;
        var container = document.getElementById("adc_" + this.instanceId),
            images = [].slice.call(container.getElementsByTagName("img")),
            total_images = container.getElementsByTagName("img").length;

        function loadImages( images, callback ) {
            var count = 0;

            function check( n ) {
                if( n == total_images ) {
                    callback();
                }
            }

            for( i = 0; i < total_images; ++i ) {
                var src = images[i].src;
                var img = document.createElement( "img" );
                img.src = src;

                img.addEventListener( "load", function() {
                    if( this.complete ) {
                        count++;
                        check( count );
                    }
                });
            }

        }

        window.addEventListener( "load", function() {
            if ( total_images > 0 ) {
                loadImages( images, function() {
                    init(options);
                });
            } else {
                init(options);
            }
        });

        // Manage zoom
        var zooms = document.getElementById('adc_' + this.instanceId).querySelectorAll('.responseItem');
        for (var l1 = 0, k1 = zooms.length; l1 < k1; l1++) {
            simplboxConstructorCall(zooms[l1].getAttribute('data-id'));
        }

    }

    function init(options) {

        this.instanceId = options.instanceId || 1;
        this.options = options;
        (options.responseWidth = options.responseWidth || "auto");
        (options.responseHeight = options.responseHeight || "auto");
        (options.isSingle = Boolean(options.isSingle));
        (options.isMultiple = Boolean(options.isMultiple));
        (options.autoForward = Boolean(options.autoForward));
        (options.currentQuestion = options.currentQuestion || '');

        polyfillGetElementsByClassName();
        var container = document.getElementById("adc_" + this.instanceId),
            columns =  container.getElementsByClassName('column'),
            responseItems =  [].slice.call(container.getElementsByClassName('responseItem')),
            images = container.getElementsByTagName("img"),
            inputs = [].slice.call(document.getElementsByTagName("input")),
            submitBtns = [],
            nextBtn,
            items = options.items,
            isMultiple = options.isMultiple,
            total_images = container.getElementsByTagName("img").length,
            images_loaded = 0;

        for(var i = 0; i < inputs.length; i++) {
            if(inputs[i].type.toLowerCase() === 'submit') {
                submitBtns.push(inputs[i]);
            }
        }
        nextBtn = document.getElementsByName('Next')[0];

        container.style.maxWidth = options.maxWidth;
        container.style.width = options.controlWidth;
        container.parentNode.style.width = '100%';
        container.parentNode.style.overflow = 'hidden';

        if ( options.controlAlign === "center" ) {
            container.parentNode.style.textAlign = 'center';
            //container.style.margin = '0px auto';
        } else if ( options.controlAlign === "right" ) {
            container.parentNode.style.textAlign = 'right';
            //container.style.margin = '0 0 0 auto';
        }

        if ( options.columns >= 0 )  {
            for ( i=0; i < columns.length; i++ ) {
                columns[i].style.display = "block";
                columns[i].style.width = '100%';
            }
            var numberOfColumns = (options.columns > 0) ? options.columns : 5;
            var style = responseItems[0].currentStyle || window.getComputedStyle(responseItems[0]),
                widthDiff = (responseItems[0].offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight)) - responseItems[0].clientWidth,
                newWidth = ((columns[0].offsetWidth - (widthDiff * numberOfColumns))/numberOfColumns) - 10;
            for ( i=0; i < responseItems.length; i++ ) {
                responseItems[i].style.display = "inline-table";
                responseItems[i].style.width = newWidth+'px';
                //responseItems[i].style.float = 'left';
            }
        }

        // Check for missing images and resize
        for ( i=0; i<images.length; i++) {
            var size = {
                width: images[i].width,
                height: images[i].height
            };

            if (options.forceImageSize === "height" ) {
                if ( size.height > parseInt(options.maxImageHeight,10) ) {
                    var ratio = ( parseInt(options.maxImageHeight,10) / size.height);
                    size.height *= ratio;
                    size.width  *= ratio;
                }
            } else if (options.forceImageSize === "width" ) {
                if ( size.width > parseInt(options.maxImageWidth,10) ) {
                    var ratio = ( parseInt(options.maxImageWidth,10) / size.width);
                    size.width  *= ratio;
                    size.height *= ratio;
                }
            } else if (options.forceImageSize === "both" ) {
                if ( parseInt(options.maxImageHeight,10) > 0 && size.height > parseInt(options.maxImageHeight,10) ) {
                    var ratio = ( parseInt(options.maxImageHeight,10) / size.height);
                    size.height *= ratio;
                    size.width  *= ratio;
                }

                if ( parseInt(options.maxImageWidth,10) > 0 && size.width > parseInt(options.maxImageWidth,10) ) {
                    var ratio = ( parseInt(options.maxImageWidth,10) / size.width);
                    size.width  *= ratio;
                    size.height *= ratio;
                }

            }
            images[i].width = size.width;
            images[i].height = size.height;

        }

        // For multi-coded question
        // Add the @valueToAdd in @currentValue (without duplicate)
        // and return the new value
        function addValue(currentValue, valueToAdd) {

            if (currentValue === '' || currentValue === null) {
                return valueToAdd;
            }
            var arr = String(currentValue).split(','), i, l, wasFound = false;
            for (i = 0, l = arr.length; i < l; i += 1) {
                if (arr[i] === valueToAdd) {
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
            if (currentValue === '' || currentValue === null) {
                return currentValue;
            }
            var arr = String(currentValue).split(','), i, l, newArray = [];
            for (i = 0, l = arr.length; i < l; i += 1) {
                if (arr[i] !== valueToRemove) {
                    newArray.push(arr[i]);
                }
            }
            currentValue = newArray.join(',');
            return currentValue;
        }

        // Select a statement
        // @this = target node
        function selectStatementSingle(target) {

            var input = items[0].element,
                value = target.getAttribute('data-value');

            var selectedElements = [].slice.call(container.getElementsByClassName('selected'));
            for ( i=0; i<selectedElements.length; i++) {
                selectedElements[i].style.filter = '';
                removeClass(selectedElements[i], 'selected');
            }

            addClass(target, 'selected');
            input.value = value;
            if (window.askia && window.arrLiveRoutingShortcut && window.arrLiveRoutingShortcut.length > 0 && window.arrLiveRoutingShortcut.indexOf(options.currentQuestion) >= 0) {
                askia.triggerAnswer();
            }

            // if auto forward do something
            if ( options.autoForward ) {
                // FIX FIX
                //$(':input[name=Next]:last').click();
                nextBtn.click();
            }
        }

        // Select a statement for multiple
        // @this = target node
        function selectStatementMulitple(target) {
            var value = target.getAttribute('data-value'),
                input = document.querySelector(items[target.getAttribute('data-id')].element),
                isExclusive = Boolean(items[target.getAttribute('data-id')].isExclusive),
                currentValue = input.value;

            if (hasClass(target, 'selected')) {
                // Un-select
                target.style.filter = '';
                removeClass(target, 'selected');
                currentValue = removeValue(currentValue, value);
            } else {
                // Select
                if (!isExclusive) {
                    // Check if any exclusive
                    currentValue = addValue(currentValue, value);

                    // Un-select all exclusives
                    var exclusiveElements = [].slice.call(container.getElementsByClassName('exclusive'));
                    for ( i=0; i<exclusiveElements.length; i++) {
                        exclusiveElements[i].style.filter = '';
                        removeClass(exclusiveElements[i], 'selected');
                        currentValue = removeValue(currentValue, exclusiveElements[i].getAttribute('data-value'));
                    }

                } else {

                    // When exclusive un-select all others
                    var exclusiveElements = [].slice.call(container.getElementsByClassName('exclusive'));
                    var selectedElements = [].slice.call(container.getElementsByClassName('selected'));
                    for ( i=0; i<selectedElements.length; i++) {
                        selectedElements[i].style.filter = '';
                        removeClass(selectedElements[i], 'selected');
                    }
                    currentValue = value;
                }
                addClass(target, 'selected');
            }

            // Update the value
            input.value = currentValue;
            if (window.askia && window.arrLiveRoutingShortcut && window.arrLiveRoutingShortcut.length > 0 && window.arrLiveRoutingShortcut.indexOf(options.currentQuestion) >= 0) {
                askia.triggerAnswer();
            }
        }

        // add ns to last x items
        if ( options.numberNS > 0 ) {
            var nsItems = responseItems.slice(-options.numberNS);
            for ( i=0; i<nsItems.length; i++) {
                addClass(nsItems[i], 'ns');
                nsItems[i].style.filter = '';
            }
        }

        // Retrieve previous selection
        if ( !isMultiple ) {
            var input = items[0].element,
                currentValue = input.value;

            for ( i=0; i<responseItems.length; i++) {
                responseItems[i].setAttribute('data-id', i);
                var value = responseItems[i].getAttribute('data-value'),
                    isSelected = responseItems[i].getAttribute('data-value') === currentValue ? true : false;
                if (isSelected) {
                    addClass(responseItems[i], 'selected');
                } else {
                    responseItems[i].style.filter = '';
                    removeClass(responseItems[i], 'selected');
                }
            }
        } else if ( isMultiple ) {
            var input = document.querySelector(items[0].element),
                currentValues = String(input.value).split(","),
                currentValue;

            for ( i=0; i<currentValues.length; i++ ) {
                currentValue = currentValues[i];
                for ( var j=0; j<responseItems.length; j++) {
                    if ( !hasClass( responseItems[j], 'exclusive' ) ) addClass( responseItems[j], 'cb' );
                    responseItems[j].setAttribute('data-id', j);
                    var value = responseItems[j].getAttribute('data-value'),
                        isSelected = responseItems[j].getAttribute('data-value') == currentValue ? true : false;
                    if (isSelected) {
                        addClass(responseItems[j], 'selected');
                    }
                }
            }
        }

        // Attach all events
        for ( i=0; i<responseItems.length; i++) {
            responseItems[i].onclick = function(e){
                (!isMultiple) ? selectStatementSingle(this) : selectStatementMulitple(this);
            };
        }

        setTimeout(
            (function(that){
                document.getElementById("adc_" + that.instanceId).style.visibility = 'visible';
            })(this), 300);
    }

    window.ImageSelect = ImageSelect;
}());
