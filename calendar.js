/**
 * Calendar Script
 * Creates a calendar widget which can be used to select the date more easily than using just a text box
 * http://www.openjs.com/scripts/ui/calendar/
 *
 * Example:
 * <input type="text" name="date" id="date" />
 * <script type="text/javascript">
 *      calendar.set("date");
 * </script>
 */
(function() {
calendar = {
    month_names: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    month_days: [31,28,31,30,31,30,31,31,30,31,30,31],
    //Get today's date - year, month, day and date
    today : new Date(),
    opt : {},
    data: [],
    selectCallback: this.selectDate,
    selectedDate: undefined,

    //Functions
    /// Used to create HTML in a optimized way.
    wrt:function(txt) {
        this.data.push(txt);
    },

    /* Inspired by http://www.quirksmode.org/dom/getstyles.html */
    getStyle: function(ele, property){
        var value;
        if (ele.currentStyle) {
            var alt_property_name = property.replace(/\-(\w)/g,function(m,c){return c.toUpperCase();});//background-color becomes backgroundColor
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
    },

    getPosition:function(ele) {
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
    },
    /// Called when the user clicks on a date in the calendar.
    selectDate:function(year,month,day) {
        var ths = _calendar_active_instance;
        if (typeof this.opt.input === 'string') {
            document.getElementById(ths.opt.input).value = year + "-" + month + "-" + day; // Date format is :HARDCODE:
        }
        else {
            ths.opt.input.value = year + "-" + month + "-" + day; // Date format is :HARDCODE:
        }
        ths.hideCalendar();
    },

    updateCalendar:function(year, month, day, minDate) {
        var calText = this.makeCalendar(year, month, day, minDate);
        if (typeof this.opt.calendar === 'string') {
            document.getElementById(this.opt.calendar).innerHTML = calText;
        }
        else {
            this.opt.calendar.innerHTML = calText;
        }

        this.selectedDate = {year: year, month: month, day: day};
    },
    /// Creates a calendar with the date given in the argument as the selected date.
    makeCalendar:function(year, month, day, minDate, callback) {
        var weekday, i, j;
        if (typeof callback === 'function') {
            this.selectCallback = callback;
        }
        year = parseInt(year, 10);
        month= parseInt(month, 10);
        day  = parseInt(day, 10);
        if (typeof minDate === 'string') {
            minDate = new Date(minDate);
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

        var greaterThanMinMonth = minDate && (previous_month_year > minDate.getFullYear() ||
                (previous_month_year === minDate.getFullYear() &&
                 previous_month >= minDate.getMonth()));

        this.wrt("<table class=calendar-box cellspacing=0>");
        if (!minDate || greaterThanMinMonth) {
            this.wrt("<tr class='month-header'><th><a class='left' href='javascript:calendar.updateCalendar("+(previous_month_year)+","+(previous_month)+","+(undefined)+",\""+minDate+"\");' title='"+this.month_names[previous_month]+" "+(previous_month_year)+"'>&#8249;</a></th>");
        }
        else {
            this.wrt("<tr class='month-header'><th><span title='"+this.month_names[previous_month]+" "+(previous_month_year)+"'>&lsaquo;</span></th>");
        }
        this.wrt("<th colspan='5' class='calendar-title'><h2 name='calendar-month' class='calendar-month'>");
        this.wrt(this.month_names[month] + " " + year);
        this.wrt("</h2></th>");
        this.wrt("<th><a class='right' href='javascript:calendar.updateCalendar("+(next_month_year)+","+(next_month)+","+(undefined)+",\""+minDate+"\");' title='"+this.month_names[next_month]+" "+(next_month_year)+"'>&rsaquo;</a></th></tr>");
        this.wrt("<tr class='calendar-header'>");
        for(weekday=0; weekday<7; weekday++) { this.wrt("<td>"+this.weekdays[weekday]+"</td>"); }
        this.wrt("</tr>");

        //Get the first day of this month
        var first_day = new Date(year,month,1);
        var start_day = first_day.getDay();

        var d = 1;
        var flag = 0;

        //Leap year support
        if(year % 4 == 0) { this.month_days[1] = 29; }
        else { this.month_days[1] = 28; }

        var days_in_this_month = this.month_days[month];

        //Create the calender
        for(i=0;i<=5;i++) {
            if(w >= days_in_this_month) { break; }
            this.wrt("<tr>");
            for(j=0;j<7;j++) {
                if(d > days_in_this_month) { flag=0; }//If the days has overshooted the number of days in this month, stop writing
                else if(j >= start_day && !flag) { flag=1; }//If the first day of this month has come, start the date writing

                if(flag) {
                    var w = d, mon = month+1;
                    if(w < 10) { w = "0" + w; }
                    if(mon < 10) { mon = "0" + mon; }

                    //Is it today?
                    var class_name = '';
                    var yea = this.today.getYear();
                    if(yea < 1900) yea += 1900;

                    if(yea == year && this.today.getMonth() == month && this.today.getDate() == d) class_name = " today";
                    if(day == d) class_name += " selected";

                    class_name += " " + this.weekdays[j].toLowerCase();

                    this.wrt("<td class='days"+class_name+"'>");
                    if (!minDate || greaterThanMinMonth || w > minDate.getDate()) {
                        this.wrt("<a href='javascript:calendar.selectCallback(\""+year+"\",\""+mon+"\",\""+w+"\")'>"+w+"</a></td>");
                    }
                    else {
                        this.wrt("<span>"+w+"</span></td>");
                    }
                    d++;
                } else {
                    this.wrt("<td class='days'>&nbsp;</td>");
                }
            }
            this.wrt("</tr>");
        }
        this.wrt("</table>");
        //this.wrt("<div class='calendar-cancel' onclick='calendar.hideCalendar();'><a>Cancel</a></div>");

        var retValue = this.data.join('');
        this.data = [];

        return retValue;
    },

    /// Display the calendar - if a date exists in the input box, that will be selected in the calendar.
    showCalendar: function(input, minDate, maxDate) {
        if (input) {
            this.opt.input = input;
        }
        else {
            input = document.getElementById(this.opt.input);
        }

        //Position the div in the correct location...
        var div = document.getElementById(this.opt.calendar);
        var xy = this.getPosition(input);
        var width = parseInt(this.getStyle(input,'width'), 10);
        div.style.left=(xy[0]+width+10)+"px";
        div.style.top=xy[1]+"px";

        // Show the calendar with the date in the input as the selected date
        var existing_date = new Date();
        var date_in_input = input.value;
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
        var calendarText = this.makeCalendar(the_year, existing_date.getMonth(), existing_date.getDate(), minDate);
        document.getElementById(this.opt.calendar).innerHTML = calendarText;
        document.getElementById(this.opt.calendar).style.display = "block";
        _calendar_active_instance = this;
    },

    /// Hides the currently show calendar.
    hideCalendar: function(instance) {
        var active_calendar_id = "";
        if(instance) active_calendar_id = instance.opt.calendar;
        else active_calendar_id = _calendar_active_instance.opt.calendar;

        if(active_calendar_id) document.getElementById(active_calendar_id).style.display = "none";
        _calendar_active_instance = {};
    },

    /// Setup a text input box to be a calendar box.
    set: function(input_id) {
        var input = document.getElementById(input_id);
        if(!input) return; //If the input field is not there, exit.

        if(!this.opt.calendar) this.init();

        var ths = this;
        input.onclick=function(){
            ths.opt.input = this.id;
            ths.showCalendar();
        };
    },

    /// Will be called once when the first input is set.
    init: function() {
        if(!this.opt.calendar || !document.getElementById(this.opt.calendar)) {
            var div = document.createElement('div');
            if(!this.opt.calendar) this.opt.calendar = 'calender_div_'+ Math.round(Math.random() * 100);

            div.setAttribute('id',this.opt.calendar);
            div.className="calendar-box";

            document.getElementsByTagName("body")[0].insertBefore(div,document.getElementsByTagName("body")[0].firstChild);
        }
    }
};
}());
