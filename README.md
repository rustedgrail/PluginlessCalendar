A calendar for the browser that doesn't require any plugins.  You can make multiple calendars with 

```javascript
var calendar = new Calendar("calendar id");
```

and show the calendar with

```javascript
calendar.showCalendar(input, minDate)
```

You can pass an input to showCalendar and it will use that input as the default date, change the input when a date is selected and appear next to the input.  The calendar also takes in a minimum date that you cannot select less than.  Both arguments are optional.

To change what happens when a date is selected, call

```javascript
calendar.setCallback(function(selectedDate) {
    //your function
    //selected Date will look like {year: 2012, month: 0, day: 1} for Jan 1st, 2012
});
```
