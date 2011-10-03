# Precedent.js

Because every other placeholder script was terrible. 

## Standard placeholdering

For an iOS/Lion-style placeholder in which the placeholder appears and disappers at the last appropriate moment, set the placeholder attribute normally and:

    <input placeholder="Sally Sparrow"/>
    
    $('input').precedent();
    
(You can then style `.placeholder` with CSS.)

## Semi-placeholdering 

To offer some pre-filled content and have the rest as a placeholder suggestion, add the attribute `semiplacehold`:

    <textarea semiplacehold placeholder="You're receiving this email because you're a wonderful customer">
      You're receiving this email because 
    </textarea>
    
    $('textarea').precedent();
    
The `value` will be pre-filled, editable text; and different end-bit in `placeholder` will be offered as a placeholder suggestion. 