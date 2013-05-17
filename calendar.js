(function() {
    var month_names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    var month_days = [31,28,31,30,31,30,31,31,30,31,30,31];

    window.Calendar = function(id) {
        var div = document.createElement('div');
        var selectedCallback = defaultSelectDate;
        var linkedElement, selectedDate, minCalDate, maxCalDate;
        var events = {
            previousMonth: previousMonth
            , nextMonth: nextMonth
            , selectDate: selectDate
            , hideCalendar: hideCalendar
        };

        if (id) { div.id = id; }
        div.className="calendar-box";

        document.body.insertBefore(div, null);
        div.addEventListener('click', handleEvents);

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

        function showCalendar(input, minDate, maxDate) {
            if (input) {
                linkedElement = input;
                var xy = getPosition(input);
                var width = parseInt(getStyle(input,'width'), 10);
                //Position the div in the correct location
                div.style.left=(xy[0]+width+10)+"px";
                div.style.top=xy[1]+"px";
                var date_in_input = input.value;
            }

            // Show the calendar with the date in the input as the selected date
            var existing_date = new Date();
            if(date_in_input) {
                var selected_date = false;
                var date_parts = date_in_input.split("-");
                if(date_parts.length == 3) {
                    date_parts[1]--; //Month starts with 0
                    selected_date = new Date(date_parts[0], date_parts[1], date_parts[2]);
                }
                if(selected_date && !isNaN(selected_date.getYear())) { //Valid date.
                    existing_date = selected_date;
                }
            }

            var the_year = existing_date.getYear();
            if(the_year < 1900) the_year += 1900;
            var calendarText = makeCalendar(the_year, existing_date.getMonth(), existing_date.getDate(), minDate, maxDate);
            div.innerHTML = calendarText;
            div.style.display = "block";
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

            var xy = [x,y];
            return xy;
        }

        function getStyle(ele, property){
            var value;
            if (ele.currentStyle) {
                var alt_property_name = property.replace(/\-(\w)/g,
                        function(m,c){
                            return c.toUpperCase();
                        }
                        );//background-color becomes backgroundColor
                value = ele.currentStyle[property]||ele.currentStyle[alt_property_name];

            } else if (window.getComputedStyle) {
                property = property.replace(/([A-Z])/g,"-$1").toLowerCase();//backgroundColor becomes background-color

                value = document.defaultView.getComputedStyle(ele,null).getPropertyValue(property);
            }

            //Some properties are special cases
            if(property === "opacity" && ele.filter) { value = (parseFloat( ele.filter.match(/opacity\=([^)]*)/)[1] ) / 100); }
            else if(property === "width" && isNaN(value)) { value = ele.clientWidth || ele.offsetWidth; }
            else if(property === "height" && isNaN(value)) { value = ele.clientHeight || ele.offsetHeight; }
            return value;
        }

        function makeCalendar(year, month, day, minDate, maxDate) {
            var today = new Date();
            var weekday, i, j, data = [];
            year = parseInt(year, 10);
            month= parseInt(month, 10);
            day  = parseInt(day, 10);
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

            selectedDate = {
                year: year
                , month: month
                , day: day
            };

            var greaterThanMinMonth = minDate && (previous_month_year > minDate.getFullYear() ||
                    (previous_month_year === minDate.getFullYear() &&
                     previous_month >= minDate.getMonth()));

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

            //Create the calender
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
                        if(day == d) class_name += " selected";

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
            selectedDate.day = target.getAttribute('data-date');
            selectedCallback(selectedDate);
        }

        // Called when the user clicks on a date in the calendar.
        function defaultSelectDate(selectedDate) {
            if (linkedElement) {
                linkedElement.value = selectedDate.year + "-" + (selectedDate.month + 1) + "-" + selectedDate.day;
            }
            hideCalendar();
        }

        function updateCalendar(year, month, day, minDate, maxDate) {
            if (month > 11) {
                month = 1;
                year++;
            }

            if (month < 0) {
                month = 11;
                year--;
            }
            var calText = makeCalendar(year, month, day, minDate);
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
            updateCalendar(selectedDate.year
                    , selectedDate.month - 1
                    , selectedDate.day
                    , minCalDate, maxCalDate
                    );
        }

        function nextMonth() {
            updateCalendar(selectedDate.year
                    , selectedDate.month + 1
                    , selectedDate.day
                    , minCalDate, maxCalDate
                    );
        }
    };
}());
