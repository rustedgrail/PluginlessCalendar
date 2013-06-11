(function() {
    var month_names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    var month_days = [31,28,31,30,31,30,31,31,30,31,30,31];

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
            if (input.value) {
                var selected_date = new Date(input.value);
                if(selectedDate.toString() !== 'Invalid Date') { //Valid date.
                    return selectedDate;
                }
            }
            return new Date();
        }

        function makeCalendar(year, month, minDate, maxDate) {
            var today = new Date();
            var weekday, i, j, data = [];
            year = parseInt(year, 10);
            month= parseInt(month, 10);
            if (typeof minDate === 'string') {
                minCalDate = new Date(minDate);
            }
            else {
                minCalDate = minDate;
            }
            //Display the table
            var next_month = month+1;
            var next_month_year = year;
            if(next_month>=12) {
                next_month = 0;
                next_month_year++;
            }

            var previous_month = month-1;
            var previous_month_year = year;
            if(previous_month< 0) {
                previous_month = 11;
                previous_month_year--;
            }

            visibleDate = {
                year: year
                , month: month
            };

            var greaterThanMinMonth = minDate && (previous_month_year > minDate.getFullYear() ||
                    (previous_month_year === minDate.getFullYear() &&
                     previous_month >= minDate.getMonth()));

            var lessThanMaxMonth = maxDate && (next_month_year < maxDate.getFullYear() ||
                    (next_month_year === maxCalDate.getFullYear() &&
                     next_month >= maxDate.getMonth()));

            data.push("<table class=calendar-box cellspacing=0>");
            if (!minDate || greaterThanMinMonth) {
                data.push("<tr class='month-header'><th><span class='left' data-event='previousMonth' title='"+month_names[previous_month]+" "+(previous_month_year)+"'>&#8249;</span></th>");
            }
            else {
                data.push("<tr class='month-header'><th><span title='"+month_names[previous_month]+" "+(previous_month_year)+"'>&lsaquo;</span></th>");
            }
            data.push("<th colspan='5' class='calendar-title'><h2 name='calendar-month' class='calendar-month'>");
            data.push(month_names[month] + " " + year);
            data.push("</h2></th>");
            data.push("<th><span class='right' data-event='nextMonth' title='"+month_names[next_month]+" "+(next_month_year)+"'>&rsaquo;</span></th></tr>");
            data.push("<tr class='calendar-header'>");
            for(weekday=0; weekday<7; weekday++) { data.push("<td>"+weekdays[weekday]+"</td>"); }
            data.push("</tr>");

            //Get the first day of this month
            var first_day = new Date(year,month,1);
            var start_day = first_day.getDay();

            var d = 1;
            var flag = 0;

            //Leap year support
            if(year % 4 == 0) { month_days[1] = 29; }
            else { month_days[1] = 28; }

            var days_in_this_month = month_days[month];

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
