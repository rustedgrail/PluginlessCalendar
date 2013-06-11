(function() {
    var month_names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    window.Calendar = function(id) {
        var div = document.createElement('div');
        var selectedCallback = defaultSelectDate;
        var linkedElement, selectedDate, minCalDate, maxCalDate, visibleDate;
        var events = {
            previousMonth: previousMonth
            , nextMonth: nextMonth
            , selectDate: selectDate
            , hideCalendar: hideCalendar
        };

        if (id) { div.id = id; }
        div.className="calendar-box";

        document.body.insertBefore(div, null);
        if (div.addEventListener) {
            div.addEventListener('click', handleEvents);
        }
        else {
            div.attachEvent("onclick", handleEvents);
        }

        return {
            showCalendar: showCalendar
            , hideCalendar: hideCalendar
            , div: div
            , events: events
            , setCallback: setCallback
        };

        function setCallback(callback) {
            selectedCallback = callback;
        }

        function showCalendar(input, startingDate, minDate, maxDate) {
            if (input) {
                alignElement(input);
                linkedElement = input;
            }

            var existing_date = getStartingDate(startingDate, input);
            existing_date.setMinutes(existing_date.getMinutes() + existing_date.getTimezoneOffset());
            var the_year = existing_date.getYear();
            if(the_year < 1900) the_year += 1900;

            selectedDate = {
                year: the_year
                    , month: existing_date.getMonth()
                    , day: existing_date.getDate()
            };

            var calendarText = makeCalendar(the_year, existing_date.getMonth(), minDate, maxDate);
            div.innerHTML = calendarText;
            div.style.display = "block";
        }

        function alignElement(toElem) {
            var xy = getPosition(toElem);
            var width = parseInt(toElem.offsetWidth, 10);
            //Position the div in the correct location
            div.style.left=(xy[0]+width+10)+"px";
            div.style.top=xy[1]+"px";
        }

        function getPosition(ele) {
            var x = 0;
            var y = 0;
            while (ele) {
                x += ele.offsetLeft;
                y += ele.offsetTop;
                ele = ele.offsetParent;
            }
            if (navigator.userAgent.indexOf("Mac") !== -1 && typeof document.body.leftMargin !== "undefined") {
                x += document.body.leftMargin;
                offsetTop += document.body.topMargin;
            }

            return [x,y];
        }

        function getStartingDate(startingDate, input) {
            if (startingDate) return startingDate;
            if (input && input.value) {
                var selected_date = new Date(input.value);
                if(selectedDate.toString() !== 'Invalid Date') { //Valid date.
                    return selectedDate;
                }
            }
            return new Date();
        }

        function makeCalendar(year, month, minDate, maxDate) {
            var today = new Date();
            var i, j, data = [];
            year = parseInt(year, 10);
            month= parseInt(month, 10);
            minCalDate = minDate;

            var minYear = minDate ? minDate.getFullYear() : -1;
            var minMonth = minDate ? minDate.getMonth() : -1;

            var maxYear = maxDate ? maxDate.getFullYear() : 1e9;
            var maxMonth = maxDate ? maxDate.getMonth() : 1e9;

            var greaterThanMinMonth = year > minYear || (year == minYear && month > minMonth);
            var lessThanMaxMonth = year < maxYear || (year == maxYear && month < maxMonth);

            visibleDate = {
                year: year
                , month: month
            };

            data.push("<table class=calendar-box cellspacing=0>");
            data.push(addMonthHeader(year, month, greaterThanMinMonth, lessThanMaxMonth));
            data.push(addDaysOfWeek());

            //Get the first day of this month
            var first_day = new Date(year,month,1);
            var start_day = first_day.getDay();

            var d = 1;
            var flag = 0;
            var days_in_this_month = getDaysInMonth(year, month);


            //Create the calendar
            for(i=0;i<=5;i++) {
                if(w >= days_in_this_month) { break; }
                data.push("<tr>");
                for(j=0;j<7;j++) {
                    if(d > days_in_this_month) { flag=0; }//If the days has overshooted the number of days in this month, stop writing
                    else if(j >= start_day && !flag) { flag=1; }//If the first day of this month has come, start the date writing

                    if(flag) {
                        var w = d, mon = month+1;
                        if(w < 10) { w = "0" + w; }
                        if(mon < 10) { mon = "0" + mon; }

                        //Is it today?
                        var class_name = '';
                        var yea = today.getYear();
                        if(yea < 1900) yea += 1900;

                        if(yea == year && today.getMonth() == month && today.getDate() == d) class_name = " today";
                        if(d == selectedDate.day && month == selectedDate.month && year == selectedDate.year) class_name += " selected";

                        class_name += " " + weekdays[j].toLowerCase();

                        data.push("<td class='days"+class_name+"'>");
                        if (!minDate || greaterThanMinMonth || w > minDate.getDate()) {
                            data.push("<a data-event=selectDate data-date='" + w + "'>"+w+"</a></td>");
                        }
                        else {
                            data.push("<span>"+w+"</span></td>");
                        }
                        d++;
                    } else {
                        data.push("<td class='days'>&nbsp;</td>");
                    }
                }
                data.push("</tr>");
            }
            data.push("</table>");
            data.push("<div class='calendar-cancel' data-event=hideCalendar>Cancel</div>");

            return data.join('');
        }

        function addMonthHeader(year, month, greaterThanMinMonth, lessThanMaxMonth) {
            var data = [];
            //Display the table
            data.push("<tr class='month-header'><th><span class='left'");
            if (greaterThanMinMonth) {
                data.push(" data-event='previousMonth'");
            }
            data.push(">&#8249;</span></th>");

            data.push("<th colspan='5' class='calendar-title'><h2 name='calendar-month' class='calendar-month'>");
            data.push(month_names[month] + " " + year);
            data.push("</h2></th>");

            data.push("<th><span class='right'");
            if (lessThanMaxMonth) {
                data.push(" data-event='nextMonth'");
            }
            data.push(">&rsaquo;</span>");
            data.push('</th></tr>');

            return data.join('');
        }

        function addDaysOfWeek() {
            var weekday, data = [];
            data.push("<tr class='calendar-header'>");
            for(weekday=0; weekday<7; weekday++) { data.push("<td>"+weekdays[weekday]+"</td>"); }
            data.push("</tr>");

            return data.join('');
        }

        function getDaysInMonth(year, month) {
            var month_days = [31,28,31,30,31,30,31,31,30,31,30,31];

            var retVal = month_days[month];
            if (month === 1 && ((year % 400 === 0) ||
                        (year % 100 !== 0 && year % 4 === 0))) {
                            return retVal + 1;
                        }

            return retVal;
        }

        function selectDate(target) {
            visibleDate.day = target.getAttribute('data-date');
            selectedCallback(visibleDate);
        }

        // Called when the user clicks on a date in the calendar.
        function defaultSelectDate(selectedDate) {
            if (linkedElement) {
                linkedElement.value = selectedDate.year + "-" + (selectedDate.month + 1) + "-" + selectedDate.day;
            }
            hideCalendar();
        }

        function updateCalendar(year, month, minDate, maxDate) {
            if (month > 11) {
                month = 0;
                year++;
            }

            if (month < 0) {
                month = 11;
                year--;
            }
            var calText = makeCalendar(year, month, minDate);
            div.innerHTML = calText;
        }

        /// Hides the currently show calendar.
        function hideCalendar(instance) {
            div.style.display = "none";
        }

        function handleEvents(e) {
            var target = e.target;
            var event = target.getAttribute('data-event');
            if (typeof events[event] === 'function') {
                events[event](target);
            }
        }

        function previousMonth() {
            updateCalendar(visibleDate.year
                    , visibleDate.month - 1
                    , minCalDate, maxCalDate
                    );
        }

        function nextMonth() {
            updateCalendar(visibleDate.year
                    , visibleDate.month + 1
                    , minCalDate, maxCalDate
                    );
        }
    };
}());
