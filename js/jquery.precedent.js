/*
  
  Precedent.js — because every other placeholder script was terrible.
  
  1. Add the placeholder attribute as normal.
  2. Add the data-semiplacehold attribute if 
     you want some prefilled text and some placeholder text.
  3. $(el).precedent();
  
  /by @mattrobs
  /exceptionalthanks to @taybenlor for helping me write OO.

*/

(function($) {

  // This represents an object "placeholder"
  var Placeholder = function($element, options){
    
    // set up
    this.$input = $element;
    this.input = $element[0];
    this.$input.prefilled = this.$input.val();
    
    this.options = options || {};
    // When semiplacehold, say so
    if (this.$input.attr('data-semiplacehold') || this.$input.attr('data-semiplacehold') == '') {
      this.options.semiplacehold = true;
    }
    
    // When semiplaceheld
    if (this.options.semiplacehold) {
      // Remove the prefilled text from the placeholder text
      this.placeholderText = this.$input.attr('placeholder').split(this.$input.prefilled)[1];
    // Standard placeholder
    } else {
      this.placeholderText = this.$input.attr('placeholder');
    }
    
    // The placeholder text
    this.$placeholder = $('<div class="placeholder">')
      .css({ 
        position: 'absolute',
        pointerEvents: 'none',
        whiteSpace: 'pre-wrap', // don't collapse whitespace
        paddingTop: parseInt(this.$input.css('paddingTop')) + parseInt(this.$input.css('borderTopWidth')) + 'px',
        paddingLeft: parseInt(this.$input.css('paddingLeft')) + 1 + 'px',
        paddingRight: this.$input.css('paddingRight')
      })
      .text(this.placeholderText)
    ;
    
    // Copy textarea text into an element so we can measure its width
    this.$prefilledTextWhenSemiPlaceholder = $('<pre>')
      //.hide()
      .text(this.$input.prefilled)
      .css({
        fontFamily: this.$input.css('fontFamily'),
        display: 'inline',
        position: 'absolute',
        top: '-999999px', // IE doesn't like it when hidden elements are measured
        left: '-999999px'
      })
    ;
    
    // Wrap the whole thing
    this.$placeholderWrapper = $('<div class="placeholder-wrapper">');
    this.$placeholderWrapper
      .css({
        position: 'relative',
        width: this.$input.outerWidth() + "px",
        lineHeight: this.$input.css('lineHeight'),
        fontSize: this.$input.css('fontSize'),
        fontFamily: this.$input.css('fontFamily')  
      })
      .html(this.$placeholder)
    ;
    
    // Wrap input field in placeholder wrapper
    // Don't use .wrap() because it clones it.
    this.$input.before(this.$placeholderWrapper).appendTo(this.$placeholderWrapper);
    this.$prefilledTextWhenSemiPlaceholder.appendTo(this.$placeholderWrapper);
    
    // Prevent native placeholder rendering
    this.$input.removeAttr('placeholder');
        
    // Check textarea value on load
    this.togglePlaceholder();
    
    // Position the placeholder text adjacent the real text
    if (this.options.semiplacehold) { this.positionSemiPlaceholder() }
    
    // Do all our event binding in one place
    this.bindEvents();
    
  };
  
  Placeholder.prototype.bindEvents = function(){
    /*
     * The idea here is to place the functionality of these bound events
     * into methods on the Placeholder class. That way if you need to duplicate
     * them you can easily do that. Or if you need to call other methods on
     * the class you can do that too.
     * It's also slightly more nice and organised.
     */
 
    // Nasty hack because jQuery overrides "this"
    // Cleaner with CoffeeScript or Underscore
    var self = this;
    
    //  .bind('eventType.namespace')
    this.$placeholder.bind('mousedown.precedent', function(event){
      self.focusInput();
    });
      
    this.$input.bind('focus.precedent', function(event) {
      self.focusPlaceholder();
      //self.focusInput();
    });
  
    this.$input.bind('blur.precedent', function() {
      self.unfocusPlaceholder();
    });
    
    // oninput is like onkeydown, but allows .val() to update correctly.
    // Using Andy Earnshaw's plugin, uses HTML5 oninput event or onpropertychange for IE.
    // Andy saved me a metric shit-tonne of work. 
    this.$input.bind('input.precedent', function() {
      self.togglePlaceholder();
    });

  }
  
  Placeholder.prototype.focusInput = function(){
    // Move the insertion point to the end.
    var el = this.$input[0];
    window.setTimeout(function() { // Chrome bug
      if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
      } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
      }
    }, 1);
  };
  
  Placeholder.prototype.focusPlaceholder = function(){
    this.$placeholder.addClass('focus');
  };
  
  Placeholder.prototype.unfocusPlaceholder = function(){
    this.$placeholder.removeClass('focus');
  };
  
  Placeholder.prototype.togglePlaceholder = function() {
    
    if (this.options.semiplacehold) {
      
      this.$input.userEnteredText = this.$input.val().split(this.$input.prefilled)[1];
      
      // If you haven't typed anything
      if (this.$input.val() == this.$input.prefilled) {
        // Show
        this.$placeholder.removeClass('hidden');
        this.$placeholder.html(this.placeholderText);
        this.positionSemiPlaceholder();
        
      // If user-typed value starts with the placeholder copy
      } else if (this.$input.userEnteredText && this.placeholderText.slice(0, this.$input.userEnteredText.length) == this.$input.userEnteredText) {
      
        // ammend the placeholder text
        // make placeholder what the user hasn't typed yet
        this.placeholderTextNew = this.placeholderText.split(this.$input.userEnteredText)[1];

        // ammend the placeholder text
        this.$placeholder.html(this.placeholderTextNew);
        this.positionSemiPlaceholder();
        
        // Show
        this.$placeholder.removeClass('hidden');
      
      // If they delete the prefilled text
      } else if (this.$input.prefilled.slice(0, this.$input.val().length) == this.$input.val()) {
        
        if (this.$input.val() == '') {
          this.placeholderTextNew = this.$input.prefilled + this.placeholderText;
        } else {
          this.placeholderTextNew = this.$input.prefilled.split(this.$input.val())[1] + this.placeholderText;
        }
        
        // ammend the placeholder text
        this.$placeholder.html(this.placeholderTextNew);
        this.positionSemiPlaceholder();
        
        // Show
        this.$placeholder.removeClass('hidden');
        
      } else {
        // Hide
        this.$placeholder.addClass('hidden');
      }
      
    // not semiplacehold  
    } else { 
    
      // If it's empty (trimming whitespace)
      if (jQuery.trim(this.$input.val()) == '') {
        // Show
        this.$placeholder.removeClass('hidden');
      } else {
        // Hide
        this.$placeholder.addClass('hidden');
      }
      
    }
  };
  
  Placeholder.prototype.positionSemiPlaceholder = function() {
    
    this.$prefilledTextWhenSemiPlaceholder.html(this.$input.val());
    this.$placeholder.css({
      textIndent: this.$prefilledTextWhenSemiPlaceholder.width()
    });
  
  };
  
  Placeholder.prototype.cleanUp = function(){
    //Do Cleaning tasks here
  };
  
  var placeholders = [];
  
  $.fn.precedent = function(options){
    // Iterate over all the elements and initialise placeholder for them.
    this.filter('input, textarea').each(function() {
      precendented_elements.push(new Placeholder($(this), options));
    });
    
    return this; //Don't break jQuery chaining
  };
  
  //Cleans up particular elements, use like $('.blah').precendentCleanUp()
  $.fn.precedentCleanUp = function(options){
    var matching_indexes = [];
    var $els = this.filter('input, textarea');
    
    //Clean up all the placeholders who have an el in the set of els
    $.each(placeholders, function(i, placeholder){
      $.each($els, function(j, el){
        if(placeholder.$input[0] === el){
          placeholder.cleanUp();
          matching_indexes.push(i);
        }
      });
    });
    
    //Remove all the ones we cleaned up from the list of placeholders
    $.each(matching_ids, function(i, index){
      placeholders = placeholders.splice(index, 1);
    });
    
    return this;
  };
  
  //Cleans up all precedents, use like $.precedentCleanUp()
  $.precendentCleanUp = function(options){
    $.each(placeholders, function(i, placeholder){
      placeholder.cleanUp();
    });
    
    placeholders = [];
  };
  
})(jQuery);