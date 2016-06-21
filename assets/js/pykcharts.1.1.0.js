/*! ====================================================== *
Copyright (c) 2015, Pykih Software LLP
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
* ====================================================== */

var PykCharts = {};
PykCharts.assets = "../assets/js/pykih-charts/assets/";
PykCharts.export_menu_status = 0;

PykCharts['boolean'] = function(d) {
    var false_values = ['0','f',"false",'n','no','',0,"0.00","0.0",0.0,0.00];
    var false_keywords = [undefined,null,NaN];
    if(false_keywords.indexOf(d) !== -1) {
        return false;
    }
    value = d.toLocaleString();
    value = value.toLowerCase();
    return (false_values.indexOf(value) > -1)? false : true;
};

PykCharts.getEvent = function () {
  try {
    return d3.event || event;
  } catch (e) {
    return event;
  }
}

PykCharts.Configuration = function (options){
    var that = this,
        options_selector = options.selector;

    var configuration = {
        liveData: function (chart) {
            var frequency = options.real_time_charts_refresh_frequency,
                interval;
            if(PykCharts['boolean'](frequency)) {
                clearInterval(options.interval);
                options.interval = setInterval(chart.refresh,frequency*1000);
            }
            return this;
        },
        emptyDiv: function (id) {
            d3.select(id).append("div")
                .style("clear","both");

            return this;
        },
        storeInitialDivHeight : function () {
            var height = parseFloat(d3.select(options.selector).style("height"));
            if(height) {
                options.original_div_height = parseFloat(d3.select(options.selector).style("height"));
            } else {
                options.original_div_height = "auto";
            }
            return this;
        },
        appendUnits: function (text) {
            text = PykCharts.numberFormat(text);
            var label,prefix,suffix;
                prefix = options.units_prefix,
                suffix = options.units_suffix;
                if(prefix) {
                    label = prefix + " " + text;
                    if(suffix) {
                        label += " " + suffix;
                    }
                } else if(suffix) {
                    label = text + " " + suffix;
                } else {
                    label = text;
                }
            return label;
        },
        title: function (width) {
            if(PykCharts['boolean'](options.title_text) && options.title_size) {
            var chart_width = options.chart_width;
            if(width) {
                chart_width = width;
            }
            var div_width = PykCharts['boolean'](options.export_enable) ? 0.9*chart_width : chart_width;
                that.titleDiv = d3.select(options.selector)
                    .append("div")
                        .attr("id","title")
                        .style({
                            "width": (div_width) + "px",
                            "text-align":"left",
                            "float":"left"
                        })
                        .html("<span style='pointer-events:none;font-size:" +
                        options.title_size+
                        "vw;color:" +
                        options.title_color+
                        ";font-weight:" +
                        options.title_weight+
                        ";padding-left:1px;font-family:" +
                        options.title_family
                        + "'>" +
                        options.title_text +
                        "</span>");
            }
            return this;
        },
        subtitle: function (width) {
            if(PykCharts['boolean'](options.subtitle_text) && options.subtitle_size) {
                var chart_width = options.chart_width;
                if(width) {
                    chart_width = width;
                }
                that.subtitleDiv = d3.select(options.selector)
                    .append("div")
                        .attr("id","sub-title")
                        .style({
                            "width": chart_width + "px",
                            "text-align": "left"
                        })
                        .html("<span style='pointer-events:none;font-size:" +
                        options.subtitle_size+"vw;color:" +
                        options.subtitle_color +
                        ";font-weight:" +
                        options.subtitle_weight+";padding-left:1px;font-family:" +
                        options.subtitle_family + "'>"+
                        options.subtitle_text + "</span>");
            }
            return this;
        },
        createFooter: function (width) {
            var chart_width = options.chart_width;
            if(width) {
                chart_width = width;
            }
            d3.select(options.selector).append("table")
                .attr({
                    "id" : "footer",
                    "width": chart_width + "px"
                })
                .style("background", options.bg);
            return this;
        },
        lastUpdatedAt: function (a) {
            if(PykCharts['boolean'](options.real_time_charts_refresh_frequency) && PykCharts['boolean'](options.real_time_charts_last_updated_at_enable)) {
                var currentdate = new Date();
                var date = currentdate.getDate() + "/"+(currentdate.getMonth()+1)
                        + "/" + currentdate.getFullYear() + " "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":" + currentdate.getSeconds();
                if(a === "liveData"){
                    document.querySelectorAll(options.selector+" #lastUpdatedAt").innerHTML = "<span style='pointer-events:none;'>Last Updated At: </span><span style='pointer-events:none;'>"+ date +"</span>";
                } else {
                    d3.select(options.selector+" #footer")
                        .append("tr")
                        .attr("class","PykCharts-credits")
                        .html("<td colspan=2 style='text-align:right' id='lastUpdatedAt'><span style='pointer-events:none;'>Last Updated At: </span><span style='pointer-events:none;'>"+ date +"</span></tr>")
                }
            }
            return this;
        },
        checkChangeInData: function (data, compare_data) { // this function checks if the data in json has been changed
            var key1 = Object.keys(compare_data[0]),
                key2 = Object.keys(data[0]),
                changed = false,
                data_length = data.length,
                key1_length = key1.length;

            if(key1.length === key2.length && compare_data.length === data.length) {
                for(var i=0;i<data_length;i++) {
                    for(var j=0;j<key1_length;j++){
                        if(typeof data[i][key2[j]] !== "object" && typeof compare_data[i][key1[j]] !== "object") {
                            if(data[i][key2[j]] !== compare_data[i][key1[j]] || key1[j] !== key2[j]) {
                                changed = true;
                                break;
                            }
                        } else {
                            if(!(options.k.__proto__._isEqual(data[i][key2[j]],compare_data[i][key1[j]])) || key1[j] !== key2[j]) {
                                changed = true;
                                break;
                            }
                        }
                    }
                }
            } else {
                changed = true;
            }
            that.compare_data = data;
            return [that.compare_data, changed];
        },
        credits: function () {
            if(PykCharts['boolean'](options.credit_my_site_name) || PykCharts['boolean'](options.credit_my_site_url)) {
                var enable = true;

                if(options.credit_my_site_name === "") {
                    options.credit_my_site_name = options.credit_my_site_url;
                }
                if(options.credit_my_site_url === "") {
                    enable = false;
                }

                d3.select(options.selector+" #footer").append("tr")
                    .attr({
                        "class" : "PykCharts-credits",
                        "id" : "credit-datasource"
                    })
                    .append("td")
                    .style("text-align","left")
                    .html("<span style='pointer-events:none;'>Credits: </span><a href='" +  options.credit_my_site_url + "' target='_blank' onclick='return " + enable +"'>"+  options.credit_my_site_name +"</a>");

            }
            return this;
        },
        dataSource: function () {
            if( (PykCharts['boolean'](options.data_source_name) || PykCharts['boolean'](options.data_source_url))) {
                var enable = true;
                if(options.data_source_name === "") {
                    options.data_source_name =options.data_source_url;
                }
                if(options.data_source_url === "") {
                    enable = false;
                }
                var data_source_content = "<span style='pointer-events:none;'>Source: </span><a href='" + options.data_source_url + "' target='_blank' onclick='return " + enable +"'>"+ options.data_source_name +"</a></tr>";

                if(d3.selectAll(options.selector+" #footer").length) {
                    d3.select(options.selector+" table #credit-datasource")
                        .style({
                            "background" : options.bg,
                            "text-align" : "right"
                        })
                        .append("td")
                        .html(data_source_content);
                }
                else {
                    d3.select(options.selector).append("table")
                        .attr({
                            "id" : "footer",
                            "class" : "PykCharts-credits",
                            "width" : options.chart_width + "px"
                        })
                        .style({
                            "background" : options.bg,
                            "text-align" : "right"
                        })
                        .append("tr")
                        .append("td")
                        .html(data_source_content);
                }
            }
            return this;
        },
        makeMainDiv: function (selection,i) {
            var d = d3.select(selection).append("div")
                .attr({
                    "id" : "chart-container-"+i,
                    "class" : "main-div"
                })
                .style("width",options.chart_width + "px");

            if(PykCharts['boolean'](options.panels_enable)){
                d.style({
                    "float": "left",
                    "width": "auto"
                });
            }
            return this;
        },
        tooltip: function (d,selection,i,flag) {
            if((PykCharts['boolean'](options.tooltip_enable) || options.axis_x_data_format === "string" || options.axis_y_data_format === "string" || PykCharts['boolean'](options.annotation_enable)) && options.mode === "default") {
                var id;
                if(selection !== undefined){
                    var selector = options.selector.substr(1,options.selector.length);
                        id = "tooltip-svg-container-" + i + "-pyk-tooltip"+selector;
                } else {
                    id = "pyk-tooltip";
                }
                PykCharts.Configuration.tooltipp = d3.select("body")
                        .append("div")
                        .attr({
                            "id" : id,
                            "class" : "pyk-tooltip"
                        });

            } else if (PykCharts['boolean'](options.tooltip_enable)) {
                    PykCharts.Configuration.tooltipp = d3.select("body")
                        .append("div")
                        .attr({
                            "id" : "pyk-tooltip",
                            "class" : "pyk-tooltip"
                        });
            }
            return this;
        },
        dateConversion: function (d) {
            d = new Date(d);
            var time_zone = d.getTimezoneOffset();
            d = new Date(d.getTime() + (time_zone * 60 * 1000));
            return d;
        },
        loading: function () {
            d3.select(options.selector).style("height",options.chart_height);
            var loading_content = options.loading_type === "image" ? "<img src=" + options.loading_source + ">" : options.loading_source;
            d3.select(options.selector).html("<div id='chart-loader'>" + loading_content + "</div>");
            var initial_height_div = parseFloat(d3.select(options.selector).style("height"));
            d3.select(options.selector + " #chart-loader").style({"visibility":"visible","padding-left":(options.chart_width/2) +"px","padding-top":(initial_height_div/2) + "px"});
            return this;
        },
        remove_loading_bar: function (id) {
            var loading = document.querySelector(options.selector+" #chart-loader"),height;
            if(loading) {
                loading.parentNode.removeChild(loading);
            }
            document.getElementById(id).style.height = options.original_div_height;
            return this;
        },
        dataFromPykQuery : function (data) {
            if (PykCharts.boolean(options.interactive_enable)) {
                options.data = data;
            }
        },
        totalColors: function (tc) {
            var n = parseInt(tc, 10)
            if (n > 2 && n < 10) {
                that.total_colors = n;
                return this;
            };
            that.total_colors = 9;
            return this;
        },
        colorType: function (ct) {
            if (ct === "color") {
                that.legends = "no";
            };
            return this;
        },
        resize: function (svg,width) {
            var chart_width = options.chart_width;
            if(PykCharts["boolean"](options.panels_enable) && width) {
                chart_width = width;
            }

            var aspect = (chart_width/options.chart_height),
                targetWidth = !isNaN(parseFloat(d3.select(options.selector).style("width"))) ? parseFloat(d3.select(options.selector).style("width")) : 0,
                a = d3.selectAll(options.selector + " #footer"),
                b = d3.selectAll(options.selector + " .main-div"),
                title_div_width;

            if(targetWidth > chart_width || targetWidth === 0) {
                targetWidth = chart_width;
            }
            if(PykCharts['boolean'](svg)) {
                svg.attr({
                    "width" : targetWidth,
                    "height" : (targetWidth / aspect)
                });
                d3.selectAll(options.selector + ' .main-div')
                    .style("width", targetWidth+"px");
            }
            if(PykCharts['boolean'](options.title_text)) {
                if(PykCharts['boolean'](options.export_enable)) {
                    title_div_width = 0.9*targetWidth;
                    d3.select(options.selector + " #title").style("width",title_div_width + "px");
                }
            }
            if(PykCharts['boolean'](options.subtitle_text)) {
                title_div_width = 0.9*targetWidth;
                d3.select(options.selector + " #sub-title").style("width", title_div_width + "px");
            }
            if(PykCharts['boolean'](options.export_enable)) {
                div_size = targetWidth
                div_float ="none"
                div_left = targetWidth-16;
                if(PykCharts['boolean'](options.title_text) && options.title_size && options.mode === "default") {
                    div_size = 0.1*targetWidth;
                    div_float ="left";
                    div_left = 0;
                }

                d3.select(options.selector + " #export").style({
                    "width": div_size + "px",
                    "left":div_left + "px",
                     "float":div_float
                });

                d3.select(options.selector + " .dropdown-multipleConatiner-export")
                        .style("left",(targetWidth - 80)+"px");
            }

            if(a) {
                a.attr("width",targetWidth);
            }

            if(b && !(PykCharts['boolean'](options.panels_enable))) {
                var select = document.querySelector(options.selector + " .main-div");
                if(select) {
                    select.style.width = targetWidth;
                }
            }
        },
        __proto__: {
            _downloadDataURI : function(t) {
                function isPlainObject(t) {
                   return "object" != typeof t || t.nodeType || null != t && t === t.window ? !1 : t.constructor && !t.constructor.prototype.hasOwnProperty("isPrototypeOf") ? !1 : !0
                }
                if (t) {
                    isPlainObject(t) || (t = {
                        data: t
                    }), t.filename || (t.filename = "download." + t.data.split(",")[0].split(";")[0].substring(5).split("/")[1]), t.url || (t.url = "http://download-data-uri.appspot.com/");
                    var e = (d3.select("body").append("form").attr("id", "export-form").attr("method", "post").attr("action", t.url).style("display", "none").html("<input type='hidden' name='filename' value='" + t.filename + "'/><input type='hidden' name='data' value='" + t.data + "'/>"), document.getElementById("export-form"));
                    e.submit(), e.parentNode.removeChild(e)
                }
            },
            _xmlToJson : function(xml,flag) {
                var obj = [],
                    element_node,
                    data_point,
                    key_of_data_point,
                    value_of_data_point,
                    element_object,
                    root_len = xml.firstChild.childElementCount,
                    i , j, increment_counter, condition_checking;

                if (flag == 0) {
                    i = flag;
                    condition_checking = root_len;
                    increment_counter = 1;
                }
                else if (flag == 1) {
                    i = flag;
                    condition_checking = ((root_len*2)+1);
                    increment_counter = 2;
                }

                for (; i<condition_checking ; i+=increment_counter) {
                    element_node = xml.firstChild.childNodes[i];
                    element_object = {};

                    for(j=0, element_len=element_node.childElementCount ; j<element_len ; j++) {
                        data_point = element_node.children.item(j);
                        key_of_data_point = data_point.nodeName;
                        value_of_data_point = data_point.textContent;
                        element_object[key_of_data_point] = value_of_data_point;
                    }
                    obj.push(element_object);
                }

                return obj;
            },
            _domainBandwidth: function (domain_array, count, type) {
                addFactor = 0;
                if(type === "time") {
                    var a = domain_array[0],
                        b = domain_array[1], new_array = [];
                    padding = (b - a) * 0.1;
                    switch( count ) {
                        case 0: new_array[0] = a - (padding + addFactor);
                        break;
                        case 1:  new_array[1] = b + (padding + addFactor);
                        break;
                        case 2:
                            new_array[0] = a - (padding + addFactor);
                            new_array[1] = b + (padding + addFactor);
                            break;
                    }
                    return [options.k.dateConversion(new_array[0]),options.k.dateConversion(new_array[1])];
                }else {
                    padding = (domain_array[1] - domain_array[0]) * 0.1;
                    switch( count ) {
                        case 0: domain_array[0] -= (padding + addFactor);
                        break;
                        case 1: domain_array[1] = parseFloat(domain_array[1],10) + (padding + addFactor);
                        break;
                        case 2:
                            domain_array[0] -= (padding + addFactor);
                            domain_array[1] = parseFloat(domain_array[1],10) + (padding + addFactor);
                            break;
                    }
                    return domain_array;
                }
            },
            _radiusCalculation: function (radius_percent,type) {
                var min_value;
                if(type === "percentageBar") {
                    min_value = options.chart_height;
                } else if(type === "spiderweb") {
                    min_value = d3.min([(options.chart_width - options.legendsGroup_width),(options.chart_height-options.legendsGroup_height-20)])
                } else if(type !== undefined) {
                    min_value = options.chart_width;
                } else {
                    min_value = d3.min([options.chart_width,options.chart_height]);
                }
                return (min_value*radius_percent)/200;
            },
            _getHighestParentsAttribute: function(id,styleAttribute) {
                var element = document.querySelector(id),value;
                searchFunction(element);
                function searchFunction(element) {
                    if(element.tagName.toLowerCase() === "body") {
                        value = null;
                        return;
                    }
                    value = element.style[styleAttribute];
                    if(!value) {
                        value = d3.select(element).style(styleAttribute);
                    }
                    if(value) {
                        return;
                    } else {
                        searchFunction(element.parentNode)
                    }
                }
                return value;
            },
            _groupBy: function (chart,arr) {
                var gd = []
                , i
                , obj
                , dimensions = {
                    "oned": ["name"],
                    "line": ["x","name"],
                    "area": ["x","name"],
                    "bar": ["y","group"],
                    "column": ["x","group"],
                    "scatterplot": ["x","y","name","group"],
                    "pulse": ["x","y","name","group"],
                    "spiderweb": ["x","group"],
                    "waterfall": ["x","y"],
                    "simple2x2": ["group"]
                  }
                , charts = {
                    "oned": {
                        "dimension": "name",
                        "fact": "weight"
                    },
                    "line": {
                      "dimension": "x",
                      "fact": "y",
                      "name": "name"
                    },
                    "area": {
                      "dimension": "x",
                      "fact": "y",
                      "name": "name"
                    },
                    "bar": {
                      "dimension": "y",
                      "fact": "x",
                      "name": "group"
                    },
                    "column": {
                      "dimension": "x",
                      "fact": "y",
                      "name": "group"
                    },
                    "scatterplot": {
                      "dimension": "x",
                      "fact": "y",
                      "weight": "weight",
                      "name": "name",
                      "group": "group"
                    },
                    "pulse": {
                      "dimension": "y",
                      "fact": "x",
                      "weight": "weight",
                      "name": "name",
                      "group": "group"
                    },
                    "spiderweb": {
                      "dimension": "x",
                      "fact": "y",
                      "name": "name",
                      "weight": "weight"
                    },
                    "waterfall": {
                        "dimension": "y",
                        "fact": "x",
                        "name": "group"
                    },
                    "simple2x2": {
                      "dimension": "group",
                      "fact": "weight"
                    }
                },
                properties = dimensions[chart],
                groups = [];
                var len = arr.length;
                for(var i = 0; i<len; i+=1){
                    var obj = arr[i];
                    if(groups.length == 0){
                        groups.push([obj]);
                    }
                    else{
                        var equalGroup = false,
                            glen = groups.length;
                        for(var a = 0;a<glen;a+=1){
                            var group = groups[a],
                            equal = true,
                            firstElement = group[0];
                            properties.forEach(function(property){
                                if(firstElement[property] !== obj[property]){
                                    equal = false;
                                }
                            });
                            if(equal){
                                equalGroup = group;
                            }
                        }
                        equalGroup ? equalGroup.push(obj) : groups.push([obj]);
                    }
                }

                for(i in groups) {
                    if (groups[i].constructor === Array) {
                        obj = {};
                        var grp = groups[i],
                            chart_name = charts[chart],
                            values_charts_chart = [],
                            obj_with_omitted_properties = {},
                            f = {};
                        obj[chart_name.dimension] = grp[0][chart_name.dimension];
                        if (chart_name.name) {
                            obj[chart_name.name] = grp[0][chart_name.name];
                        }
                        if (chart_name.weight) {
                            obj[chart_name.weight] = d3.sum(grp, function (d) { return d[charts[chart].weight]; });
                            if(chart === "spiderweb") {
                                obj[chart_name.fact] = d3.sum(grp, function (d) { return d[charts[chart].fact]; });
                            } else {
                                obj[chart_name.fact] = grp[0][chart_name.fact];
                            }
                        } else {
                            obj[chart_name.fact] = d3.sum(grp, function (d) { return d[charts[chart].fact]; });
                        }
                        if (chart_name.group) {
                            obj[chart_name.group] = grp[0][chart_name.group];
                        }

                        for (var key in charts[chart]) {
                            values_charts_chart.push(charts[chart][key]);
                        }
                        for (var key in grp[0]) {
                            var flag = 0;
                            for (var i=0 ; i<values_charts_chart.length ; i++) {
                                if (key === values_charts_chart[i]) {
                                    flag = 1;
                                    break;
                                }
                            }
                            if (flag === 0) {
                                obj_with_omitted_properties[key] = grp[0][key];
                            }
                        }
                        for (var key in obj) {
                            f[key] = obj[key];
                        }
                        for (var key in obj_with_omitted_properties) {
                            f[key] = obj_with_omitted_properties[key];
                        }
                        gd.push(f);
                    }
                };
                return gd;
            },
            _sortData: function (data, column_to_be_sorted, group_column_name, options,notApplicable) {
                if(!PykCharts['boolean'](options.data_sort_enable) && !notApplicable) {
                    data.sort(function(a,b) {
                        if (a[group_column_name] > b[group_column_name]) {
                            return 1;
                        }
                        else if (a[group_column_name] < b[group_column_name]) {
                            return -1;
                        }
                    });
                } else if (PykCharts['boolean'](options.data_sort_enable)) {
                    switch (options.data_sort_type) {
                        case "numerically":
                            data.sort(function (a,b) {
                                return ((options.data_sort_order === "descending") ? (b[column_to_be_sorted] - a[column_to_be_sorted]) : (a[column_to_be_sorted] - b[column_to_be_sorted]));
                            });
                            break;
                        case "alphabetically":
                            data.sort(function (a,b) {
                                if (a[column_to_be_sorted] < b[column_to_be_sorted]) {
                                    return (options.data_sort_order === "descending") ? 1 : -1;
                                }
                                else if (a[column_to_be_sorted] > b[column_to_be_sorted]) {
                                    return (options.data_sort_order === "descending") ? -1 : 1;
                                }
                                else if (a[group_column_name] < b[group_column_name]) {
                                    return (options.data_sort_order === "descending") ? 1 : -1;
                                }
                                else if (a[group_column_name] > b[group_column_name]) {
                                    return (options.data_sort_order === "descending") ? -1 : 1;
                                }
                                return 0;
                            });
                            break;
                        case "date":
                            data.sort(function (a,b) {
                                if (new Date(a[column_to_be_sorted]) < new Date(b[column_to_be_sorted])) {
                                    return (options.data_sort_order === "descending") ? 1 : -1;
                                }
                                else if (new Date(a[column_to_be_sorted]) > new Date(b[column_to_be_sorted])) {
                                    return (options.data_sort_order === "descending") ? -1 : 1;
                                }
                                else if (a[group_column_name] < b[group_column_name]) {
                                    return (options.data_sort_order === "descending") ? 1 : -1;
                                }
                                else if (a[group_column_name] > b[group_column_name]) {
                                    return (options.data_sort_order === "descending") ? -1 : 1;
                                }
                                return 0;
                            });
                            break;
                    }
                }
                return data;
            },
            _unique : function (data,parameter) {
                var n = {},r=[];
                    // if(parameter) {
                    //     for(var i = 0,len=data.length; i < len; i++) {

                    //     }
                    // }

                    for(var i = 0,len=data.length; i < len; i++)
                    {
                        if(parameter) {
                            data[i] = data[i][parameter];
                        }

                        if (!n[data[i]])
                        {
                            n[data[i]] = true;
                            r.push(data[i]);
                        }
                    }
                    return r;
            },
            _ready: function (fn) {
                function completed() {
                    document.removeEventListener( "DOMContentLoaded", completed, false );
                    window.removeEventListener( "load", completed, false );
                }

                if ( document.addEventListener ) {
                    document.addEventListener( "DOMContentLoaded", completed, false );
                    window.addEventListener( "load", completed, false );
                    fn;
                } else if ( document.attachEvent ) { // if IE event model is used
                    document.attachEvent("onreadystatechange", function(){
                        if ( document.readyState === "complete" ) {
                            document.detachEvent( "onreadystatechange", arguments.callee );
                            fn;
                        }
                    });
                }
                return this;
            },
            _colourBrightness: function (bg,element){
                var r,g,b,a=1,brightness,
                    colour = bg;

                if (colour.match(/^rgba/)) {
                    colour = colour.match(/rgba\(([^)]+)\)/)[1];
                    colour = colour.split(/ *, */).map(Number);
                    r = colour[0];
                    g = colour[1];
                    b = colour[2];
                    a = colour[3];
                }
                else if (colour.match(/^rgb/)) {
                    colour = colour.match(/rgb\(([^)]+)\)/)[1];
                    colour = colour.split(/ *, */).map(Number);
                    r = colour[0];
                    g = colour[1];
                    b = colour[2];
                } else if ('#' == colour[0] && 7 == colour.length) {
                    r = parseInt(colour.slice(1, 3), 16);
                    g = parseInt(colour.slice(3, 5), 16);
                    b = parseInt(colour.slice(5, 7), 16);
                } else if ('#' == colour[0] && 4 == colour.length) {
                    r = parseInt(colour[1] + colour[1], 16);
                    g = parseInt(colour[2] + colour[2], 16);
                    b = parseInt(colour[3] + colour[3], 16);
                } else {

                }
                brightness = (r * 299 + g * 587 + b * 114) / 1000;
                if (brightness < 125 && a > 0.5) {
                     if(element) {
                        d3.selectAll(element).classed({'light': false, 'dark': true});
                    } else {
                        return "dark";
                    }
                }
                else if (brightness < 125 && a <= 0.5) {
                    if(element) {
                        d3.selectAll(element).classed({'light': true, 'dark': false});
                    } else {
                        return "light";
                    }
                }
                else {
                    if(element) {
                        d3.selectAll(element).classed({'light': true, 'dark': false});
                    } else {
                        return "light";
                    }
                }
            },
            _isNumber: function (n) {
                return (!isNaN(parseFloat(n)) && isFinite(n));
            },
            _where: function (list, key_value_pairs_to_be_searched) {
                var list_length = list.length,
                    data_result = [];
                if(typeof list === "object") {
                    for (var z in list) {
                        var flag = 0,
                            no_of_keys = 0;
                        for (var key in key_value_pairs_to_be_searched) {
                            if (list[z].hasOwnProperty(key) && list[z][key] === key_value_pairs_to_be_searched[key]) {
                                flag += 1;
                            }
                            else {
                                flag = 0;
                            }
                            no_of_keys += 1;
                        }
                        if (flag === no_of_keys) {
                            data_result.push(list[z]);
                        }
                    }
                } else {
                    for (var z=0 ; z<list_length ; z++) {
                        var flag = 0,
                            no_of_keys = 0;
                        for (var key in key_value_pairs_to_be_searched) {
                            if (list[z].hasOwnProperty(key) && list[z][key] === key_value_pairs_to_be_searched[key]) {
                                flag += 1;
                            }
                            else {
                                flag = 0;
                            }
                            no_of_keys += 1;
                        }
                        if (flag === no_of_keys) {
                            data_result.push(list[z]);
                        }
                    }
                }
                return data_result;
            },
            _isEqual : function(a, b) {
                var eq = function(a, b, aStack, bStack) {
                    if (a === b) return a !== 0 || 1 / a === 1 / b;
                    if (a == null || b == null) return a === b;
                    var className = toString.call(a);
                    if (className !== toString.call(b)) return false;
                    switch (className) {
                      case '[object RegExp]':
                      case '[object String]':
                        return '' + a === '' + b;
                      case '[object Number]':
                        if (+a !== +a) return +b !== +b;
                        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
                      case '[object Date]':
                      case '[object Boolean]':
                        return +a === +b;
                    }
                    if (typeof a != 'object' || typeof b != 'object') return false;
                    var length = aStack.length;
                    while (length--) {
                      if (aStack[length] === a) return bStack[length] === b;
                    }
                    var aCtor = a.constructor, bCtor = b.constructor;
                    if (
                      aCtor !== bCtor &&
                      'constructor' in a && 'constructor' in b &&
                      !(isFunction(aCtor) && aCtor instanceof aCtor &&
                        isFunction(bCtor) && bCtor instanceof bCtor)
                    ) {
                      return false;
                    }
                    aStack.push(a);
                    bStack.push(b);
                    var size, result;
                    if (className === '[object Array]') {
                      size = a.length;
                      result = size === b.length;
                      if (result) {
                        while (size--) {
                          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
                        }
                      }
                    } else {
                      var keys = Object.getOwnPropertyNames(a), key;
                      size = keys.length;
                      result = Object.getOwnPropertyNames(b).length === size;
                      if (result) {
                        while (size--) {
                          key = keys[size];
                          if (!(result = hasOwnProperty.call(b, key) && eq(a[key], b[key], aStack, bStack))) break;
                        }
                      }
                    }
                    aStack.pop();
                    bStack.pop();
                    return result;
                  };
                var isFunction = function(obj) {
                    return typeof obj == 'function' || false;
                };
                return eq(a, b, [], []);
            },
            _offset:  function (elem) {
                var strundefined = typeof undefined;
                var docElem, win,
                    box = { top: 0, left: 0 },
                    doc = elem && elem.ownerDocument;
                if ( !doc ) {
                    return;
                }
                docElem = doc.documentElement;
                if ( typeof elem.getBoundingClientRect !== strundefined ) {
                    box = elem.getBoundingClientRect();
                }
                win=(doc != null && doc === doc.window) ? doc : doc.nodeType === 9 && doc.defaultView;
                return {
                    top: box.top + win.pageYOffset - docElem.clientTop,
                    left: box.left + win.pageXOffset - docElem.clientLeft
                };
            }
        },
        backgroundColor: function (options) {
            d3.select(options.selector).style({"background-color":options.background_color,"position":"relative"})
            var bg,child1;
            bgColor(options.selector);

            function bgColor(child) {
                child1 = child;
                bg  = d3.select(child).style("background-color");
                if (bg === "transparent" || bg === "rgba(0, 0, 0, 0)") {
                    if(d3.select(child)[0][0].parentNode.tagName === undefined || d3.select(child)[0][0].parentNode.tagName.toLowerCase() === "body") {
                        options.k.__proto__._colourBrightness("rgb(255,255,255)",d3.select(child)[0]);
                    } else {
                        return bgColor(d3.select(child)[0][0].parentNode);
                    }
                } else {
                    return options.k.__proto__._colourBrightness(bg,d3.selectAll(child)[0]);
                }
            }
            if (d3.select(child1)[0][0].classList.contains("light")) {
                options.img = PykCharts.assets+"img/download.png";
            } else {
                options.img = PykCharts.assets+"img/download-light.png";
            }

            return this;
        },
        dataSourceFormatIdentification: function (data,chart,executeFunction) {
            if (typeof data === "object") {
                chart.data = data;
                chart[executeFunction](chart.data);
            } else {
                var dot_index = data.lastIndexOf('.'),
                len = data.length - dot_index,
                cache_avoidance_value = Math.floor((Math.random() * 100) + 1);

                if (data.constructor == Array) {
                    chart.data = data;
                    chart[executeFunction](chart.data);
                }
                else {
                    var format = data.substr(dot_index+1,len);
                    if (data.indexOf("<root>") != -1) {
                        var xml_data_converted_from_string,
                            json_data_converted_from_xml;

                        if (window.DOMParser) {
                            parser = new DOMParser();
                            xml_data_converted_from_string = parser.parseFromString(data,"text/xml");
                        } else { // Internet Explorer
                            xml_data_converted_from_string = new ActiveXObject("Microsoft.XMLDOM");
                            xml_data_converted_from_string.async = false;
                            xml_data_converted_from_string.loadXML(data);
                        }

                        json_data_converted_from_xml = options.k.__proto__._xmlToJson(xml_data_converted_from_string,0);
                        chart[executeFunction](json_data_converted_from_xml);
                    }
                    else if(data.indexOf("{")!= -1) {
                        chart.data = JSON.parse(data);
                        chart[executeFunction](chart.data);
                    } else if (data.indexOf(",")!= -1) {
                        chart.data = d3.csv.parse(data);
                        chart[executeFunction](chart.data);
                    } else if (format === "json") {
                        d3.json(data+"?"+cache_avoidance_value,chart[executeFunction]);
                    } else if(format === "csv") {
                        d3.csv(data+"?"+cache_avoidance_value,chart[executeFunction]);
                    } else if (format === "xml") {
                        d3.xml(data+"?"+cache_avoidance_value, function(data) {
                            var json_data_converted_from_xml;
                            json_data_converted_from_xml = options.k.__proto__._xmlToJson(data,1);
                            chart[executeFunction](json_data_converted_from_xml);
                        });
                    }
                }
            }
        },
        export: function(chart,svgId,chart_name,panels_enable,containers,chart_width) {
            if(PykCharts['boolean'](options.export_enable)) {
                var chart_width = options.chart_width;
                if(PykCharts['boolean'](panels_enable) && chart_width) {
                    chart_width = chart_width;
                }

                var id = "export",
                div_size = chart_width,
                div_float ="none",
                div_left = chart_width-16;

                d3.select(options.selector)
                        .append("div")
                        .style("left",chart_width - 80 + "px")
                        .attr("class","dropdown-multipleConatiner-export")

                if(PykCharts['boolean'](panels_enable)) {
                    var containers_length = containers.length;
                    for(var i = 0; i < containers_length; i++) {
                        d3.select(options.selector + " .dropdown-multipleConatiner-export")
                            .append("span")
                            .attr("id",chart_name + i)
                            .on("mouseover",function () {
                                d3.select(this).style("background-color","#E0E0E1");
                            })
                            .on("mouseout",function() {
                                d3.select(this).style('background-color',"#fff")
                            })
                            .style({
                                "margin-bottom" : "3px",
                                "cursor" : "pointer"
                            })
                            .html("Panel " + (i+1) + "<br>");
                    }
                } else {
                    d3.select(options.selector + " .dropdown-multipleConatiner-export")
                        .append("span")
                        .attr("id","span")
                        .on("mouseover",function () {
                            d3.select(this).style("background-color","#E0E0E1");
                        })
                        .on("mouseout",function() {
                            d3.select(this).style('background-color',"#fff")
                        })
                        .style({
                                "margin-bottom" : "3px",
                                "cursor" : "pointer"
                        })
                        .html("Export as SVG" + "<br>");
                }

                if(PykCharts['boolean'](options.title_text) && options.title_size  && options.mode === "default") {
                    div_size = 0.1*chart_width;
                    div_float ="left";
                    div_left = 0;
                }

                var export_div = d3.select(chart.selector)
                    .append("div")
                    .attr("id",id)
                    .style({
                        "width":div_size + "px",
                        "left":div_left+"px",
                        "float":div_float,
                        'text-align':'right'
                    })

                setTimeout(function () {
                    export_div.html("<img title='Export to SVG' src='"+options.img+"' style='left:"+div_left+"px;margin-bottom:3px;cursor:pointer;'/>");
                },options.transition_duration*1000);

            }
            return this;
        },
        exportSVG: function (chart,svgId,chart_name,panels_enable,containers,add_extra_width,add_extra_height) {
            if(PykCharts['boolean'](options.export_enable)) {
                if(!add_extra_width) {
                    add_extra_width = 0;
                }
                if(!add_extra_height) {
                    add_extra_height = 0;
                }

                var id = "export";
                var canvas_id = chart_name+"canvas";
                var canvas = document.createElement("canvas");
                canvas.setAttribute('id', canvas_id);
                var get_canvas = document.getElementById(canvas_id);
                paper.setup(get_canvas);
                var project = new paper.Project();
                project._view._viewSize.width = chart.chart_width + add_extra_width;
                project._view._viewSize.height = chart.chart_height +  add_extra_height;

                var name = chart_name + ".svg";
                d3.select(chart.selector + " #"+id).on("click",function () {
                    PykCharts.export_menu_status = 1;
                    d3.select(options.selector + " .dropdown-multipleConatiner-export").style("visibility", "visible");
                });

                if(!PykCharts['boolean'](panels_enable)) {
                    d3.selectAll(chart.selector + " #span").on("click",function () {
                        d3.select(options.selector + " .dropdown-multipleConatiner-export").style("visibility", "hidden");
                        chart.k.processSVG(document.querySelector(options.selector +" "+svgId),chart_name);
                        project.importSVG(document.querySelector(options.selector +" "+svgId));
                        var svg = project.exportSVG({ asString: true });
                        options.k.__proto__._downloadDataURI({
                            data: 'data:image/svg+xml;base64,' + btoa(svg),
                            filename: name
                        });
                        project.clear();
                    });
                } else {
                    var containers_length = containers.length;
                    for(var i = 0; i<containers_length; i++) {
                        d3.selectAll(chart.selector + " #"+chart_name + i).on("click",function () {
                            d3.select(options.selector + " .dropdown-multipleConatiner-export").style("visibility", "hidden");
                            var id = this.id.substring(this.id.length-1,this.id.length);
                            chart.k.processSVG(document.querySelector(options.selector + " #" +svgId + id),chart_name);
                            project.importSVG(document.querySelector(options.selector + " #" +svgId + id));
                            var svg = project.exportSVG({ asString: true });;
                            options.k.__proto__._downloadDataURI({
                                data: 'data:image/svg+xml;base64,' + btoa(svg),
                                filename: name
                            });
                            project.clear();
                        });
                    }
                }
            }
            return this;
        },
        shadeColorConversion: function (color, data_length) {
            var r,g,b, division,array = [], increment_ratio = (150/data_length),color_value,color_validation;

            color = d3.rgb(color);
            color_validation = "rgb(" + color.r + "," + color.g + "," + color.b +")"
            color_value = options.k.__proto__._colourBrightness(color_validation);
            if(color_value === "light") {
                inc = -1;
            } else {
                inc = 1;
            }
            var magnitude = Math.sqrt((color.r*color.r) + (color.g*color.g)) + Math.sqrt((color.r*color.r) + (color.b*color.b)) +  Math.sqrt((color.g*color.g) + (color.b*color.b))
            for(i = 0; Math.abs(i) < data_length; i += inc) {
                var rgb_color = {
                    "r":parseInt((color.r+(i*increment_ratio)),10),
                    "g":parseInt((color.g+(i*increment_ratio)),10),
                    "b":parseInt((color.b+(i*increment_ratio)),10)
                }
                var hex_color = "rgb(" + rgb_color.r + "," + rgb_color.g + "," + rgb_color.b +")"
                array.push(hex_color);
            }
            if(inc === -1) {
                array.reverse();
            }
            return array;
        },
        processSVG: function (svg,svgId) {
            var x = svg.querySelectorAll("text"),
                x_length = x.length;
            for (var i = 0; i < x_length; i++) {
                if(x[i].hasAttribute("dy")) {
                    var attr_value = x[i].getAttribute("dy"),
                        attr_length = attr_value.length;
                    if(attr_value.substring(attr_length-2,attr_length) == "em") {
                        var font_size, value;
                        if(x[i].hasAttribute('font-size')) {
                            font_size = x[i].getAttribute('font-size');
                            value = parseFloat(font_size)*parseFloat(attr_value);

                        } else {
                            value = 12*parseFloat(attr_value);
                        }
                        x[i].setAttribute("dy", value);
                    }
                }
            }
            return this;
        },
        errorHandling: function(error_msg,error_code,err_url) {
            console.error('%c[Error - Pykih Charts] ', 'color: red;font-weight:bold;font-size:14px', " at "+options.selector+".(Invalid value for attribute \""+error_msg+"\")  Visit https://github.com/pykih/PykCharts.js/wiki/Errors#error_"+error_code);
            return;
        },
        warningHandling: function(error_msg,error_code,err_url) {
            console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+options.selector+".(Invalid value for attribute \""+error_msg+"\")  Visit https://github.com/pykih/PykCharts.js/wiki/Warnings#warning_"+error_code);
            return;
        },
        validator: function () {
            var validator = {
                validatingSelector: function (selector) {
                    if(selector.charAt(0) === "#") {
                        selector = selector.substring(1,selector.length);
                    }
                    try {
                        if(!document.getElementById(selector)) {
                            options.stop = true;
                            throw "selector";
                        }
                    }
                    catch (err) {
                        options.k.errorHandling(err,"1");
                    }
                    return this;
                },
                validatingDataType: function (attr_value,config_name,default_value,name) {
                    try {
                        if(!options.k.__proto__._isNumber(attr_value)) {
                            if(name) {
                                options[name] = default_value;
                            } else {
                                options[config_name] = default_value;
                            }
                            throw config_name;
                        } else {
                            options[config_name] = parseFloat(attr_value);
                        }
                    }
                    catch (err) {
                        options.k.warningHandling(err,"1");
                    }
                    return this;
                },
                validatingChartMode: function (mode,config_name,default_value) {
                    try {
                        if(mode === "default" || mode === "infographics") {
                        } else {
                            options[config_name] = default_value;
                            throw "mode";
                        }
                    }
                    catch (err) {
                        options.k.warningHandling(err,"2");
                    }
                    return this;
                },
                validatingAxisDataFormat: function (axis_data_format,config_name) {
                    if(axis_data_format) {
                        try {
                            if(axis_data_format === "number" || axis_data_format === "string" || axis_data_format === "time") {
                            } else {
                                options.stop = true;
                                throw config_name;
                            }
                        }
                        catch (err) {

                            options.k.errorHandling(err,"9");
                        }
                    }
                    return this;
                },
                validatingColorMode: function (color_mode,config_name,default_value,chart_type) {
                    if(color_mode) {
                        try {
                            if(chart_type === "oneDimensionalCharts") {
                                if(color_mode === "color" || color_mode === "shade") {
                                } else {
                                    options[config_name] = default_value;
                                    throw "color_mode";
                                }
                            } else {
                                if(color_mode === "color" || color_mode === "saturation") {
                                } else {
                                    options[config_name] = default_value;
                                    throw "color_mode";
                                }
                            }
                        }
                        catch (err) {
                            options.k.warningHandling(err,"3");
                        }
                    }
                    return this;
                },
                validatingYAxisPointerPosition: function (axis_pointer_position,config_name,default_value) {
                        try {
                            if(axis_pointer_position === "left" || axis_pointer_position === "right" ) {
                            } else {
                                options[config_name] = default_value;
                                throw config_name;
                            }
                        }
                        catch (err) {
                            options.k.warningHandling(err,"7");
                        }
                    return this;
                },
                validatingXAxisPointerPosition: function (axis_pointer_position,config_name,default_value) {
                        try {
                            if(axis_pointer_position === "top" || axis_pointer_position === "bottom") {
                            } else {
                                options[config_name] = default_value;
                                throw config_name;
                            }
                        }
                        catch (err) {
                            options.k.warningHandling(err,"7");
                        }
                    return this;
                },
                validatingBorderBetweenChartElementsStyle: function (border_between_chart_elements_style,config_name) {
                        try {
                            if(border_between_chart_elements_style === "1,3" || border_between_chart_elements_style === "5,5" || border_between_chart_elements_style === "0") {
                            } else {
                                throw config_name;
                            }
                        }
                        catch (err) {
                            options.k.errorHandling(err,"#7");
                        }
                    return this;
                },
                validatingLegendsPosition: function (legends_display,config_name,default_value) {
                        try {
                            if(legends_display === "horizontal" || legends_display === "vertical") {
                            } else {
                                options[config_name] = default_value;
                                throw config_name;
                            }
                        }
                        catch (err) {
                            options.k.warningHandling(err,"13");
                        }
                    return this;
                },
                isArray: function (value,config_name) {
                        try {
                            if(!(value.constructor === Array)) {
                                throw config_name;
                            }
                        }
                        catch (err) {
                            options.stop = true;
                            options.k.errorHandling(err,"4");
                        }
                    return this;
                },
                validatingTimeScaleDataType: function (axis_time_value_datatype,config_name) {
                    if(axis_time_value_datatype) {
                        try {
                            if(axis_time_value_datatype === "date" || axis_time_value_datatype === "year" || axis_time_value_datatype === "month" || axis_time_value_datatype === "hours" || axis_time_value_datatype === "minutes") {
                            } else {
                                options.stop = true;
                                throw config_name;
                            }
                        }
                        catch (err) {
                            options.k.errorHandling(err,"5");
                        }
                    }
                    return this;
                },
                validatingTooltipMode: function (tooltip_mode,config_name,default_value) {
                    if(tooltip_mode) {
                        try {
                            if(tooltip_mode === "fixed" || tooltip_mode === "moving") {
                            } else {
                                options[config_name] = default_value;
                                throw config_name;
                            }
                        }
                        catch (err) {
                            options.k.warningHandling(err,"14");
                        }
                    }
                    return this;
                },
                validatingFontWeight: function (font_weight,config_name,default_value,name) {
                    try {
                        if(font_weight === "bold" || font_weight === "normal") {
                        } else {
                            if(name) {
                                options[name] = default_value;
                            } else {
                                options[config_name] = default_value;
                            }

                            throw config_name;
                        }
                    }
                    catch (err) {
                        options.k.warningHandling(err,"5");
                    }
                    return this;
                },
                validatingColor: function (color,config_name,default_value,name) {
                    if(color) {
                        try {
                            var checked;
                            if(typeof color != "string" ) {

                                throw config_name;
                            }

                            if(color.charAt(0)!= "#" && color.substring(0,3).toLowerCase() !="rgb" && color.toLowerCase()!= "transparent") {
                                checked = $c.name2hex(color) ;
                                if(checked === "Invalid Color Name") {
                                    throw config_name;
                                }
                            } else if (color.charAt(0) === "#") {
                                checked = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
                                if(!checked) {
                                    throw config_name;
                                }
                            }
                        }
                        catch (err) {
                            if(name) {
                                options[name] = default_value;
                            } else {
                                options[config_name] = default_value;
                            }
                            options.k.warningHandling(err,"4");
                        }
                    }
                    return this;
                },
                validatingDataMode : function (mode,config_name,default_value,name) {
                    try {
                        if(mode === "absolute" || mode === "percentage") {
                        } else {
                            options[config_name] = default_value;
                            throw config_name;
                        }
                    }
                    catch (err) {
                        options.k.warningHandling(err,"16");
                    }
                    return this;
                },
                validatingLegendsMode : function (mode,config_name,default_value,name) {
                    try {
                        if(mode === "default" || mode === "interactive") {
                        } else {
                            options[config_name] = default_value;
                            throw config_name;
                        }
                    }
                    catch (err) {
                        options.k.warningHandling(err,"17");
                    }
                    return this;
                },
                validatingJSON : function (data) { // note: this method method cannot be used for chaining as it return fasle and not this;
                    if(!data) {
                        try {
                            options.stop = true;
                            throw "Data is not in the valid JSON format";
                        }
                        catch (err) {
                            console.error('%c[Error - Pykih Charts] ', 'color: red;font-weight:bold;font-size:14px', " at "+ options.selector+".(\""+err+"\")  Visit www.pykcharts.com/errors#error_2");
                        }
                    }
                    return (options.stop) ? false : true;
                }
            };
            return validator;
        }
    };
    return configuration;
};
var configuration = PykCharts.Configuration;
configuration.mouseEvent = function (options) {
    var that = this;
    that.tooltip = configuration.tooltipp;
    var action = {
        tooltipPosition: function (d) {
            if(PykCharts['boolean'](options.tooltip_enable) || PykCharts['boolean'](options.annotation_enable) || options.axis_x_data_format === "string" || options.axis_y_data_format === "string") {
                that.tooltip
                    .style({
                        "display" : "block",
                        "top" : (PykCharts.getEvent().pageY - 20) + "px",
                        "left" : (PykCharts.getEvent().pageX + 30) + "px"
                    });
                return that.tooltip;
            }

        },
        tooltipTextShow: function (d,panels_enable,type,group_index,axis_tooltip) {
            var selector = options.selector.substr(1,options.selector.length)
            if(PykCharts['boolean'](options.tooltip_enable) || PykCharts['boolean'](options.annotation_enable) || options.axis_x_data_format === "string" || options.axis_y_data_format === "string") {
                if(panels_enable === "yes" && type === "multilineChart") {
                    d3.selectAll("#tooltip-svg-container-"+group_index +"-pyk-tooltip"+selector).html(d);
                } else {
                    that.tooltip.html(d);
                }
                return this;
            }
        },
        tooltipHide: function (d,panels_enable,type,axis_tooltip) {
            if(PykCharts['boolean'](options.tooltip_enable) || PykCharts['boolean'](options.annotation_enable) || options.axis_x_data_format === "string" || options.axis_y_data_format === "string") {
                if(panels_enable === "yes" && type === "multilineChart") {
                    return d3.selectAll(".pyk-tooltip").style("display","none");
                }
                else {
                    return that.tooltip.style("display", "none");
                }
            }
        },
        axisHighlightShow: function (active_tick,axisHighlight,domain,a) {
            var curr_tick,prev_tick,axis_pointer_color,selection,axis_data_length,active_tick_length,domain_length;
            if(PykCharts['boolean'](options.axis_onhover_highlight_enable)/* && options.mode === "default"*/){
                if(axisHighlight === options.selector + " .y.axis" && a == undefined){
                    selection = axisHighlight+" .tick text";
                    axis_pointer_color = options.axis_y_pointer_color;
                    axis_data_length = d3.selectAll(selection)[0].length;
                    active_tick_length = active_tick.length;

                    d3.selectAll(selection)
                        .style("fill","#bbb")
                        .style("font-weight","normal");

                    for(var b=0;b < axis_data_length;b++) {
                        for(var c=0;c < active_tick_length;c++) {
                            if(d3.selectAll(selection)[0][b].__data__ === active_tick[c]) {
                                d3.select(d3.selectAll(selection)[0][b])
                                    .style("fill",axis_pointer_color)
                                    .style("font-weight","bold");
                            }
                        }
                    }
                }
                else {
                    if(axisHighlight === options.selector + " .x.axis") {
                        selection = axisHighlight+" .tick text";
                        axis_pointer_color = options.axis_x_pointer_color;
                    } else if(axisHighlight === options.selector + " .axis-text" && a === "column") {
                        selection = axisHighlight;
                        axis_pointer_color = options.axis_x_pointer_color;
                    } else if(axisHighlight === options.selector + " .axis-text" && a === "bar") {
                        selection = axisHighlight;
                        axis_pointer_color = options.axis_y_pointer_color;
                    } else if(axisHighlight === options.selector + " .y.axis" && a == "waterfall") {
                        selection = axisHighlight+" .tick text";
                        axis_pointer_color = options.axis_y_pointer_color;
                    } else if(axisHighlight === options.selector + " .y.axis" && a === "bar") {
                        selection = axisHighlight+" .tick text";
                        axis_pointer_color = options.axis_x_pointer_color;
                    }

                    if(prev_tick !== undefined) {
                        d3.select(d3.selectAll(selection)[0][prev_tick])
                            .style({
                                "fill" : axis_pointer_color,
                                "font-weight" : "normal"
                            });
                    }

                    axis_data_length = d3.selectAll(selection)[0].length;

                    var len = domain.length;
                    if(options.axis_x_data_format === "number"/* && a === undefined*/) {
                        for(var curr_tick=0 ; curr_tick<axis_data_length ; curr_tick++) {
                            if(d3.selectAll(selection)[0][curr_tick].__data__ == active_tick) {
                                break;
                            }
                        }
                    } else {
                        for(curr_tick = 0;curr_tick < len;curr_tick++) {
                            if(domain[curr_tick] === active_tick) {
                                break;
                            }
                        }
                    }
                    prev_tick = curr_tick;
                    d3.selectAll(selection)
                        .style("fill","#bbb");
                    d3.select(d3.selectAll(selection)[0][curr_tick])
                        .style({
                            "fill" : axis_pointer_color,
                            "font-weight" : "bold"
                        });
                }
            }
            return this;
        },
        axisHighlightHide: function (axisHighlight,a) {
            var fill_color,selection,font_weight;
            if(PykCharts['boolean'](options.axis_onhover_highlight_enable)/* && options.mode === "default"*/){
                if(axisHighlight === options.selector + " .y.axis") {
                    selection = axisHighlight+" .tick text";
                    fill_color = options.axis_y_pointer_color;
                    font_weight = options.axis_y_pointer_weight;
                } else if(axisHighlight === options.selector + " .x.axis") {
                    selection = axisHighlight+" .tick text";
                    fill_color = options.axis_x_pointer_color;
                    font_weight = options.axis_x_pointer_weight;
                } else if(axisHighlight === options.selector + " .axis-text" && a === "column") {
                    selection = axisHighlight;
                    fill_color = options.axis_x_pointer_color;
                    font_weight = options.axis_x_pointer_weight;
                } else if(axisHighlight === options.selector + " .axis-text" && a === "bar") {
                    selection = axisHighlight;
                    fill_color = options.axis_y_pointer_color;
                    font_weight = options.axis_y_pointer_weight;
                }
                d3.selectAll(selection)
                    .style({
                        "fill" : fill_color,
                        "font-weight" : font_weight
                    });
            }

            return this;
        },
        highlight: function (selectedclass, that, has_svg_element_as_container) {
            var t = d3.select(that);
            d3.selectAll(selectedclass)
                .attr("fill-opacity", function(d,i) {
                    return (d.children && has_svg_element_as_container) ? 0 : 0.5;
                });
            t.attr("fill-opacity",1);
            return this;
        },
        highlightHide: function (selectedclass) {
            d3.selectAll(selectedclass)
                .attr("fill-opacity",function (d,i) {
                    return d3.select(this).attr("data-fill-opacity");
                });
            return this;
        },
        highlightGroup: function (selectedclass, that, element) {
            var t = d3.select(that);

            var group = d3.selectAll(selectedclass);

                group.selectAll(element)
                    .attr("fill-opacity",.5)

            t.selectAll(element).attr("fill-opacity",1);

            return this;
        },
        highlightGroupHide : function (selectedclass,element) {
            d3.selectAll(selectedclass+" "+element)
                .attr("fill-opacity",function (d,i) {
                    return d3.select(this).attr("data-fill-opacity");
                });
            return this;
        }
    };
    return action;
};

configuration.fillChart = function (options,theme,config) {
    var that = this;
    var fillchart = {
        selectColor: function (d) {
            theme = new PykCharts.Configuration.Theme({});
            if(options.color_mode === "color") {
                if(d.name.toLowerCase() === options.highlight.toLowerCase()) {
                    return options.highlight_color;
                } else if (options.chart_color.length && options.chart_color[0]){
                    return options.chart_color[0];
                } else {
                    return theme.stylesheet.chart_color
                }
            } else {
                return d.color;
            }
        },
        colorChart: function (d) {
            if(d.name === options.highlight) {
                return theme.stylesheet.highlight_color;
            } else{
                return theme.stylesheet.chart_color;
            }
        },
        colorPieW: function (d) {
            if(d.color) {
                return d.color;
            } else if(options.chart_color.length) {
                return options.color;
            }
            else return options.chart_color[0];
        },
        colorPieMS: function (d,chart_type) {
            if(chart_type !== "lineChart" && chart_type !== "areaChart" && d.name.toLowerCase() === options.highlight.toLowerCase()) {
                return options.highlight_color;
            } else if(options.color_mode === "saturation") {
                return options.saturation_color;
            } else if(options.color_mode === "color") {
                return d.color;
            }
        },
        colorGroup: function (d) {
            if(options.color_mode === "saturation") {
                return options.saturation_color;
            } else if(options.color_mode === "color") {
                return d.color;
            }
        },
        colorLegends: function (d) {
            if(options.color_mode === "saturation") {
                return options.saturation_color;
            } else if(options.color_mode === "color" && d) {
                return d;
            } else if(options.color_mode === "color"){
                return options.chart_color;
            } else {
                return options.chart_color[0];
            } return options.chart_color;
        }
    }
    return fillchart;
};

configuration.border = function (options) {
    var that = this;
    var border = {
        width: function () {
            return options.border_between_chart_elements_thickness +"px";
        },
        color: function () {
            return options.border_between_chart_elements_color;
        },
        style: function () {
            return options.border_between_chart_elements_style;
        }
    };
    return border;
};


configuration.transition = function (options) {
    var that = this;
    var transition = {
        duration: function() {
            if(options.mode === "default" && PykCharts['boolean'](options.transition_duration)) {
                return options.transition_duration * 1000;
            } else {
                return 0;
            }
        }
    };
    return transition;
};

configuration.renderBrush = function (options,xScale,group,height) {
    function resizeHandle (d) {
        var e = +(d == "e"), x = e ? 1 : -1, y = height / 3;
        return ("M" + (0.5 * x) + "," + y
                + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                + "V" + (2 * y - 6)
                + "A6,6 0 0 " + e + " " + (0.5 * x) + "," + (2 * y)
                + "Z"
                + "M" + (2.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8)
                + "M" + (4.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8));

    }

    options.make_brush = d3.svg.brush().x(xScale)
           .on("brushend", brushend)

    var brush = group.append("g")
        .attr("class", "brush")
        .call(options.make_brush);

    brush.selectAll("rect")
      .attr("height",height)
      .attr("fill","blue")
      .attr("fill-opacity",0.3);
    brush.selectAll(".resize").append("path").attr("d", resizeHandle)
            .attr("fill","#4C7190")
            .attr("stroke","#4C7190")
            .attr("stroke-width","1.5px");

    function brushend() {
        options.brush_extent = d3.event.target.extent();
        min = options.brush_extent[0];
        max = options.brush_extent[1];
        options.onBrush(xScale(min),xScale(max));
        console.log(xScale(min),xScale(max))
        return options.brush_extent;
    }
};

configuration.Theme = function(){
    var that = this;
    that.stylesheet = {
        "mode": "default",
        "selector": "",
        "interactive_enable": "no",
        "click_enable": "no",

        "chart_height": 430,
        "chart_width": 600,
        "chart_margin_top": 35,
        "chart_margin_right": 50,
        "chart_margin_bottom": 35,
        "chart_margin_left": 50,

        "title_text": "",
        "title_size": 2,
        "title_color": "#1D1D1D",
        "title_weight": "bold",
        "title_family": "'Helvetica Neue',Helvetica,Arial,sans-serif",

        "subtitle_size": 1,
        "subtitle_color": "black",
        "subtitle_weight": "normal",
        "subtitle_family": "'Helvetica Neue',Helvetica,Arial,sans-serif",

        "highlight": "",
        "highlight_color": "#08306b",
        "background_color": "transparent",
        "chart_color": ["#255AEE"],
        "saturation_color": "#255AEE",

        "border_between_chart_elements_thickness": 1,
        "border_between_chart_elements_color": "white",
        "border_between_chart_elements_style": "solid",

        "legends_enable": "yes",
        "legends_display": "horizontal",
        "legends_text_size": 11,
        "legends_text_color": "#1D1D1D",
        "legends_text_weight": "normal",
        "legends_text_family": "'Helvetica Neue',Helvetica,Arial,sans-serif",

        "label_size": 11,
        "label_color": "white",
        "label_weight": "normal",
        "label_family": "'Helvetica Neue',Helvetica,Arial,sans-serif",

        "pointer_overflow_enable": "yes",
        "pointer_thickness": 1,
        "pointer_weight": "normal",
        "pointer_size": 11,
        "pointer_color": "#1D1D1D",
        "pointer_family": "'Helvetica Neue',Helvetica,Arial,sans-serif",

        "export_enable": "no",

        "color_mode": "color",

        "axis_x_pointer_size": 11,
        "axis_x_pointer_family": "'Helvetica Neue',Helvetica,Arial,sans-serif",
        "axis_x_pointer_weight": "normal",
        "axis_x_pointer_color": "#1D1D1D",

        "axis_x_enable": "yes",

        "axis_x_title": "",
        "axis_x_title_size": 14,
        "axis_x_title_color": "#1D1D1D",
        "axis_x_title_weight": "bold",
        "axis_x_title_family": "'Helvetica Neue',Helvetica,Arial,sans-serif",

        "axis_x_position": "bottom",
        "axis_x_pointer_position": "bottom", //axis orient
        "axis_x_line_color": "#1D1D1D",
        "axis_x_no_of_axis_value": 5,
        "axis_x_pointer_length": 5,
        "axis_x_pointer_padding": 6,
        "axis_x_pointer_values": [],
        "axis_x_outer_pointer_length": 0,
        "axis_x_time_value_datatype":"",
        "axis_x_time_value_interval":0,
        "axisHighlight_x_data_format": "string",

        "loading_source": "<div class='PykCharts-loading'>loading...</div>",
        "loading_type": "css",

        "tooltip_enable": "yes",
        "tooltip_mode": "moving",

        "credit_my_site_name": "PykCharts",
        "credit_my_site_url": "http://www.pykcharts.com/",
        "chart_onhover_highlight_enable": "yes",
        "units_prefix": false,
        "units_suffix":false
    };

    that.functionality = {
        "real_time_charts_refresh_frequency": 0,
        "real_time_charts_last_updated_at_enable": "yes",
        "transition_duration": 0
    };

    that.oneDimensionalCharts = {
        "clubdata_enable": "yes",
        "clubdata_text": "Others",
        "clubdata_maximum_nodes": 5,
        "shade_color": "#255AEE",
        "pie_radius_percent": 70,
        "donut_radius_percent": 70,
        "donut_inner_radius_percent": 40,
        "donut_show_total_at_center": "yes",
        "donut_show_total_at_center_size": 24,
        "donut_show_total_at_center_color": "#1D1D1D",
        "donut_show_total_at_center_weight": "bold",
        "donut_show_total_at_center_family":"'Helvetica Neue',Helvetica,Arial,sans-serif",

        "funnel_rect_width": 100,
        "funnel_rect_height": 100,

        "percent_column_rect_width": 20,
        "percent_row_rect_height": 10,
    };

    that.otherCharts = {
        "pictograph_show_all_images": "yes",
        "pictograph_total_count_enable": "yes",
        "pictograph_current_count_enable": "yes",
        "pictograph_image_per_line": 3,
        "pictograph_image_width": 79,
        "pictograph_image_height": 66,
        "pictograph_current_count_size": 64,
        "pictograph_current_count_color": "#255aee",
        "pictograph_current_count_weight": "normal",
        "pictograph_current_count_family": "'Helvetica Neue',Helvetica,Arial,sans-serif",
        "pictograph_total_count_size": 64,
        "pictograph_total_count_color": "grey",
        "pictograph_total_count_weight": "normal",
        "pictograph_total_count_family": "'Helvetica Neue',Helvetica,Arial,sans-serif",
        "pictograph_units_per_image_text_size": 24,
        "pictograph_units_per_image_text_color": "grey",
        "pictograph_units_per_image_text_weight": "normal",
        "pictograph_units_per_image_text_family": "'Helvetica Neue',Helvetica,Arial,sans-serif"
    };

    that.multiDimensionalCharts = {

        "chart_grid_x_enable": "yes",
        "chart_grid_y_enable": "yes",
        "chart_grid_color":"#ddd",

        "axis_onhover_highlight_enable": "yes",

        "axis_y_pointer_size": 11,
        "axis_y_pointer_family": "'Helvetica Neue',Helvetica,Arial,sans-serif",
        "axis_y_pointer_weight": "normal",
        "axis_y_pointer_color": "#1D1D1D",
        "axis_y_enable": "yes",

        "axis_y_title": "",
        "axis_y_title_size": 14,
        "axis_y_title_color": "#1D1D1D",
        "axis_y_title_weight": "bold",
        "axis_y_title_family": "'Helvetica Neue',Helvetica,Arial,sans-serif",

        "axis_y_position": "left",
        "axis_y_pointer_position": "left",
        "axis_y_line_color": "#1D1D1D",
        "axis_y_no_of_axis_value": 5,
        "axis_y_pointer_length": 5,
        "axis_y_pointer_padding": 6,
        "axis_y_pointer_values": [],
        "axis_y_outer_pointer_length": 0,
        "axis_y_time_value_datatype":"",
        "axis_y_time_value_interval":0,
        "axis_y_data_format": "number",
        "variable_circle_size_enable": "yes",

        "crosshair_enable": "yes",
        "zoom_enable": "no",
        "zoom_level": 3,

        "spiderweb_outer_radius_percent": 100,

        "scatterplot_radius": 20,
        "scatterplot_pointer_enable": "no",

        "curvy_lines_enable": "no",

        "annotation_enable": "no",
        "annotation_view_mode": "onload", // "onload" / "onclick"

        "annotation_background_color" : "#C2CBCF", /*"#EEEEEE"*/
        "annotation_font_color" : "black",
        "legends_mode":"default", // or interactive
        "expand_group": "yes",
        "data_mode_enable" : "no",
        "data_mode_legends_color" : "black",
        "data_mode_default" : "percentage",
        "connecting_lines_color" : "#ddd",
        "connecting_lines_style": "solid",
        "text_between_steps_color": "#aaa",
        "text_between_steps_family": "'Helvetica Neue',Helvetica,Arial,sans-serif",
        "text_between_steps_size": 10,
        "text_between_steps_weight" : "normal",
        "data_mode_enable" : "no",
        "data_mode_legends_color" : "black",
        "data_mode_default" : "percentage",
        "connecting_lines_color" : "#ddd",
        "connecting_lines_style": "solid",

        "data_sort_enable": "yes",
        "data_sort_type": "alphabetically", // sort type --- "alphabetically" / "numerically" / "date"
        "data_sort_order": "ascending", // sort order --- "descending" / "ascending"
        "calculate_total": "yes",
        "axis_y_background_color": "transparent"
    };

    that.treeCharts = {
        "zoom_enable": "no",
        "nodeRadius": 4.5
    };

    that.mapsTheme = {
        "total_no_of_colors": 3,
        "palette_color": "Blue-1",

        "tooltip_position_top": 0,
        "tooltip_position_left": 0,

        "timeline_duration": 1,
        "timeline_margin_top": 5,
        "timeline_margin_right": 25,
        "timeline_margin_bottom": 25,
        "timeline_margin_left": 45,

        "label_enable": "no",
        "click_enable": "yes",

        "chart_onhover_effect": "shadow"
    };
    return that;
}

PykCharts.validation = {};
PykCharts.oneD = {};
PykCharts.other = {};
PykCharts.validation.processInputs = function (chartObject, options, chart_type) {
    var theme = new PykCharts.Configuration.Theme({})
	    , stylesheet = theme.stylesheet
	    , functionality = theme.functionality
	    , oneDimensionalCharts = theme.oneDimensionalCharts
	    , multiDimensionalCharts = theme.multiDimensionalCharts
        , mapsTheme = theme.mapsTheme;

        chartObject.title_text = options.title_text;
        chartObject.subtitle_text = options.subtitle_text;
        if(options.credit_my_site_name || options.credit_my_site_url) {
            chartObject.credit_my_site_name = options.credit_my_site_name ? options.credit_my_site_name : "";
            chartObject.credit_my_site_url = options.credit_my_site_url ? options.credit_my_site_url : "";
        } else {
            chartObject.credit_my_site_name = stylesheet.credit_my_site_name;
            chartObject.credit_my_site_url = stylesheet.credit_my_site_url;
        }
        chartObject.data_source_name = options.data_source_name ? options.data_source_name : "";
        chartObject.data_source_url = options.data_source_url ? options.data_source_url : "";
        chartObject.default_color = stylesheet.chart_color;

    var config_param_info = [
    	{
    		'config_name': 'selector',
    		'default_value': stylesheet,
    		'validation_type': 'validatingSelector',
            'all_charts': true
    	},
    	{
    		'config_name': 'chart_color',
    		'default_value': stylesheet,
    		'validation_type': 'isArray',
            'all_charts': true
    	},
        {
            'config_name': 'axis_x_pointer_values',
            'default_value': stylesheet,
            'validation_type': 'isArray',
            'maps':true,
            'multiDimensionalCharts':true
        },
        {
            'config_name': 'axis_y_pointer_values',
            'default_value': multiDimensionalCharts,
            'validation_type': 'isArray',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'mode',
            'default_value': stylesheet,
            'validation_type': 'validatingChartMode',
            'condition2': convertToLowerCase,
            'oneDimensionalCharts': true,
            'multiDimensionalCharts':true,
            'other': true
        },
    	{
    		'config_name': 'chart_width',
    		'default_value': stylesheet,
    		'validation_type': 'validatingDataType',
            'all_charts':true
    	},
        {
            'config_name': 'title_size',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'all_charts':true

        },
        {
            'config_name': 'subtitle_size',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'all_charts':true
        },
        {
            'config_name': 'border_between_chart_elements_thickness',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'all_charts':true
        },
        {
            'config_name': 'label_size',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'all_charts':true
        },
        {
            'config_name': 'pointer_thickness',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'oneDimensionalCharts':true,
            'multiDimensionalCharts':true
        },
        {
            'config_name': 'pointer_size',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'oneDimensionalCharts':true,
            'multiDimensionalCharts':true
        },
        {
            'config_name': 'axis_x_title_size',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'multiDimensionalCharts':true
        },
        {
            'config_name': 'axis_y_title_size',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'multiDimensionalCharts':true
        },
        {
            'config_name': 'legends_text_size',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'maps':true,
            'multiDimensionalCharts':true
        },
        {
            'config_name': 'axis_x_pointer_size',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'maps':true,
            'multiDimensionalCharts':true
        },
        {
            'config_name': 'axis_y_pointer_size',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'multiDimensionalCharts':true
        },
        {
            'config_name': 'axis_x_pointer_length',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'maps':true,
            'multiDimensionalCharts':true
        },
        {
            'config_name': 'axis_y_pointer_length',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_x_outer_pointer_length',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'maps':true,
            'multiDimensionalCharts':true
        },
        {
            'config_name': 'axis_y_outer_pointer_length',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'multiDimensionalCharts':true
        },
        {
            'config_name': 'real_time_charts_refresh_frequency',
            'default_value': functionality,
            'validation_type': 'validatingDataType',
            'all_charts':true
        },
        {
            'config_name': 'transition_duration',
            'default_value': functionality,
            'validation_type': 'validatingDataType',
            'oneDimensionalCharts': true,
            'multiDimensionalCharts':true,
            'other': true
        },
        {
            'config_name': 'clubdata_maximum_nodes',
            'default_value': oneDimensionalCharts,
            'validation_type': 'validatingDataType',
            'oneDimensionalCharts':true
        },
        {
            'config_name': 'title_weight',
            'default_value': stylesheet,
            'validation_type': 'validatingFontWeight',
            'condition2' : convertToLowerCase,
            'all_charts': true
        },
        {
            'config_name': 'subtitle_weight',
            'default_value': stylesheet,
            'validation_type': 'validatingFontWeight',
            'condition2' : convertToLowerCase,
            'all_charts': true
        },
        {
            'config_name': 'pointer_weight',
            'default_value': stylesheet,
            'validation_type': 'validatingFontWeight',
            'condition2' : convertToLowerCase,
            'oneDimensionalCharts': true,
            'multiDimensionalCharts':true
        },
        {
            'config_name': 'label_weight',
            'default_value': stylesheet,
            'validation_type': 'validatingFontWeight',
            'condition2' : convertToLowerCase,
            'all_charts': true
        },
        {
            'config_name': 'background_color',
            'default_value': stylesheet,
            'validation_type': 'validatingColor',
            'all_charts': true
        },
        {
            'config_name': 'shade_color',
            'default_value': oneDimensionalCharts,
            'validation_type': 'validatingColor',
            'oneDimensionalCharts': true
        },
        {
            'config_name': 'title_color',
            'default_value': stylesheet,
            'validation_type': 'validatingColor',
            'all_charts': true
        },
        {
            'config_name': 'subtitle_color',
            'default_value': stylesheet,
            'validation_type': 'validatingColor',
            'all_charts': true
        },
        {
            'config_name': 'highlight_color',
            'default_value': stylesheet,
            'validation_type': 'validatingColor',
            'all_charts': true
        },
        {
            'config_name': 'label_color',
            'default_value': stylesheet,
            'validation_type': 'validatingColor',
            'all_charts': true
        },
        {
            'config_name': 'pointer_color',
            'default_value': stylesheet,
            'validation_type': 'validatingColor',
            'oneDimensionalCharts': true,
            'multiDimensionalCharts':true
        },
        {
            'config_name': 'border_between_chart_elements_color',
            'default_value': stylesheet,
            'validation_type': 'validatingColor',
            'all_charts': true
        },
        {
            'config_name': 'axis_x_time_value_datatype',
            'default_value': stylesheet,
            'validation_type': 'validatingTimeScaleDataType',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_y_time_value_datatype',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingTimeScaleDataType',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'chart_height',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'multiDimensionalCharts': true,
            'maps': true
        },
        {
            'config_name': 'chart_margin_left',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'chart_margin_right',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'chart_margin_top',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'chart_margin_bottom',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'condition1': findInObject,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'zoom_level',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingDataType',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_x_pointer_padding',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'multiDimensionalCharts': true,
            'maps': true
        },
        {
            'config_name': 'axis_y_pointer_padding',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingDataType',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_x_no_of_axis_value',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_y_no_of_axis_value',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingDataType',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_x_time_value_interval',
            'default_value': stylesheet,
            'validation_type': 'validatingDataType',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_y_time_value_interval',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingDataType',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'legends_text_color',
            'default_value': stylesheet,
            'validation_type': 'validatingColor',
            'multiDimensionalCharts': true,
            'maps': true
        },
        {
            'config_name': 'axis_x_pointer_color',
            'default_value': stylesheet,
            'validation_type': 'validatingColor',
            'multiDimensionalCharts': true,
            'maps': true
        },
        {
            'config_name': 'axis_y_pointer_color',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingColor',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_x_title_color',
            'default_value': stylesheet,
            'validation_type': 'validatingColor',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_y_title_color',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingColor',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_x_line_color',
            'default_value': stylesheet,
            'validation_type': 'validatingColor',
            'multiDimensionalCharts': true,
            'maps': true
        },
        {
            'config_name': 'axis_y_line_color',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingColor',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'annotation_font_color',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingColor',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'annotation_background_color',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingColor',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'chart_grid_color',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingColor',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'legends_display',
            'default_value': stylesheet,
            'validation_type': 'validatingLegendsPosition',
            'multiDimensionalCharts': true,
            'maps': true
        },
        {
            'config_name': 'tooltip_mode',
            'default_value': stylesheet,
            'validation_type': 'validatingTooltipMode',
            'multiDimensionalCharts': true,
            'maps': true
        },
        {
            'config_name': 'legends_text_weight',
            'default_value': stylesheet,
            'validation_type': 'validatingFontWeight',
            'condition2' : convertToLowerCase,
            'multiDimensionalCharts': true,
            'maps': true
        },
        {
            'config_name': 'axis_y_pointer_weight',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingFontWeight',
            'condition2' : convertToLowerCase,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_x_pointer_weight',
            'default_value': stylesheet,
            'validation_type': 'validatingFontWeight',
            'condition2' : convertToLowerCase,
            'multiDimensionalCharts': true,
            'maps': true
        },
        {
            'config_name': 'axis_y_title_weight',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingFontWeight',
            'condition2' : convertToLowerCase,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_x_title_weight',
            'default_value': stylesheet,
            'validation_type': 'validatingFontWeight',
            'condition2' : convertToLowerCase,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_y_position',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingYAxisPointerPosition',
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_x_position',
            'default_value': stylesheet,
            'validation_type': 'validatingXAxisPointerPosition',
            'condition2': convertToLowerCase,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_y_pointer_position',
            'default_value': multiDimensionalCharts,
            'validation_type': 'validatingYAxisPointerPosition',
            'condition2': convertToLowerCase,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_x_pointer_position',
            'default_value': stylesheet,
            'validation_type': 'validatingXAxisPointerPosition',
            'condition2': convertToLowerCase,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'color_mode',
            'default_value': stylesheet,
            'validation_type': 'validatingColorMode',
            'condition2': convertToLowerCase,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'border_between_chart_elements_style',
            'default_value': stylesheet,
            'condition2': convertToLowerCase,
            'all_charts': true
        },
        {
            'config_name': 'clubdata_text',
            'default_value':oneDimensionalCharts,
            'oneDimensionalCharts': true
        },
        {
            'config_name': 'saturation_color',
            'default_value': stylesheet,
            'multiDimensionalCharts': true,
            'maps': true
        },
        {
            'config_name': 'timeline_duration',
            'default_value': mapsTheme,
            'maps': true,
            'condition1':findInObject
        }
    ];


    chartObject.k = new PykCharts.Configuration(chartObject);
    var validator = chartObject.k.validator();

    for (var i=0,config_length=config_param_info.length; i<config_length; i++) {
        var config = config_param_info[i];
        if(config[chart_type] || config.all_charts) {
            var config_name = config.config_name
            , default_value = config.default_value[config_name]
            , condition1 = !config.condition1 ? options[config_name] : config.condition1(config_name);

            if(config_name in options) {
                var condition2  = !config.condition2 ? options[config_name] : config.condition2(options[config_name]);
            }
            chartObject[config_name] = condition1 ? condition2 : default_value;
            if(config.validation_type) {
                validator[config.validation_type](chartObject[config_name],config_name,default_value);
            }
        }
    }

    if (chart_type === "maps") {
        chartObject.axis_x_pointer_position = options.axis_x_pointer_position ? options.axis_x_pointer_position : "top";
        validator.validatingXAxisPointerPosition(chartObject.axis_x_pointer_position,"axis_x_pointer_position","top");
    }

    if(chart_type === "oneDimensionalCharts") {
        chartObject.color_mode = options.color_mode ? options.color_mode : "shade";
        validator.validatingColorMode(chartObject.color_mode,"color_mode","shade",chart_type);
    }
    else if (chart_type === "maps") {
        chartObject.color_mode = options.color_mode ? options.color_mode : "saturation";
        validator.validatingColorMode(chartObject.color_mode,"color_mode","saturation",chart_type);
    }

    var enable_config_param = [
        {
            'config_name':'interactive_enable',
            'default_value': stylesheet,
            'all_charts':true
        },
        {
            'config_name':'click_enable',
            'default_value': stylesheet,
            'all_charts':true
        },
        {
            'config_name': 'tooltip_enable',
            'default_value': stylesheet,
            'all_charts': true
        },
        {
            'config_name': 'export_enable',
            'default_value': stylesheet,
            'all_charts': true
        },
        {
            'config_name': 'real_time_charts_last_updated_at_enable',
            'default_value': functionality,
            'all_charts': true
        },
        {
            'config_name': 'clubdata_enable',
            'default_value': oneDimensionalCharts,
            'oneDimensionalCharts': true
        },
        {
            'config_name': 'pointer_overflow_enable',
            'default_value': stylesheet,
            'oneDimensionalCharts': true
        },
        {
            'config_name': 'chart_onhover_highlight_enable',
            'default_value': stylesheet,
            'all_charts': true
        },
        {
            'config_name': 'chart_grid_x_enable',
            'default_value': multiDimensionalCharts,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'chart_grid_y_enable',
            'default_value': multiDimensionalCharts,
            'multiDimensionalCharts': true
        },
        {
            'config_name':'axis_x_enable',
            'default_value': stylesheet,
            'multiDimensionalCharts': true,
            'maps': true
        },
        {
            'config_name': 'axis_y_enable',
            'default_value': multiDimensionalCharts,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_onhover_highlight_enable',
            'default_value': multiDimensionalCharts,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'zoom_enable',
            'default_value': multiDimensionalCharts,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'annotation_enable',
            'default_value': multiDimensionalCharts,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'legends_enable',
            'default_value': stylesheet,
            'multiDimensionalCharts': true,
            'maps': true
        },
        {
            'config_name': 'variable_circle_size_enable',
            'default_value': multiDimensionalCharts,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'title_family',
            'default_value':stylesheet,
            'all_charts':true
        },
        {
            'config_name': 'subtitle_family',
            'default_value':stylesheet,
            'all_charts':true
        },
        {
            'config_name': 'pointer_family',
            'default_value':stylesheet,
            'oneDimensionalCharts':true,
            'multiDimensionalCharts':true
        },
        {
            'config_name': 'title_family',
            'default_value':stylesheet,
            'all_charts':true
        },
        {
            'config_name': 'label_family',
            'default_value':stylesheet,
            'all_charts':true
        },
        {
            'config_name': 'units_suffix',
            'default_value':stylesheet,
            'oneDimensionalCharts':true
        },
        {
            'config_name': 'units_prefix',
            'default_value':stylesheet,
            'oneDimensionalCharts':true
        },
        {
            'config_name':'highlight',
            'default_value': stylesheet,
            'all_charts': true
        },
        {
            'config_name': 'axis_x_title_family',
            'default_value': stylesheet,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_y_title_family',
            'default_value': multiDimensionalCharts,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'legends_text_family',
            'default_value': stylesheet,
            'multiDimensionalCharts': true,

        },
        {
            'config_name': 'axis_x_title',
            'default_value': stylesheet,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'axis_y_title',
            'default_value': stylesheet,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'map_code',
            'default_value': mapsTheme,
            'maps': true
        },
        {
            'config_name': 'click_enable',
            'default_value': mapsTheme,
            'maps': true
        },
        {
            'config_name': 'annotation_view_mode',
            'default_value': multiDimensionalCharts,
            'multiDimensionalCharts': true
        },
        {
            'config_name': 'loading_type',
            'default_value': stylesheet,
            'all_charts': true
        },
        {
            'config_name': 'loading_source',
            'default_value': stylesheet,
            'all_charts': true
        }
    ];


    for (var i = 0, len = enable_config_param.length; i<len; i++) {
        var config = enable_config_param[i];
        if(config[chart_type] || config.all_charts) {
            var config_name = config.config_name;
            var default_value = config.default_value[config_name];
            chartObject[config_name] = options[config_name] ? options[config_name] : default_value;
        }
    }

    chartObject.clubdata_always_include_data_points = PykCharts['boolean'](chartObject.clubdata_enable) && options.clubdata_always_include_data_points ? options.clubdata_always_include_data_points : [];
    validator.isArray(chartObject.clubdata_always_include_data_points,"clubdata_always_include_data_points");

    switch(chartObject.border_between_chart_elements_style) {
        case "dotted" : chartObject.border_between_chart_elements_style = "1,3";
                        break;
        case "dashed" : chartObject.border_between_chart_elements_style = "5,5";
                       break;
        default : chartObject.border_between_chart_elements_style = "0";
                  break;
    }

    if(chart_type === 'oneDimensionalCharts' || chart_type === 'maps') {
        if(chartObject.chart_color[0]) {
            chartObject.k.validator()
                .validatingColor(chartObject.chart_color[0],"chart_color",stylesheet.chart_color);
        }
    } else {
        for(var i = 0;i < chartObject.chart_color.length;i++) {
            if(chartObject.chart_color[i]) {
                chartObject.k.validator()
                    .validatingColor(chartObject.chart_color[i],"chart_color",stylesheet.chart_color);
            }
        }
    }

    function convertToLowerCase(value) {
        return value.toLowerCase();
    }

    function findInObject(value) {
        return value in options;
    }
    chartObject.k = new PykCharts.Configuration(chartObject);
    return chartObject;
}
PykCharts.oneD.bubble = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});
    this.execute = function (pykquery_data) {
        that = new PykCharts.validation.processInputs(that, options,'oneDimensionalCharts');
        that.chart_height = options.chart_height ? options.chart_height : that.chart_width;

        that.k.validator()
            .validatingDataType(that.chart_height,"chart_height",that.chart_width);

        that.k.storeInitialDivHeight();
        if(that.mode === "default") {
            that.k.loading();
        }

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);

            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }

            that.data = that.k.__proto__._groupBy("oned",data);
            that.compare_data = that.k.__proto__._groupBy("oned",data);
            that.k.remove_loading_bar(id);
            that.clubdata_enable = that.data.length>that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            that.render();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };

    this.refresh = function (pykquery_data) {
        that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("oned",data);
            that.clubdata_enable = that.data.length>that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            that.refresh_data = that.k.__proto__._groupBy("oned",data);
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data)
                , shade_array = [];
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }
            that.new_data = that.optionalFeatures().clubData();
            if(that.color_mode === "shade") {
                shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.children.length);
                shade_array.reverse();
                that.new_data.children.forEach(function (d,i) {
                    d.color = shade_array[i];
                })
            }
            that.optionalFeatures()
                .createChart()
                .label();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
    };

    this.render = function () {

        var id = that.selector.substring(1,that.selector.length);
        var container_id = id + "_svg"
            , shade_array = [];

        that.fillChart = new PykCharts.Configuration.fillChart(that);
        that.transitions = new PykCharts.Configuration.transition(that);
        if (that.mode ==="default") {

            that.k.title()
                .backgroundColor(that)
                .export(that,"#"+container_id,"bubble")
                .emptyDiv(that.selector)
                .subtitle();

            that.new_data = that.optionalFeatures().clubData();
            if(that.color_mode === "shade") {
                shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.children.length);
                shade_array.reverse();
                that.new_data.children.forEach(function (d,i) {
                    d.color = shade_array[i];
                })
            }
            that.optionalFeatures().svgContainer(container_id)
                .createChart()
                .label();

            that.k.createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource()
                .liveData(that)
                .tooltip();
        }
        else if (that.mode === "infographics") {
            that.k.backgroundColor(that)
                .export(that,"#" + container_id,"bubble")
                .emptyDiv(that.selector);

            that.new_data = {"children" : that.data};
            if(that.color_mode === "shade") {
                shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.children.length);
                shade_array.reverse();
                that.new_data.children.forEach(function (d,i) {
                    d.color = shade_array[i];
                })
            }
            that.optionalFeatures().svgContainer(container_id)
                .createChart()
                .label();

            that.k.tooltip();

        }
        that.k.exportSVG(that,"#"+container_id,"bubble")
        that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
        var resize = that.k.resize(that.svgContainer);
        that.k.__proto__._ready(resize);
        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer);
        });
    };

    this.optionalFeatures = function () {
        var optional = {
            svgContainer: function (container_id) {
                that.svgContainer = d3.select(that.selector).append("svg")
                    .attr({
                        "class": "svgcontainer PykCharts-oneD",
                        "id": container_id,
                        "preserveAspectRatio": "xMinYMin",
                        "viewBox": "0 0 " + that.chart_width + " " + that.chart_height,
                        "width": that.chart_width,
                        "height": that.chart_height
                    });
                that.group = that.svgContainer.append("g")
                    .attr("id","bubgrp");
                return this;
            },
            createChart : function () {
                var bubble = d3.layout.pack()
                    .sort(function (a,b) { return b.weight - a.weight; })
                    .size([that.chart_width, that.chart_height])
                    .value(function (d) { return d.weight; })
                    .padding(20);

                that.sum = d3.sum(that.new_data.children, function (d) {
                    return d.weight;
                });

                var l = that.new_data.children.length;
                that.node = bubble.nodes(that.new_data);

                var chart_data = that.group.selectAll(".bubble-node")
                    .data(that.node);

                chart_data.enter()
                    .append("g")
                    .attr("class","bubble-node")
                    .append("circle");

                chart_data.attr("class","bubble-node")
                    .select("circle")
                    .attr({
                        "class": "bubble",
                        "id":function (d,i) {
                            return "bubble"+i;
                        },
                        "x":function (d) { return d.x; },
                        "y":function (d) { return d.y; },
                        "r": 0,
                        "transform": function (d) { return "translate(" + d.x + "," + d.y +")"; },
                        "fill": function (d) {
                            return d.children ? that.background_color : that.fillChart.selectColor(d);
                        },
                        "fill-opacity": function(d) {
                            return d.children ? 0 : 1;
                        },
                        "data-fill-opacity": function () {
                            return d3.select(this).attr("fill-opacity");
                        },
                        "data-id":function (d,i) {
                            return d.name;
                        }
                    })
                    .on({
                        "mouseover": function (d) {
                            if(!d.children && that.mode==="default") {
                                if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlight(that.selector+" "+".bubble", this, true);
                                }
                                d.tooltip = d.tooltip ||"<table><thead><th colspan='2' class='tooltip-heading'>"+d.name+"</th></thead><tr><td class='tooltip-left-content'>"+that.k.appendUnits(d.weight)+"  <td class='tooltip-right-content'>("+((d.weight*100)/that.sum).toFixed(1)+"%)</tr></table>";
                                that.mouseEvent.tooltipPosition(d);
                                that.mouseEvent.tooltipTextShow(d.tooltip);
                            }
                        },
                        "mouseout": function (d) {
                            if(that.mode==="default") {
                                that.mouseEvent.tooltipHide(d)
                                if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlightHide(that.selector+" "+".bubble");
                                }
                            }
                        },
                        "mousemove": function (d) {
                            if(!d.children && that.mode==="default") {
                                that.mouseEvent.tooltipPosition(d);
                            }
                        },
                        'click': function (d,i) {
                            if(PykCharts['boolean'](that.click_enable)){
                               that.addEvents(d.name, d3.select(this).attr("data-id"));
                            }
                        }
                    })
                    .transition()
                    .duration(that.transitions.duration())
                    .attr("r",function (d) {return d.r; });
                chart_data.exit().remove();

                return this;
            },
            label : function () {
                var chart_text = that.group.selectAll(".name")
                        .data(that.node);

                var chart_text1 = that.group.selectAll(".weight")
                    .data(that.node);

                chart_text.enter()
                    .append("svg:text")
                    .attr("class","name");

                chart_text1.enter()
                    .append("svg:text")
                    .attr("class","weight");

                chart_text.attr("class","name")
                    .attr({
                        "x": function (d) { return d.x },
                        "y": function (d) { return d.y -5 }
                    });

                chart_text1.attr("class","weight")
                    .attr({
                        "x": function (d) { return d.x },
                        "y": function (d) { return + d.y + that.label_size; }
                    });

                chart_text.attr("text-anchor","middle")
                    .attr("fill", function(d) {
                        if(that.color_mode === "shade" && !d.children && !options.label_color) {
                            var color_value = that.k.__proto__._colourBrightness(d.color);
                            if(color_value === "light") {
                                return "black";
                            } else {
                                return "white";
                            }
                        }
                        return that.label_color;
                    })
                    .style({
                        "font-weight": that.label_weight,
                        "font-size": that.label_size + "px",
                        "font-family": that.label_family
                    })
                    .text("")

                    function chart_text_timeout() {
                        chart_text
                            .text(function (d) { return d.children ? " " :  d.name; })
                            .attr("pointer-events","none")
                            .text(function (d) {
                                if(this.getBBox().width< 0.85*(2*d.r) && this.getBBox().height<2*d.r) {
                                    return d.children ? " " :  d.name;
                                }
                                else {
                                    return "";
                                }
                            });
                    }
                    setTimeout(chart_text_timeout,that.transitions.duration());

                    chart_text1
                        .attr({
                            "text-anchor":"middle",
                            "fill": function(d) {
                                if(that.color_mode === "shade" && !d.children && !options.label_color) {
                                    var color_value = that.k.__proto__._colourBrightness(d.color);
                                    if(color_value === "light") {
                                        return "black";
                                    } else {
                                        return "white";
                                    }
                                }
                                return that.label_color;
                            },
                            "pointer-events": "none"
                        })
                        .style({
                            "font-family": that.label_family,
                            "font-weight": that.label_weight,
                            "font-size": that.label_size + "px"
                        })
                        .text("")

                    function label_timeout() {
                        chart_text1.text(function (d) { return d.children ? " " :  that.k.appendUnits(d.weight); })
                            .text(function (d) {
                                if(this.getBBox().width<2*d.r*0.55 && this.getBBox().height<2*d.r*0.55) {
                                    return d.children ? " " :  ((d.weight*100)/that.sum).toFixed(1)+"%"; /*that.k.appendUnits(d.weight);*/
                                }
                                else {
                                    return "";
                                }
                            });
                    }
                    setTimeout(label_timeout,that.transitions.duration());

                    chart_text.exit()
                        .remove();
                    chart_text1.exit()
                        .remove();
                return this;
            },
            clubData : function () {
                var new_data1,data_length = that.data.length;

                if (PykCharts['boolean'](that.clubdata_enable)) {
                    var clubdata_content = [];
                    var k = 0, j, i, new_data = [];
                    if(data_length <= that.clubdata_maximum_nodes) {
                        new_data1 = { "children" : that.data };
                        return new_data1;
                    }
                    if (that.clubdata_always_include_data_points.length!== 0) {
                        var l = that.clubdata_always_include_data_points.length;
                        for (i =0; i<l; i++) {
                            clubdata_content[i] = that.clubdata_always_include_data_points[i];
                        }
                    }
                    for (i=0; i<clubdata_content.length; i++) {
                        for (j=0; j<data_length; j++) {
                            if (clubdata_content[i].toUpperCase() === that.data[j].name.toUpperCase()) {
                                new_data.push(that.data[j]);
                            }
                        }
                    }

                    that.data.sort (function (a,b) { return b.weight - a.weight;});
                    while (new_data.length < that.clubdata_maximum_nodes-1) {
                        for(i=0;i<clubdata_content.length;i++) {
                            if(that.data[k].name.toUpperCase() === clubdata_content[i].toUpperCase()) {
                                k++;
                            }
                        }
                        new_data.push(that.data[k]);
                        k++;
                    }
                    var sum_others = 0;
                    for(j=k; j<data_length; j++) {
                        for (i=0; i<new_data.length && j<that.data.length; i++) {
                            if(that.data[j].name.toUpperCase() === new_data[i].name.toUpperCase()) {
                                sum_others+=0;
                                j++;
                                i = -1;
                            }
                        }
                        if(j<that.data.length) {
                            sum_others += that.data[j].weight;
                        }
                    }
                    var f = function (a,b) {return b.weight- a.weight;};
                    while (new_data.length > that.clubdata_maximum_nodes) {
                        new_data.sort(f);
                        var a = new_data.pop();
                    }

                    var others_Slice = {"name": that.clubdata_text,"weight": sum_others, "color": that.clubData_color,"tooltip": that.clubData_tooltipText,"highlight":false};

                    if (new_data.length < that.clubdata_maximum_nodes) {
                        new_data.push(others_Slice);

                    }
                    new_data.sort(function (a,b) {
                        return a.weight - b.weight;
                    })

                    new_data1 = {"children": new_data};
                    that.map1 = new_data1.children.map(function (d) { return d.weight;});
                }
                else {
                    that.data.sort(function (a,b) {
                        return a.weight - b.weight;
                    })
                    new_data1 = { "children" : that.data };
                }
                return new_data1;
            }
        };
        return optional;
    };
};

PykCharts.oneD.funnel = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});
    this.execute = function (pykquery_data) {
        that = new PykCharts.validation.processInputs(that, options, 'oneDimensionalCharts');
        that.chart_height = options.chart_height ? options.chart_height : that.chart_width;
        var optional = options.optional,
            functionality = theme.oneDimensionalCharts;
        that.funnel_rect_width =  options.funnel_rect_width   ? options.funnel_rect_width : functionality.funnel_rect_width;
        that.funnel_rect_height = options.funnel_rect_height  ? options.funnel_rect_height : functionality.funnel_rect_height;
        that.k.validator()
            .validatingDataType(that.chart_height,"chart_height",that.chart_width)
            .validatingDataType(that.funnel_rect_width,"funnel_rect_width",functionality.funnel_rect_width)
            .validatingDataType(that.funnel_rect_height,"funnel_rect_height",functionality.funnel_rect_height);

        try {
            if(that.funnel_rect_width >= that.chart_width) {
                throw "funnel_rect_width";
            }
        }
        catch (e) {
            that.funnel_rect_width  = functionality.funnel_rect_width;
            console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(Invalid value for attribute \"funnel_rect_width\")  Visit www.pykcharts.com/errors#warning_19");
        }

        if(that.stop) {
            return;
        }
        that.k.storeInitialDivHeight();
        if(that.mode === "default") {
           that.k.loading();
        }

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }
            that.data = that.k.__proto__._groupBy("oned",data);
            that.compare_data = that.k.__proto__._groupBy("oned",data);
            that.k.remove_loading_bar(id);
            that.render();
        };
        if (PykCharts['boolean'](options.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }

    };
    this.refresh = function (pykquery_data) {
        that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("oned",data);
            that.refresh_data = that.k.__proto__._groupBy("oned",data);
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }
            that.optionalFeatures()
                    .createChart()
                    .label()
                    .ticks();
        };
        if (PykCharts['boolean'](options.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
    };

    this.render = function () {
        var that = this;
        var id = that.selector.substring(1,that.selector.length);
        var container_id = id + "_svg";
        that.fillChart = new PykCharts.Configuration.fillChart(that);
        that.transitions = new PykCharts.Configuration.transition(that);

        if(that.mode === "default") {
            that.k.title()
                .backgroundColor(that)
                .export(that,"#"+container_id,"funnel")
                .emptyDiv(that.selector)
                .subtitle();
        }
        that.k.tooltip();
        that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
        if(that.mode === "infographics") {
            that.k.backgroundColor(that)
                .export(that,"#"+container_id,"funnel")
                .emptyDiv(that.selector);

            that.new_data = that.data;
        }
        if(that.mode === "default") {
            that.optionalFeatures();
        }
        that.optionalFeatures().svgContainer(container_id)
            .createChart()
            .label()
            .ticks();
        if(that.mode === "default") {
            that.k.liveData(that)
                .createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource();
        }

        var add_extra_width = 0;
            setTimeout(function () {
                if(that.ticks_text_width.length) {
                    add_extra_width = d3.max(that.ticks_text_width,function(d){
                            return d;
                        });
                }
                that.k.exportSVG(that,"#"+container_id,"funnel",undefined,undefined,add_extra_width)
            },that.transitions.duration());

        var resize = that.k.resize(that.svgContainer);
        that.k.__proto__._ready(resize);
        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer);
        });
    };

    this.funnelLayout = function (){
        var that = this;
        var data,
            size,
            mouth,
            sort_data,
            coordinates;

        var funnel = {
            data: function(d){
                if (d.length===0){
                } else {
                    data = d;
                }
                return this;
            },
            size: function(s){
                if (s.length!==2){
                } else {
                    size = s;
                }
                return this;
            },
            mouth: function(m){
                if (m.length!==2){
                } else {
                    mouth = m;
                }
                return this;
            },
            coordinates: function(){
                var w = size[0],
                    h = size[1],
                    rw = mouth[0], //rect width
                    rh = mouth[1], //rect height
                    tw = (w - rw)/2, //triangle width
                    th = h - rh, //triangle height
                    height1=0,
                    height2=0,
                    height3=0,
                    merge = 0,
                    coordinates = [],
                    ratio = tw/th,
                    area_of_trapezium = (w + rw) / 2 * th,
                    area_of_rectangle = rw * rh,
                    total_area = area_of_trapezium + area_of_rectangle,
                    percent_of_rectangle = area_of_rectangle / total_area * 100;
                for (var i=data.length-1; i>=0; i--){
                    var selectedPercentValues = that.percentageValues(data)[i];
                    if (percent_of_rectangle>=selectedPercentValues){
                        height3 = selectedPercentValues / percent_of_rectangle * rh;
                        height1 = h - height3;
                        if (i===data.length-1){
                            coordinates[i] = {"values":[{"x":(w-rw)/2,"y":height1},{"x":(w-rw)/2,"y":h},{"x":((w-rw)/2)+rw,"y":h},{"x":((w-rw)/2)+rw,"y":height1}]};
                        }else{
                            coordinates[i] = {"values":[{"x":(w-rw)/2,"y":height1},coordinates[i+1].values[0],coordinates[i+1].values[3],{"x":((w-rw)/2)+rw,"y":height1}]};
                        }
                    }else{
                        var area_of_element = ((selectedPercentValues)/100 * total_area) - area_of_rectangle,
                            a = 2 * ratio,
                            b = 2 * rw,
                            c = 2 * area_of_element;
                        height2 = (-b + Math.sqrt(Math.pow(b,2) - (4 * a * -c))) / (2 * a);
                        height1 = h - height2 - rh;
                        var base = 2*(ratio * height2)+rw,
                        xwidth = (w-base)/2;

                        if(merge===0){
                            if (i===data.length-1){
                                coordinates[i] = {"values":[{"x":xwidth,"y":height1},{"x":(w-rw)/2,"y":th},{"x":(w-rw)/2,"y":h},{"x":((w-rw)/2)+rw,"y":h},{"x":((w-rw)/2)+rw,"y":th},{"x":base+xwidth,"y":height1}]};
                            }else{
                                coordinates[i] = {"values":[{"x":xwidth,"y":height1},{"x":(w-rw)/2,"y":th},coordinates[i+1].values[0],coordinates[i+1].values[3],{"x":((w-rw)/2)+rw,"y":th},{"x":base+xwidth,"y":height1}]};
                            }
                        }
                        else{
                            var coindex;
                            if(coordinates[i+1].values.length===6){
                                coindex = 5;
                            }else{
                                coindex = 3;
                            }
                            coordinates[i] = {"values":[{"x":xwidth,"y":height1},coordinates[i+1].values[0],coordinates[i+1].values[coindex],{"x":base+xwidth,"y":height1}]};
                        }
                        merge = 1;
                    }
                }

                return coordinates;
            }
        };
        return funnel;
    };

   this.percentageValues = function (data){
        var that = this;
        var percentValues = data.map(function (d){
            var weight_max = d3.max(data, function (d) {
                return d.weight;
            })
            return d.weight/weight_max*100;
        });
        percentValues.sort(function(a,b){
            return b-a;
        });
        return percentValues;
    };

    this.optionalFeatures = function () {

        var optional = {
            svgContainer :function (container_id) {
                that.svgContainer = d3.select(options.selector)
                    .append('svg')
                    .attr({
                        "width": that.chart_width + "px",
                        "height": that.chart_height + "px",
                        "preserveAspectRatio": "xMinYMin",
                        "viewBox": "0 0 " + that.chart_width + " " + that.chart_height,
                        "id": container_id,
                        "class": "svgcontainer PykCharts-oneD"
                    });

                that.group = that.svgContainer.append("g")
                    .attr("id","funnel");

                return this;
            },
            createChart: function () {
                var border = new PykCharts.Configuration.border(that);
                that.new_data = that.data.sort(function(a,b) {
                    return b.weight-a.weight;
                })
                if(that.color_mode === "shade") {
                    shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.length);
                    that.new_data.forEach(function (d,i) {
                        d.color = shade_array[i];
                    })
                }
                that.per_values = that.percentageValues(that.new_data);
                that.funnel = that.funnelLayout()
                                .data(that.new_data)
                                .size([that.chart_width,that.chart_height])
                                .mouth([that.funnel_rect_width,that.funnel_rect_height]);

                that.coordinates = that.funnel.coordinates();
                var line = d3.svg.line()
                                .interpolate('linear-closed')
                                .x(function(d,i) { return d.x; })
                                .y(function(d,i) { return d.y; });

                that.chart_data = that.group.selectAll('.fun-path')
                                .data(that.coordinates);
                var a = [{x:0,y:0},{x:that.chart_width,y:0},{x:0,y:0},{x:that.chart_width,y:0},{x:0,y:0},{x:that.chart_width,y:0}];
                that.chart_data.enter()
                    .append('path')
                    .attr("class", "fun-path")

                that.chart_data
                    .attr({
                        "class": "fun-path",
                        'd': function(d){ return line(a); },
                        "fill": function (d,i) {
                            d.color = that.new_data[i].color;
                            return that.fillChart.selectColor(that.new_data[i]);
                        },
                        "fill-opacity": 1,
                        "data-fill-opacity":function () {
                            return d3.select(this).attr("fill-opacity");
                        },
                        "stroke": border.color(),
                        "stroke-width": border.width(),
                        "stroke-dasharray": border.style(),
                        "stroke-opacity": 1,
                        "data-id": function (d,i) {
                            return that.new_data[i].name;
                        }
                    })
                    .on({
                        "mouseover": function (d,i) {
                            if(that.mode === "default") {
                                if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlight(options.selector +" "+".fun-path",this);
                                }
                                tooltip = that.data[i].tooltip || "<table><tr><th colspan='2' class='tooltip-heading'>"+that.new_data[i].name+"</tr><tr><td class='tooltip-left-content'>"+that.k.appendUnits(that.new_data[i].weight)+"<td class='tooltip-right-content'>("+that.per_values[i].toFixed(1)+"%) </tr></table>";
                                that.mouseEvent.tooltipPosition(d);
                                that.mouseEvent.tooltipTextShow(tooltip);
                            }
                        },
                        "mouseout": function (d) {
                            if(that.mode === "default") {
                                if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlightHide(options.selector +" "+".fun-path");
                                }
                                that.mouseEvent.tooltipHide(d);
                            }
                        },
                        "mousemove": function (d,i) {
                            if(that.mode === "default") {
                                that.mouseEvent.tooltipPosition(d);
                            }
                        },
                        "click" : function (d,i) {
                            if(PykCharts['boolean'](options.click_enable)){
                               that.addEvents(that.new_data[i].name, d3.select(this).attr("data-id"));
                            }
                        }
                    })
                    .transition()
                    .duration(that.transitions.duration())
                    .attr('d',function(d){ return line(d.values); });

               that.chart_data.exit()
                   .remove();

                return this;
            },
            label : function () {
                that.chart_text = that.group.selectAll("text")
                    .data(that.coordinates)

                    that.chart_text.enter()
                        .append("text")

                    that.chart_text.attr({
                        "y": function (d,i) {
                            if(d.values.length===4){
                                return (((d.values[0].y-d.values[1].y)/2)+d.values[1].y) + 5;
                            } else {
                                return (((d.values[0].y-d.values[2].y)/2)+d.values[2].y) + 5;
                            }
                        },
                        "x": function (d,i) { return that.chart_width/2;}
                    });

                    that.chart_text.text("");
                    function chart_text_timeout(){
                        that.chart_text.text(function (d,i) {
                                return that.per_values[i].toFixed(1) + "%";
                            })
                            .attr({
                                "text-anchor": "middle",
                                "pointer-events": "none",
                                "fill": function(d) {
                                    if(that.color_mode === "shade" && !options.label_color) {
                                        var color_value = that.k.__proto__._colourBrightness(d.color);
                                        if(color_value === "light") {
                                            return "black";
                                        } else {
                                            return "white";
                                        }
                                    }
                                    return that.label_color;
                                }
                            })
                            .style({
                                "font-weight": that.label_weight,
                                "font-size": that.label_size + "px",
                                "font-family": that.label_family
                            })
                            .text(function (d,i) {
                                if(this.getBBox().width<(d.values[3].x - d.values[1].x) && this.getBBox().height < (d.values[2].y - d.values[0].y)) {
                                    return that.per_values[i].toFixed(1) + "%";
                                }
                                else {
                                    return "";
                                }
                            });
                    }
                    setTimeout(chart_text_timeout,that.transitions.duration());

                    that.chart_text.exit()
                         .remove();
                return this;
            },
            ticks : function () {
                if(PykCharts['boolean'](that.pointer_overflow_enable)) {
                    that.svgContainer.style("overflow","visible");
                }

                var w =[];
                that.ticks_text_width = [];
                    var tick_label = that.group.selectAll(".ticks_label")
                                        .data(that.coordinates);

                    tick_label.attr("class","ticks_label");

                    tick_label.enter()
                        .append("text")
                        .attr({
                            "x": 0,
                            "y": 0
                        });

                    var x,y;

                    tick_label.attr("transform",function (d) {
                        if (d.values.length === 4) {
                            x = ((d.values[3].x + d.values[2].x)/2 ) + 17;
                            y = ((d.values[0].y + d.values[2].y)/2) + 5;
                        } else {
                            x = (d.values[4].x) + 17;
                            y = (d.values[4].y) + 5;
                        }
                        return "translate(" + x + "," + y + ")";});

                    tick_label.text("");
                    function tick_timeout() {
                        tick_label.text(function (d,i) { return that.data[i].name; })
                            .text(function (d,i) {
                                w[i] = this.getBBox().height;
                                that.ticks_text_width.push(this.getBBox().width);
                                if (this.getBBox().height < (d.values[2].y - d.values[0].y)) {
                                    return that.data[i].name;
                                }
                                else {
                                    return "";
                                }
                            })
                            .style({
                                "font-size": that.pointer_size + "px",
                                "text-anchor":"start",
                                "fill": that.pointer_color,
                                "pointer-events":"none",
                                "font-family": that.pointer_family,
                                "font-weight":that.pointer_weight
                            })
                    }

                    setTimeout(tick_timeout,that.transitions.duration());

                    tick_label.exit().remove();
                    var tick_line = that.group.selectAll(".funnel-ticks")
                        .data(that.coordinates);

                    tick_line.enter()
                        .append("line")
                        .attr("class", "funnel-ticks");

                    tick_line.attr({
                        "x1": function (d,i) {
                           if (d.values.length === 4) {
                                return ((d.values[3].x + d.values[2].x)/2 );
                           } else {
                                return (d.values[4].x);
                           }
                        },
                        "y1": function (d,i) {
                            if (d.values.length === 4) {
                                return ((d.values[0].y + d.values[2].y)/2);
                           } else {
                                return (d.values[4].y);
                           }
                        },
                        "x2": function (d, i) {
                            if (d.values.length === 4) {
                                return ((d.values[3].x + d.values[2].x)/2 );
                           } else {
                                return (d.values[4].x);
                           }
                        },
                        "y2": function (d, i) {
                            if (d.values.length === 4) {
                                return ((d.values[0].y + d.values[2].y)/2);
                           } else {
                                return (d.values[4].y);
                           }
                        },
                        "stroke-width": that.pointer_thickness + "px",
                        "stroke": that.pointer_color
                    });

                    function tick_line_timeout(){
                        tick_line.attr("x2", function (d, i) {
                            if(( d.values[2].y - d.values[0].y) > w[i]) {
                                if (d.values.length === 4) {
                                    return ((d.values[3].x + d.values[2].x)/2 ) + 12;
                                } else {
                                    return ((d.values[4].x) + 12);
                                }
                            } else {
                                if (d.values.length === 4) {
                                    return ((d.values[3].x + d.values[2].x)/2 );
                                } else {
                                    return (d.values[4].x);
                                }
                            }
                        });
                    }

                    setTimeout(tick_line_timeout,that.transitions.duration());

                    tick_line.exit().remove();

                return this;
            }
        };
        return optional;
    };
};

PykCharts.oneD.percentageColumn = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});
    this.execute = function (pykquery_data) {
        var that = this;

        that = new PykCharts.validation.processInputs(that, options, 'oneDimensionalCharts');

        that.chart_height = PykCharts['boolean'](options.chart_height) ? options.chart_height : that.chart_width;
        that.percent_column_rect_width = options.percent_column_rect_width ? options.percent_column_rect_width : theme.oneDimensionalCharts.percent_column_rect_width;

        that.k.validator()
            .validatingDataType(that.chart_height,"chart_height",that.chart_width)
            .validatingDataType(that.percent_column_rect_width,"percent_column_rect_width",theme.oneDimensionalCharts.percent_column_rect_width);

        if(that.stop) {
            return;
        }
        that.k.storeInitialDivHeight();
        if(that.percent_column_rect_width > 100) {
            that.percent_column_rect_width = 100;
        }

        that.percent_column_rect_width = that.k.__proto__._radiusCalculation(that.percent_column_rect_width,"percentageBar") * 2;

        if(that.mode === "default") {
           that.k.loading();
        }

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }
            that.data = that.k.__proto__._groupBy("oned",data);
            that.compare_data = that.k.__proto__._groupBy("oned",data);
            that.k.remove_loading_bar(id);
            that.clubdata_enable = that.data.length>that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            that.render();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };
    this.refresh = function (pykquery_data) {
        that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("oned",data);
            that.clubdata_enable = that.data.length>that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            that.refresh_data = that.k.__proto__._groupBy("oned",data);
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }
            that.optionalFeatures()
                    .clubData()
            if(that.color_mode === "shade") {
                shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.length);
                that.new_data.forEach(function (d,i) {
                    d.color = shade_array[i];
                })
            }
            that.optionalFeatures()
                    .createChart()
                    .label()
                    .ticks();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
    };

    this.render = function () {
        var that = this;
        var id = that.selector.substring(1,that.selector.length);
        var container_id = id + "_svg";
        that.fillChart = new PykCharts.Configuration.fillChart(that);
        that.transitions = new PykCharts.Configuration.transition(that);

        if(that.mode === "default") {
            that.k.title()
                    .backgroundColor(that)
                    .export(that,"#"+container_id,"percentageColumn")
                    .emptyDiv(that.selector)
                    .subtitle();
        }
        if(that.mode === "infographics") {
            that.k.backgroundColor(that)
                .export(that,"#"+container_id,"percentageColumn")
                    .emptyDiv(that.selector);

            that.new_data = that.data;
        }

        that.k.tooltip();

        that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
        if(that.mode === "default") {
            percent_column = that.optionalFeatures()
                            .clubData();
        }
        if(that.color_mode === "shade") {
            shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.length);
            that.new_data.forEach(function (d,i) {
                d.color = shade_array[i];
            })
        }
        that.optionalFeatures().svgContainer(container_id)
            .createChart()
            .label()
            .ticks();
        if(that.mode === "default") {
            that.k.liveData(that)
                .createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource();
        }

        var add_extra_width = 0;

        setTimeout(function () {
            if(that.ticks_text_width.length) {
                add_extra_width = d3.max(that.ticks_text_width,function(d){
                    return d;
                });
            }
            that.k.exportSVG(that,"#"+container_id,"percentageColumn",undefined,undefined,(add_extra_width+15))
            if(!PykCharts['boolean'](options.chart_width)) {
                that.chart_width = that.percent_column_rect_width + 10 + add_extra_width;
                that.svgContainer.attr("viewBox","0 0 " + that.chart_width + " " + that.chart_height);
            }
            var resize = that.k.resize(that.svgContainer);
            that.k.__proto__._ready(resize);
        },that.transitions.duration());


        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer);
        });

    };
    this.optionalFeatures = function () {
        var optional = {
            createChart: function () {
                var border = new PykCharts.Configuration.border(that);
                var arr = that.new_data.map(function (d) {
                    return d.weight;
                });
                arr.sum = function () {
                    var sum = 0;
                    for(var i = 0 ; i < this.length; ++i) {
                        sum += this[i];
                    }
                    return sum;
                };

                var sum = arr.sum();
                that.new_data.forEach(function (d, i) {
                    this[i].percentValue= d.weight * 100 / sum;
                }, that.new_data);
               // that.new_data.sort(function (a,b) { return b.weight - a.weight; })
                that.chart_data = that.group.selectAll('.per-rect')
                    .data(that.new_data)

                that.chart_data.enter()
                    .append('rect')
                    .attr("class","per-rect")

                that.chart_data.attr({
                    'x': 0,
                    'y': function (d, i) {
                        if (i === 0) {
                            return 0;
                        } else {
                            var sum = 0,
                                subset = that.new_data.slice(0,i);

                            subset.forEach(function(d, i){
                                sum += this[i].percentValue;
                            },subset);

                            return sum * that.chart_height / 100;
                        }
                    },
                    'width': that.percent_column_rect_width,
                    'height': 0,
                    "fill": function (d) {
                        return that.fillChart.selectColor(d);
                    },
                    "fill-opacity": 1,
                    "data-fill-opacity": function () {
                        return d3.select(this).attr("fill-opacity");
                    },
                    "stroke": border.color(),
                    "stroke-width": border.width(),
                    "stroke-dasharray": border.style(),
                    "data-id" : function (d,i) {
                        return d.name;
                    }
                })
                .on({
                    "mouseover": function (d,i) {
                        if(that.mode === "default") {
                            d.tooltip=d.tooltip||"<table class='PykCharts'><tr><th colspan='2' class='tooltip-heading'>"+d.name+"</tr><tr><td class='tooltip-left-content'>"+that.k.appendUnits(d.weight)+"<td class='tooltip-right-content'>("+d.percentValue.toFixed(1)+"%)</tr></table>"
                            if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                that.mouseEvent.highlight(that.selector+" "+".per-rect",this);
                            }
                            that.mouseEvent.tooltipPosition(d);
                            that.mouseEvent.tooltipTextShow(d.tooltip);
                        }
                    },
                    "mouseout": function (d) {
                        if(that.mode === "default") {
                            if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                that.mouseEvent.highlightHide(that.selector+" "+".per-rect");
                            }
                            that.mouseEvent.tooltipHide(d);
                        }
                    },
                    "mousemove": function (d,i) {
                        if(that.mode === "default") {
                            that.mouseEvent.tooltipPosition(d);
                        }
                    },
                    "click" :  function (d,i) {
                        if(PykCharts['boolean'](that.click_enable)){
                           that.addEvents(d.name, d3.select(this).attr("data-id"));
                        }
                    }
                })
                .transition()
                .duration(that.transitions.duration())
                .attr('height', function (d) {
                    return d.percentValue * that.chart_height / 100;
                });
                that.chart_data.exit()
                    .remove();

                return this;
            },
            svgContainer :function (container_id) {

                that.svgContainer = d3.select(that.selector)
                    .append('svg')
                    .attr({
                        "width": that.chart_width,
                        "height": that.chart_height,
                        "preserveAspectRatio": "xMinYMin",
                        "viewBox": "0 0 " + that.chart_width + " " + that.chart_height,
                        "id": container_id,
                        "class": "svgcontainer PykCharts-oneD"
                    });

                    that.group = that.svgContainer.append("g")
                        .attr("id","percentageColumn");

                return this;
            },
            label : function () {
                    that.chart_text = that.group.selectAll(".per-text")
                        .data(that.new_data);
                    var sum = 0;
                    that.chart_text.enter()
                        .append("text")
                        .attr("class","per-text");

                    that.chart_text.attr({
                        "class": "per-text",
                        "x": (that.percent_column_rect_width/2 ),
                        "y": function (d,i) {
                            sum = sum + d.percentValue;
                            if (i===0) {
                                return (0 + (sum * that.chart_height / 100))/2+5;
                            } else {
                                return (((sum - d.percentValue) * that.chart_height/100)+(sum * that.chart_height / 100))/2+5;
                            }
                        }
                    });
                    sum = 0;

                    that.chart_text.text("")
                        .attr({
                            "fill": function(d) {
                                if(that.color_mode === "shade" && !options.label_color) {
                                    var color_value = that.k.__proto__._colourBrightness(d.color);
                                    if(color_value === "light") {
                                        return "black";
                                    } else {
                                        return "white";
                                    }
                                }
                                return that.label_color;
                            },
                            "text-anchor": "middle",
                            "pointer-events": "none"
                        })
                        .style({
                            "font-size": that.label_size + "px",
                            "font-weight": that.label_weight,
                            "font-family": that.label_family
                        });
                        function chart_text_timeout(){
                            that.chart_text.text(function (d) {
                                return d.percentValue.toFixed(1)+"%";
                            })
                            .text(function (d) {
                                if(this.getBBox().width < (0.92*that.percent_column_rect_width) && this.getBBox().height < (d.percentValue * that.chart_height / 100)) {
                                    return d.percentValue.toFixed(1)+"%";
                                }else {
                                    return "";
                                }
                            });
                        }
                        setTimeout(chart_text_timeout, that.transitions.duration());

                    that.chart_text.exit()
                        .remove();
                return this;
            },
            ticks : function () {
                if(PykCharts['boolean'](that.pointer_overflow_enable)) {
                    that.svgContainer.style("overflow","visible");
                }
                    var sum = 0, sum1 = 0;

                    var x, y, w = [];
                    sum = 0;
                    that.ticks_text_width = [];

                    var tick_line = that.group.selectAll(".per-ticks")
                        .data(that.new_data);

                    tick_line.enter()
                        .append("line")
                        .attr("class", "per-ticks");

                    var tick_label = that.group.selectAll(".ticks_label")
                                        .data(that.new_data);

                    tick_label.enter()
                        .append("text")
                        .attr("class", "ticks_label")

                    tick_label.attr("class", "ticks_label")
                        .attr("transform",function (d) {
                            sum = sum + d.percentValue
                            x = (that.percent_column_rect_width) + 15;
                            y = (((sum - d.percentValue) * that.chart_height/100)+(sum * that.chart_height / 100))/2 + 5;

                            return "translate(" + x + "," + y + ")";
                        });

                    tick_label.text(function (d) {
                            return "";
                        })
                        .attr({
                            "font-size": that.pointer_size,
                            "text-anchor": "start",
                            "fill": that.pointer_color,
                            "font-family": that.pointer_family,
                            "font-weight": that.pointer_weight,
                            "pointer-events": "none"
                        });

                        function tick_label_timeout() {
                            tick_label.text(function (d) {
                                return d.name;
                            })
                            .text(function (d,i) {
                                w[i] = this.getBBox().height;
                                that.ticks_text_width[i] = this.getBBox().width;
                                if (this.getBBox().height < (d.percentValue * that.chart_height / 100)) {
                                    return d.name;
                                }
                                else {
                                    return "";
                                }
                            });

                            sum = 0;
                            tick_line
                                .attr({
                                    "x1": function (d,i) {
                                        return that.percent_column_rect_width;
                                    },
                                    "y1": function (d,i) {
                                        sum = sum + d.percentValue;
                                        if (i===0){
                                            return (0 + (sum * that.chart_height / 100))/2;
                                        }else {
                                            return (((sum - d.percentValue) * that.chart_height/100)+(sum * that.chart_height / 100))/2;
                                        }
                                    },
                                    "x2": function (d, i) {
                                         return (that.percent_column_rect_width);
                                    },
                                    "y2": function (d,i) {
                                        sum1 = sum1 + d.percentValue;
                                        if (i===0){
                                            return (0 + (sum1 * that.chart_height / 100))/2;
                                        }else {
                                            return (((sum1 - d.percentValue) * that.chart_height/100)+(sum1 * that.chart_height / 100))/2;
                                        }
                                    },
                                    "stroke-width": that.pointer_thickness + "px",
                                    "stroke": that.pointer_color,
                                    "x2": function (d, i) {
                                        if((d.percentValue * that.chart_height / 100) > w[i]) {
                                            return (that.percent_column_rect_width) + 10;
                                        } else {
                                            return (that.percent_column_rect_width) ;
                                        }
                                    }
                                });
                        }
                        setTimeout(tick_label_timeout,that.transitions.duration());

                    tick_label.exit().remove();

                    tick_line.exit().remove();

                return this;
            },
            clubData : function () {

                if(PykCharts['boolean'](that.clubdata_enable)) {
                    var clubdata_content = [];
                    if(that.clubdata_always_include_data_points.length!== 0){
                        var l = that.clubdata_always_include_data_points.length;
                        for(i=0; i < l; i++){
                            clubdata_content[i] = that.clubdata_always_include_data_points[i];
                        }
                    }
                    var new_data1 = [];
                    for(i=0;i<clubdata_content.length;i++){
                        for(j=0;j<that.data.length;j++){
                            if(clubdata_content[i].toUpperCase() === that.data[j].name.toUpperCase()){
                                new_data1.push(that.data[j]);
                            }
                        }
                    }
                    that.data.sort(function (a,b) { return b.weight - a.weight; });
                    var k = 0;

                    while(new_data1.length<that.clubdata_maximum_nodes-1){
                        for(i=0;i<clubdata_content.length;i++){
                            if(that.data[k].name.toUpperCase() === clubdata_content[i].toUpperCase()){
                                k++;
                            }
                        }
                        new_data1.push(that.data[k]);
                        k++;
                    }
                    var sum_others = 0;
                    for(j=k; j < that.data.length; j++){
                        for(i=0; i<new_data1.length && j<that.data.length; i++){
                            if(that.data[j].name.toUpperCase() === new_data1[i].name.toUpperCase()){
                                sum_others +=0;
                                j++;
                                i = -1;
                            }
                        }
                        if(j < that.data.length){
                            sum_others += that.data[j].weight;
                        }
                    }
                    var sortfunc = function (a,b) { return b.weight - a.weight; };

                    while(new_data1.length > that.clubdata_maximum_nodes){
                        new_data1.sort(sortfunc);
                        var a=new_data1.pop();
                    }
                    var others_Slice = { "name":that.clubdata_text, "weight": sum_others, /*"color": that.clubData_color,*/ "tooltip": that.clubdata_tooltip };
                    new_data1.sort(function(a,b){
                        return b.weight - a.weight;
                    })
                    if(new_data1.length < that.clubdata_maximum_nodes){
                        new_data1.push(others_Slice);
                    }
                    that.new_data = new_data1;
                }
                else {
                    that.data.sort(function (a,b) { return b.weight - a.weight; });
                    that.new_data = that.data;
                }
                return this;
            }
        };
        return optional;
    };
};

PykCharts.oneD.percentageBar = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});
    this.execute = function (pykquery_data) {
        var that = this;

        that = new PykCharts.validation.processInputs(that, options,'oneDimensionalCharts');
        that.percent_row_rect_height = options.percent_row_rect_height ? options.percent_row_rect_height : theme.oneDimensionalCharts.percent_row_rect_height;
        if(that.percent_row_rect_height > 100) {
            that.percent_row_rect_height = 100;
        }

        that.percent_row_rect_height = that.k.__proto__._radiusCalculation(that.percent_row_rect_height) * 2;
        that.chart_height = PykCharts['boolean'](options.chart_height) ? options.chart_height : (that.percent_row_rect_height + 10 + that.pointer_size);

        that.k.validator()
            .validatingDataType(that.chart_height,"chart_height",that.chart_width/2)
            .validatingDataType(that.percent_row_rect_height,"percent_row_rect_height",theme.oneDimensionalCharts.percent_row_rect_height);

        if(that.stop) {
            return;
        }
        that.k.storeInitialDivHeight();
        if(that.mode === "default") {
           that.k.loading();
        }

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }

            that.data = that.k.__proto__._groupBy("oned",data);
            that.compare_data = that.k.__proto__._groupBy("oned",data);
            that.k.remove_loading_bar(id);
            that.clubdata_enable = that.data.length>that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            that.render();
        }
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };
    this.refresh = function (pykquery_data) {
        that.executeRefresh = function (data) {

            that.data = that.k.__proto__._groupBy("oned",data);
            that.clubdata_enable = that.data.length>that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            that.refresh_data = that.k.__proto__._groupBy("oned",data);
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }
            that.optionalFeatures()
                    .clubData()
            if(that.color_mode === "shade") {
                shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.length);
                that.new_data.forEach(function (d,i) {
                    d.color = shade_array[i];
                })
            }
            that.optionalFeatures()
                    .createChart()
                    .label()
                    .ticks();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
    };

    this.render = function () {
        var that = this;
        var id = that.selector.substring(1,that.selector.length);
        var container_id = id + "_svg";
        that.fillChart = new PykCharts.Configuration.fillChart(that);
        that.transitions = new PykCharts.Configuration.transition(that);

        if(that.mode === "default") {

            that.k.title()
                    .backgroundColor(that)
                    .export(that,"#"+container_id,"percentageBar")
                    .emptyDiv(that.selector)
                    .subtitle();
        }
        if(that.mode === "infographics") {
            that.k.backgroundColor(that)
            .export(that,"#"+container_id,"percentageBar").emptyDiv(that.selector);
            that.new_data = that.data;
            if(that.color_mode === "shade") {
                shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.length);
                that.new_data.forEach(function (d,i) {
                    d.color = shade_array[i];
                })
            }
        }

        that.k.tooltip();

        that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
        if(that.mode === "default") {

            percent_bar = that.optionalFeatures()
                            .clubData();
            if(that.color_mode === "shade") {
                shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.length);
                that.new_data.forEach(function (d,i) {
                    d.color = shade_array[i];
                })
            }
        }

        that.optionalFeatures().svgContainer(container_id)
            .createChart()
            .label()
            .ticks();
        if(that.mode === "default") {
            that.k.liveData(that)
                .createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource();
        }

        var add_extra_height = 0;

        setTimeout(function () {
            if(that.ticks_text_height) {
                add_extra_height = that.ticks_text_height + 10;
            }

            that.k.exportSVG(that,"#"+container_id,"percentageBar",undefined,undefined,0,add_extra_height);
        },that.transitions.duration());

        var resize = that.k.resize(that.svgContainer);
        that.k.__proto__._ready(resize);
        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer);
        });
    };
    this.optionalFeatures = function () {
        var optional = {
            createChart: function () {
                var border = new PykCharts.Configuration.border(that);
                var arr = that.new_data.map(function (d) {
                    return d.weight;
                });
                arr.sum = function () {
                    var sum = 0;
                    for(var i = 0 ; i < this.length; ++i) {
                        sum += this[i];
                    }
                    return sum;
                };

                var sum = arr.sum();
                that.new_data.forEach(function (d, i) {
                    this[i].percentValue= d.weight * 100 / sum;
                }, that.new_data);

               // that.new_data.sort(function (a,b) { return b.weight - a.weight; })
                that.chart_data = that.group.selectAll('.per-rect')
                    .data(that.new_data)

                that.chart_data.enter()
                    .append('rect')
                    .attr("class","per-rect")

                that.chart_data.attr({
                    'x': 0,
                    'x': function (d, i) {
                        if (i === 0) {
                            return 0;
                        } else {
                            var sum = 0,
                                subset = that.new_data.slice(0,i);

                            subset.forEach(function(d, i){
                                sum += this[i].percentValue;
                            },subset);

                            return sum * that.chart_width / 100;
                        }
                    },
                    "width": 0,
                    'height': function (d) {
                        return that.percent_row_rect_height;
                    },
                    "fill": function (d) {
                        return that.fillChart.selectColor(d);
                    },
                    "fill-opacity": 1,
                    "data-fill-opacity": function () {
                        return d3.select(this).attr("fill-opacity");
                    },
                    "stroke": border.color(),
                    "stroke-width": border.width(),
                    "stroke-dasharray": border.style(),
                    "data-id": function (d,i) {
                        return d.name;
                    }
                })
                .on({
                    "mouseover": function (d,i) {
                        if(that.mode === "default") {
                            d.tooltip=d.tooltip||"<table class='PykCharts'><tr><th colspan='2' class='tooltip-heading'>"+d.name+"</tr><tr><td class='tooltip-left-content'>"+that.k.appendUnits(d.weight)+"<td class='tooltip-right-content'>("+d.percentValue.toFixed(1)+"%)</tr></table>"
                            if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                that.mouseEvent.highlight(that.selector+" "+".per-rect",this);
                            }
                            that.mouseEvent.tooltipPosition(d);
                            that.mouseEvent.tooltipTextShow(d.tooltip);
                        }
                    },
                    "mouseout": function (d) {
                        if(that.mode === "default") {
                            if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                that.mouseEvent.highlightHide(that.selector+" "+".per-rect");
                            }
                            that.mouseEvent.tooltipHide(d);
                        }
                    },
                    "mousemove": function (d,i) {
                        if(that.mode === "default") {
                            that.mouseEvent.tooltipPosition(d);
                        }
                    },
                    "click" : function (d,i) {
                        if(PykCharts['boolean'](that.click_enable)){
                           that.addEvents(d.name, d3.select(this).attr("data-id"));
                        }
                    }
                })
                .transition()
                .duration(that.transitions.duration())
                .attr('width', function (d) {
                    return d.percentValue * that.chart_width / 100;
                });

                that.chart_data.exit()
                    .remove();

                return this;
            },
            svgContainer :function (container_id) {
                that.svgContainer = d3.select(that.selector)
                    .append('svg')
                    .attr({
                        "width": that.chart_width,
                        "height": that.chart_height,
                        "preserveAspectRatio": "xMinYMin",
                        "viewBox": "0 0 " + that.chart_width + " " + that.chart_height,
                        "id": container_id,
                        "class": "svgcontainer PykCharts-oneD"
                    });

                    that.group = that.svgContainer.append("g")
                        .attr("id","percentageBar");

                return this;
            },
            label : function () {
                    that.chart_text = that.group.selectAll(".per-text")
                        .data(that.new_data);
                    var sum = 0;
                    that.chart_text.enter()
                        .append("text")
                        .attr("class","per-text");

                    that.chart_text.attr({
                        "class": "per-text",
                        "y": (that.percent_row_rect_height/2) + 5,
                        "x": function (d,i) {
                            sum = sum + d.percentValue;
                            if (i===0) {
                                return (0 + (sum * that.chart_width / 100))/2;
                            } else {
                                return (((sum - d.percentValue) * that.chart_width/100)+(sum * that.chart_width / 100))/2;
                            }
                        }
                    });
                    sum = 0;

                    that.chart_text.text("")
                        .attr({
                            "fill": function(d) {
                                if(that.color_mode === "shade" && !options.label_color) {
                                    var color_value = that.k.__proto__._colourBrightness(d.color);
                                    if(color_value === "light") {
                                        return "black";
                                    } else {
                                        return "white";
                                    }
                                }
                                return that.label_color;
                            },
                            "text-anchor": "middle",
                            "pointer-events": "none"
                        })
                        .style({
                            "font-size": that.label_size + "px",
                            "font-weight": that.label_weight,
                            "font-family": that.label_family
                        });

                        function chart_text_timeout(){
                            that.chart_text.text(function (d) { return d.percentValue.toFixed(1)+"%"; })
                                .text(function (d) {
                                    if(this.getBBox().width < 0.92*(d.percentValue * that.chart_width / 100) && this.getBBox().height < that.percent_row_rect_height) {
                                        return d.percentValue.toFixed(1)+"%"
                                    }else {
                                        return "";
                                    }
                                });
                        }
                        setTimeout(chart_text_timeout, that.transitions.duration());


                    that.chart_text.exit()
                        .remove();
                return this;
            },
            ticks : function () {
                if(PykCharts['boolean'](that.pointer_overflow_enable)) {
                    that.svgContainer.style("overflow","visible");
                }
                    var sum = 0, sum1 = 0;

                    var x, y, w = [];
                    that.ticks_text_height;
                    sum = 0;

                    var tick_line = that.group.selectAll(".per-ticks")
                        .data(that.new_data);

                    tick_line.enter()
                        .append("line")
                        .attr("class", "per-ticks");

                    var tick_label = that.group.selectAll(".ticks_label")
                                        .data(that.new_data);

                    tick_label.enter()
                        .append("text")
                        .attr("class", "ticks_label")

                    tick_label.attr("class", "ticks_label")
                        .attr("transform",function (d) {
                            sum = sum + d.percentValue
                            y = ((that.percent_row_rect_height) + that.pointer_size) + 10;
                            x = (((sum - d.percentValue) * that.chart_width/100)+(sum * that.chart_width / 100))/2;

                            return "translate(" + x + "," + y + ")";
                        });

                    tick_label.text(function (d) {
                            return "";
                        })
                        .attr({
                            "font-size": that.pointer_size,
                            "text-anchor": "middle",
                            "fill": that.pointer_color,
                            "font-family": that.pointer_family,
                            "font-weight": that.pointer_weight,
                            "pointer-events": "none"
                        });

                        function tick_label_timeout() {
                            tick_label.text(function (d) {
                                return d.name;
                            })
                            .text(function (d,i) {
                                w[i] = this.getBBox().width;
                                that.ticks_text_height = this.getBBox().height;
                                if (this.getBBox().width < (d.percentValue * that.chart_width / 100)) {
                                    return d.name;
                                }
                                else {
                                    return "";
                                }
                            });

                            sum = 0;
                            tick_line.attr({
                                "y1": function (d,i) {
                                    return that.percent_row_rect_height;
                                },
                                "x1": function (d,i) {
                                    sum = sum + d.percentValue;
                                    if (i===0){
                                        return (0 + (sum * that.chart_width / 100))/2;
                                    }else {
                                        return (((sum - d.percentValue) * that.chart_width/100)+(sum * that.chart_width / 100))/2;
                                    }
                                },
                                "y2": function (d, i) {
                                     return (that.percent_row_rect_height);
                                },
                                "x2": function (d,i) {
                                    sum1 = sum1 + d.percentValue;
                                    if (i===0){
                                        return (0 + (sum1 * that.chart_width / 100))/2;
                                    }else {
                                        return (((sum1 - d.percentValue) * that.chart_width/100)+(sum1 * that.chart_width / 100))/2;
                                    }
                                },
                                "stroke-width": that.pointer_thickness + "px",
                                "stroke": that.pointer_color,
                                "y2": function (d, i) {
                                    if((d.percentValue * that.chart_width / 100) > w[i]) {
                                        return (that.percent_row_rect_height) + 10;
                                    } else {
                                        return (that.percent_row_rect_height) ;
                                    }
                                }
                            })
                            .style("margin-top","10px");
                        }
                        setTimeout(tick_label_timeout,that.transitions.duration());

                    tick_label.exit().remove();

                    tick_line.exit().remove();

                return this;
            },
            clubData : function () {
                if(PykCharts['boolean'](that.clubdata_enable)) {
                    var clubdata_content = [];
                    if(that.clubdata_always_include_data_points.length!== 0){
                        var l = that.clubdata_always_include_data_points.length;
                        for(i=0; i < l; i++){
                            clubdata_content[i] = that.clubdata_always_include_data_points[i];
                        }
                    }
                    var new_data1 = [];
                    for(i=0;i<clubdata_content.length;i++){
                        for(j=0;j<that.data.length;j++){
                            if(clubdata_content[i].toUpperCase() === that.data[j].name.toUpperCase()){
                                new_data1.push(that.data[j]);
                            }
                        }
                    }
                    that.data.sort(function (a,b) { return b.weight - a.weight; });
                    var k = 0;

                    while(new_data1.length<that.clubdata_maximum_nodes-1){
                        for(i=0;i<clubdata_content.length;i++){
                            if(that.data[k].name.toUpperCase() === clubdata_content[i].toUpperCase()){
                                k++;
                            }
                        }
                        new_data1.push(that.data[k]);
                        k++;
                    }
                    var sum_others = 0;
                    for(j=k; j < that.data.length; j++){
                        for(i=0; i<new_data1.length && j<that.data.length; i++){
                            if(that.data[j].name.toUpperCase() === new_data1[i].name.toUpperCase()){
                                sum_others +=0;
                                j++;
                                i = -1;
                            }
                        }
                        if(j < that.data.length){
                            sum_others += that.data[j].weight;
                        }
                    }
                    var sortfunc = function (a,b) { return b.weight - a.weight; };

                    while(new_data1.length > that.clubdata_maximum_nodes){
                        new_data1.sort(sortfunc);
                        var a=new_data1.pop();
                    }
                    var others_Slice = { "name":that.clubdata_text, "weight": sum_others,/* "color": that.clubdata_color,*/ "tooltip": that.clubdata_tooltip };
                    new_data1.sort(function(a,b){
                        return b.weight - a.weight;
                    })
                    if(new_data1.length < that.clubdata_maximum_nodes){
                        new_data1.push(others_Slice);
                    }
                    that.new_data = new_data1;
                }
                else {
                    that.data.sort(function (a,b) { return b.weight - a.weight; });
                    that.new_data = that.data;
                }
                return this;
            }
        };
        return optional;
    };
};

PykCharts.oneD.pie = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});

    this.execute = function(pykquery_data) {
        that = new PykCharts.validation.processInputs(that, options, 'oneDimensionalCharts');
        if(options.chart_height) {
            that.chart_height = options.chart_height;
            that.calculation = undefined;
        }
        else {
            that.chart_height = that.chart_width;
            that.calculation = "pie";
        }
        that.pie_radius_percent = options.pie_radius_percent ? options.pie_radius_percent : theme.oneDimensionalCharts.pie_radius_percent;

        that.k.validator()
            .validatingDataType(that.chart_height,"chart_height",that.chart_width)
            .validatingDataType(that.pie_radius_percent,"pie_radius_percent",theme.oneDimensionalCharts.pie_radius_percent);

        if(that.stop) {
            return;
        }
        that.k.storeInitialDivHeight();
        that.innerRadiusPercent = 0;
        that.height_translate = that.chart_height/2;

        if(that.pie_radius_percent > 100) {
            that.pie_radius_percent = 100;
        }

        if(that.mode === "default") {
           that.k.loading();
        }

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);

            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }

            that.data = that.k.__proto__._groupBy("oned",data);
            that.compare_data = that.k.__proto__._groupBy("oned",data);
            that.k.remove_loading_bar(id);
            var pieFunctions = new PykCharts.oneD.pieFunctions(options,that,"pie");
            that.clubdata_enable = that.data.length > that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            pieFunctions.render();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }

    };
};
PykCharts.oneD.donut = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});
    this.execute = function(pykquery_data) {

        that = new PykCharts.validation.processInputs(that, options, 'oneDimensionalCharts');
        if(options.chart_height) {
            that.chart_height = options.chart_height;
            that.calculation = undefined;
        }
        else {
            that.chart_height = that.chart_width;
            that.calculation = "pie";
        }

        that.pie_radius_percent = options.donut_radius_percent  ? options.donut_radius_percent : theme.oneDimensionalCharts.donut_radius_percent;
        that.innerRadiusPercent = options.donut_inner_radius_percent  ? options.donut_inner_radius_percent : theme.oneDimensionalCharts.donut_inner_radius_percent;

        that.k.validator()
            .validatingDataType(that.chart_height,"chart_height",that.chart_width)
            .validatingDataType(that.pie_radius_percent,"donut_radius_percent",theme.oneDimensionalCharts.donut_radius_percent)
            .validatingDataType(that.innerRadiusPercent,"donut_inner_radius_percent",theme.oneDimensionalCharts.donut_inner_radius_percent)

        if(that.stop) {
            return;
        }

        that.k.storeInitialDivHeight();
        if(that.pie_radius_percent > 100) {
            that.pie_radius_percent = 100;
        }

        if(that.innerRadiusPercent > 100) {
            that.innerRadiusPercent = 100;
        }

        try {
            if(that.innerRadiusPercent >= that.pie_radius_percent) {
                that.innerRadiusPercent = theme.oneDimensionalCharts.donut_inner_radius_percent;
                throw "donut_inner_radius_percent";
            }
        }
        catch(err) {
            that.k.warningHandling(err,"6");
        }

        if(that.stop) {
            return;
        }
        if(that.mode === "default") {
           that.k.loading();
        }
        that.height_translate = that.chart_height/2;
        that.show_total_at_center = options.donut_show_total_at_center ? options.donut_show_total_at_center.toLowerCase() : theme.oneDimensionalCharts.donut_show_total_at_center;
        that.show_total_at_center_size = "donut_show_total_at_center_size" in options ? options.donut_show_total_at_center_size : theme.oneDimensionalCharts.donut_show_total_at_center_size;
        that.show_total_at_center_color = options.donut_show_total_at_center_color ? options.donut_show_total_at_center_color : theme.oneDimensionalCharts.donut_show_total_at_center_color;
        that.show_total_at_center_weight = options.donut_show_total_at_center_weight ? options.donut_show_total_at_center_weight : theme.oneDimensionalCharts.donut_show_total_at_center_weight;
        that.show_total_at_center_family = options.donut_show_total_at_center_family ? options.donut_show_total_at_center_family : theme.oneDimensionalCharts.donut_show_total_at_center_family;

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }

            that.data = that.k.__proto__._groupBy("oned",data);
            that.compare_data = that.k.__proto__._groupBy("oned",data);
            that.k.remove_loading_bar(id);
            var pieFunctions = new PykCharts.oneD.pieFunctions(options,that,"donut");
            that.clubdata_enable = that.data.length > that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            pieFunctions.render();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };
};
PykCharts.oneD.electionPie = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});

    this.execute = function(pykquery_data) {

        that = new PykCharts.validation.processInputs(that, options, 'oneDimensionalCharts');
        if(options.chart_height || options.chart_height === undefined) {
            try {
                if (options.chart_height === undefined) {
                    options.chart_height = "";
                }
                else if (isNaN(options.chart_height)) {
                    options.chart_height = "";
                    throw "chart_height"
                }
            }
            catch (err) {
                that.k.warningHandling(err);
            }
        }
        if(PykCharts["boolean"](options.chart_height)) {
            that.chart_height = options.chart_height;
            that.calculation = undefined;
            that.height_translate = that.chart_height/2;
        } else {
            that.chart_height = that.chart_width/2;
            that.calculation = "pie";
            that.height_translate = that.chart_height;
        }

        that.pie_radius_percent = options.pie_radius_percent ? options.pie_radius_percent : theme.oneDimensionalCharts.pie_radius_percent;

        try {
            if(isNaN(that.pie_radius_percent)) {
                that.pie_radius_percent = theme.oneDimensionalCharts.pie_radius_percent;
                throw "pie_radius_percent"
            }
        }

        catch (err) {
            that.k.warningHandling(err,"1");
        }

        if(that.stop) {
            return;
        }

        that.k.storeInitialDivHeight();
        if(that.pie_radius_percent > 100) {
            that.pie_radius_percent = 100;
        }
        if(that.mode === "default") {
           that.k.loading();
        }
        that.innerRadiusPercent = 0;

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }

            that.data = that.k.__proto__._groupBy("oned",data);
            that.compare_data = that.k.__proto__._groupBy("oned",data);
            that.k.remove_loading_bar(id);
            var pieFunctions = new PykCharts.oneD.pieFunctions(options,that,"election pie");
            that.clubdata_enable = that.data.length > that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            pieFunctions.render();

        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };
};
PykCharts.oneD.electionDonut = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});

    this.execute = function(pykquery_data) {
        that = new PykCharts.validation.processInputs(that, options, 'oneDimensionalCharts');
        if(options.chart_height || options.chart_height === undefined) {
            try {
                if (options.chart_height === undefined) {
                    options.chart_height = "";
                }
                else if (isNaN(options.chart_height)) {
                    options.chart_height = "";
                    throw "chart_height"
                }
            }
            catch (err) {
                that.k.warningHandling(err);
            }
        }
        if(PykCharts["boolean"](options.chart_height)) {
            that.chart_height = options.chart_height;
            that.calculation = undefined;
            that.height_translate = that.chart_height/2;
        } else {
            that.chart_height = that.chart_width/2;
            that.calculation = "pie";
            that.height_translate = that.chart_height;
        }

        that.pie_radius_percent = options.donut_radius_percent ? options.donut_radius_percent : theme.oneDimensionalCharts.donut_radius_percent;
        that.innerRadiusPercent = options.donut_inner_radius_percent  && options.donut_inner_radius_percent ? options.donut_inner_radius_percent : theme.oneDimensionalCharts.donut_inner_radius_percent;

        that.k.validator().validatingDataType(that.pie_radius_percent,"donut_radius_percent",theme.oneDimensionalCharts.donut_radius_percent)
            .validatingDataType(that.innerRadiusPercent,"donut_inner_radius_percent",theme.oneDimensionalCharts.donut_inner_radius_percent);

        if(that.stop) {
            return;
        }
        that.k.storeInitialDivHeight();
        if(that.pie_radius_percent > 100) {
            that.pie_radius_percent = 100;
        }

        if(that.innerRadiusPercent > 100) {
            that.innerRadiusPercent = 100;
        }

        try {
            if(that.innerRadiusPercent >= that.pie_radius_percent) {
                that.innerRadiusPercent = theme.oneDimensionalCharts.donut_inner_radius_percent;
                throw "donut_inner_radius_percent";
            }
        }
        catch(err) {

            that.k.warningHandling(err,"6");
        }

        if(that.stop) {
            return;
        }
        if(that.mode === "default") {
           that.k.loading();
        }
        that.show_total_at_center = options.donut_show_total_at_center ? options.donut_show_total_at_center.toLowerCase() : theme.oneDimensionalCharts.donut_show_total_at_center;
        that.show_total_at_center_size = "donut_show_total_at_center_size" in options ? options.donut_show_total_at_center_size : theme.oneDimensionalCharts.donut_show_total_at_center_size;
        that.show_total_at_center_color = options.donut_show_total_at_center_color ? options.donut_show_total_at_center_color : theme.oneDimensionalCharts.donut_show_total_at_center_color;
        that.show_total_at_center_weight = options.donut_show_total_at_center_weight ? options.donut_show_total_at_center_weight : theme.oneDimensionalCharts.donut_show_total_at_center_weight;
        that.show_total_at_center_family = options.donut_show_total_at_center_family ? options.donut_show_total_at_center_family : theme.oneDimensionalCharts.donut_show_total_at_center_family;

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }

            that.data = that.k.__proto__._groupBy("oned",data);
            that.compare_data = that.k.__proto__._groupBy("oned",data);
            that.k.remove_loading_bar(id);
            var pieFunctions = new PykCharts.oneD.pieFunctions(options,that,"election donut");
            that.clubdata_enable = that.data.length> that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            pieFunctions.render();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };
};
PykCharts.oneD.pieFunctions = function (options,chartObject,type) {
    var that = chartObject;
       that.refresh = function (pykquery_data) {
        that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("oned",data);
            that.clubdata_enable = that.data.length>that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            that.refresh_data = that.k.__proto__._groupBy("oned",data);
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data)
                , shade_array = [];
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }
            that.new_data = that.optionalFeatures().clubData();
            that.optionalFeatures()
                    .createChart(shade_array)
                    .label()
                    .ticks()
                    .centerLabel();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
    };

    this.render = function() {
        that.count = 1;
        var id = that.selector.substring(1,that.selector.length);
        var container_id = id + "_svg"
            , shade_array = [];
        that.fillChart = new PykCharts.Configuration.fillChart(that);
        that.transitions = new PykCharts.Configuration.transition(that);

        if(that.mode.toLowerCase() === "default") {

            that.k.title()
                .backgroundColor(that)
                .export(that,"#"+container_id,type)
                .emptyDiv(that.selector)
                .subtitle();

            that.optionalFeatures().svgContainer(container_id);
            that.new_data = that.optionalFeatures().clubData();

            that.k.createFooter()
                    .lastUpdatedAt()
                    .credits()
                    .dataSource()
                    .tooltip();


            that.optionalFeatures()
                    .set_start_end_angle()
                    .createChart(shade_array)
                    .label()
                    .ticks()
                    .centerLabel();

            that.k.liveData(that);

        } else if(that.mode.toLowerCase() === "infographics") {
            that.new_data = that.data;
            that.k.backgroundColor(that)
                .export(that,"#"+container_id,type)
                    .emptyDiv(that.selector);
            that.optionalFeatures().svgContainer(container_id)
                    .set_start_end_angle()
                    .createChart(shade_array)
                    .label()
                    .ticks()
                    .centerLabel();

            that.k.tooltip();
        }

        that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);

        var add_extra_width = 0;
        var add_extra_height = 0;
        setTimeout(function () {
            if(that.ticks_text_width.length) {
                add_extra_width = d3.max(that.ticks_text_width,function(d) {
                    return d;
                });
                add_extra_height = that.ticks_text_height;
            }
            that.k.exportSVG(that,"#"+container_id,type,undefined,undefined,(add_extra_width+20),(add_extra_height+20))
        },that.transitions.duration());

        var resize = that.k.resize(that.svgContainer);
        that.k.__proto__._ready(resize);
        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer);
        });
    };

    that.optionalFeatures = function () {
        var optional = {
            svgContainer :function (container_id) {
                that.svgContainer = d3.select(that.selector)
                    .append('svg')
                    .attr({
                        "width": that.chart_width,
                        "height": function () {
                            return that.chart_height;
                        },
                        "preserveAspectRatio": "xMinYMin",
                        "viewBox": "0 0 " + that.chart_width + " " + that.chart_height,
                        "id": container_id,
                        "class": "svgcontainer PykCharts-oneD"
                    });
                that.group = that.svgContainer.append("g")
                    .attr({
                        "transform": "translate("+(that.chart_width/2)+","+that.height_translate+")",
                        "id": "pieGroup"
                    });

                return this;
            },
            createChart : function () {
                document.querySelector(that.selector +" #pieGroup").innerHTML = null;
                var border = new PykCharts.Configuration.border(that);
                if(that.color_mode === "shade") {
                    shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.length);
                    that.new_data.forEach(function (d,i) {
                        d.color = shade_array[i];
                    })
                }
                if(type.toLowerCase() === "pie" || type.toLowerCase() === "donut") {
                    that.new_data.sort(function (a,b) { return a.weight - b.weight;});
                    var temp = that.new_data.pop();
                    that.new_data.unshift(temp);
                    if(PykCharts['boolean'](that.clubdata_enable) && that.mode === "default") {
                        var index,data;
                        for(var i = 0;i<that.new_data.length;i++) {
                            if(that.new_data[i].name === that.clubdata_text) {
                                index = i;
                                data = that.new_data[i];
                                break;
                            }
                        }
                        if(index) {
                            that.new_data.splice(index,1);
                            if(i===0) {
                                var temp = that.new_data.pop();
                                that.new_data.splice(0,0,temp);
                            }
                            that.new_data.splice(1,0,data);
                        }
                    }
                } else if(type.toLowerCase() == "election pie" || type.toLowerCase() == "election donut") {
                    that.new_data.sort(function (a,b) { return b.weight - a.weight;});
                    if(PykCharts['boolean'](that.clubdata_enable) && that.mode === "default") {
                        var index,data;
                        for(var i = 0;i<that.new_data.length;i++) {
                            if(that.new_data[i].name === that.clubdata_text) {
                                index = i;
                                data = that.new_data[i];
                                break;
                            }
                        }
                        if(index) {
                            that.new_data.splice(index,1);
                            that.new_data.push(data);
                        }
                    }
                }

                that.sum = 0;
                for(var i = 0,len=that.new_data.length;i<len;i++) {
                    that.sum+=that.new_data[i].weight;
                }
                that.inner_radius = that.k.__proto__._radiusCalculation(that.innerRadiusPercent,that.calculation);
                that.outer_radius = that.k.__proto__._radiusCalculation(that.pie_radius_percent,that.calculation);

                that.arc = d3.svg.arc()
                    .innerRadius(that.inner_radius)
                    .outerRadius(that.outer_radius);

                that.pie = d3.layout.pie()
                    .value(function (d) { return d.weight; })
                    .sort(null)
                    .startAngle(that.start_angle)
                    .endAngle(that.end_angle);

                that.chart_data = that.group.selectAll("path").
                                        data(that.pie(that.new_data));

                that.chart_data.enter()
                    .append("path");

                that.chart_data
                    .attr("class","pie");

                that.chart_data
                    .attr({
                        "fill": function (d,i) {
                            return that.fillChart.selectColor(d.data);
                        },
                        "fill-opacity": 1,
                        "data-fill-opacity": function () {
                            return d3.select(this).attr("fill-opacity");
                        },
                        "stroke": border.color(),
                        "stroke-width": border.width(),
                        "stroke-dasharray": border.style(),
                        "data-id" : function (d) {
                            return d.data.name;
                        }
                    })
                    .on({
                        'mouseover': function (d) {
                            if(that.mode === "default") {
                                d.data.tooltip = d.data.tooltip || "<table class='PykCharts'><tr><th colspan='2' class='tooltip-heading'>"+d.data.name+"</tr><tr><td class='tooltip-left-content'>"+that.k.appendUnits(d.data.weight)+"<td class='tooltip-right-content'>("+((d.data.weight*100)/that.sum).toFixed(1)+"%) </tr></table>";
                                if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlight(that.selector +" "+".pie", this);
                                }
                                that.mouseEvent.tooltipPosition(d);
                                that.mouseEvent.tooltipTextShow(d.data.tooltip);
                            }
                        },
                        'mouseout': function (d) {
                            if(that.mode === "default") {
                                if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlightHide(that.selector +" "+".pie");
                                }
                                that.mouseEvent.tooltipHide(d);
                            }
                        },
                        'mousemove': function (d) {
                            if(that.mode === "default") {
                                that.mouseEvent.tooltipPosition(d);
                            }
                        },
                        'click' :  function (d) {
                            if(PykCharts['boolean'](that.click_enable)){
                                that.addEvents(d.data.name, d3.select(this).attr("data-id"));
                            }
                        }
                    });

                that.chart_data.transition()
                    .delay(function(d, i) {
                        if(that.transition_duration && that.mode === "default") {
                            return (i * that.transition_duration * 1000)/that.new_data.length;
                        } else return 0;
                    })
                    .duration(that.transitions.duration()/that.new_data.length)
                    .attrTween("d",function(d) {
                        var i = d3.interpolate(d.startAngle, d.endAngle);
                        return function(t) {
                            d.endAngle = i(t);
                            return that.arc(d);
                        }
                    });

                that.chart_data.exit().remove();
                return this;
            },
            label : function () {
                that.chart_text = that.group.selectAll("text")
                                   .data(that.pie(that.new_data));

                that.chart_text.enter()
                    .append("text")
                    .attr({
                        "class": "pie-label",
                        "transform": function (d) { return "translate("+that.arc.centroid(d)+")"; }
                    });

                that.chart_text.attr("transform",function (d) { return "translate("+that.arc.centroid(d)+")"; });

                that.chart_text.text("");

                function chart_text_timeout() {
                    that.chart_text
                        .style({
                            "font-weight": that.label_weight,
                            "font-size": that.label_size + "px",
                            "font-family": that.label_family
                        })
                        .text(function (d) {
                            return ((d.data.weight*100)/that.sum).toFixed(1)+"%";
//                            return that.k.appendUnits(d.data.weight);
                        })
                        .attr({
                            "text-anchor": "middle",
                            "pointer-events": "none",
                            "dy": 5,
                            "fill": function (d) {
                                if(that.color_mode === "shade" && !options.label_color) {
                                    var color_value = that.k.__proto__._colourBrightness(d.data.color);
                                    if(color_value === "light") {
                                        return "black";
                                    } else {
                                        return "white";
                                    }
                                }
                                return that.label_color;
                            }
                        })
                        .text(function (d,i) {
                            if(type.toLowerCase() === "pie" || type.toLowerCase() === "election pie") {
                                if(this.getBBox().width<((d.endAngle-d.startAngle)*((that.outer_radius/2)/**0.9*/))) {
                                    return ((d.data.weight*100)/that.sum).toFixed(1)+"%";
                                }
                                else {
                                    return "";
                                }
                            } else {
                                if((this.getBBox().width < (Math.abs(d.endAngle - d.startAngle)*that.outer_radius*0.9))  && (this.getBBox().height < (((that.outer_radius-that.inner_radius)*0.75)))) {
                                    return ((d.data.weight*100)/that.sum).toFixed(1)+"%";
                                }
                                else {
                                    return "";
                                }
                            }
                        });
                        that.chart_text.exit().remove();
                    }
                    setTimeout(chart_text_timeout,that.transitions.duration());

                return this;
            },
            clubData: function () {
                if(PykCharts['boolean'](that.clubdata_enable)) {
                    var clubdata_content = [];
                    if(that.clubdata_always_include_data_points.length!== 0){
                        var l = that.clubdata_always_include_data_points.length;
                        for(i=0; i < l; i++){
                            clubdata_content[i] = that.clubdata_always_include_data_points[i];
                        }
                    }
                    var new_data1 = [];
                    for(i=0;i<clubdata_content.length;i++){
                        for(j=0;j<that.data.length;j++){
                            if(clubdata_content[i].toUpperCase() === that.data[j].name.toUpperCase()){
                                new_data1.push(that.data[j]);
                            }
                        }
                    }
                    that.data.sort(function (a,b) { return b.weight - a.weight; });
                    var k = 0;

                    while(new_data1.length<that.clubdata_maximum_nodes-1){
                        for(i=0;i<clubdata_content.length;i++){
                            if(that.data[k].name.toUpperCase() === clubdata_content[i].toUpperCase()){
                                k++;
                            }
                        }
                        new_data1.push(that.data[k]);
                        k++;
                    }
                    var sum_others = 0;
                    for(j=k; j < that.data.length; j++){
                        for(i=0; i<new_data1.length && j<that.data.length; i++){
                            if(that.data[j].name.toUpperCase() === new_data1[i].name.toUpperCase()){
                                sum_others +=0;
                                j++;
                                i = -1;
                            }
                        }
                        if(j < that.data.length){
                            sum_others += that.data[j].weight;
                        }
                    }
                    var sortfunc = function (a,b) { return b.weight - a.weight; };

                    while(new_data1.length > that.clubdata_maximum_nodes){
                        new_data1.sort(sortfunc);
                        var a=new_data1.pop();
                    }
                    var others_Slice = { "name":that.clubdata_text, "weight": sum_others,/* "color": that.clubdata_color,*/ "tooltip": that.clubdata_tooltip };
                    new_data1.sort(function(a,b){
                        return b.weight - a.weight;
                    })
                    if(new_data1.length < that.clubdata_maximum_nodes){
                        new_data1.push(others_Slice);
                    }
                    that.new_data = new_data1;
                }
                else {
                    that.data.sort(function (a,b) { return b.weight - a.weight; });
                    that.new_data = that.data;
                }
                return that.new_data;
            },
            ticks : function () {
                if(PykCharts['boolean'](that.pointer_overflow_enable)) {
                    that.svgContainer.style("overflow","visible");
                }
                var w = [];
                that.ticks_text_width = [];
                    var tick_label = that.group.selectAll(".ticks_label")
                                    .data(that.pie(that.new_data));

                    tick_label.attr("class","ticks_label");

                    tick_label.enter()
                        .append("text")
                        .attr({
                            "x": 0,
                            "y": 0
                        });

                    var x,y;
                    tick_label.attr("transform",function (d) {
                        if (d.endAngle - d.startAngle < 0.2) {
                             x = (that.outer_radius +30 ) * (1) * Math.cos((d.startAngle + d.endAngle - Math.PI)/2);
                             y = (that.outer_radius/1+20) * (1) * Math.sin((d.startAngle + d.endAngle -  Math.PI)/2);
                        } else {
                             x = (that.outer_radius +22 ) * (1) * Math.cos((d.startAngle + d.endAngle - Math.PI)/2);
                             y = (that.outer_radius/1+24) * (1) * Math.sin((d.startAngle + d.endAngle -  Math.PI)/2);
                        }
                        return "translate(" + x + "," + y + ")";});

                    tick_label.text("")
                    function tick_label_timeout() {
                        tick_label.text(function(d) { return d.data.name; })
                            .text(function(d,i) {
                                that.ticks_text_width[i] = this.getBBox().width;
                                that.ticks_text_height = this.getBBox().height;
                                return d.data.name;
                            })
                            .attr({
                                "text-anchor": function(d) {
                                    var rads = ((d.endAngle - d.startAngle) / 2) + d.startAngle;
                                    if (rads>0 && rads<2) {
                                        return "start";
                                    } else if (rads>=1.5 && rads<3.5) {
                                        return "middle";
                                    } else if (rads>=3.5 && rads<6) {
                                        return "end";
                                    } else if (rads>=6) {
                                        return "middle";
                                    } else if(type ==="election pie" || type === "election donut" && rads < -1) {
                                        return "end";
                                    } else if(rads<0) {
                                        return "middle";
                                    }
                                },
                                "dy": 5,
                                "pointer-events": "none"
                            })
                            .style({
                                "fill": that.pointer_color,
                                "font-size": that.pointer_size + "px",
                                "font-weight": that.pointer_weight,
                                "font-family": that.pointer_family
                            });

                        tick_label.exit().remove();
                    }
                    setTimeout(tick_label_timeout,that.transitions.duration());


                    var tick_line = that.group.selectAll("line")
                        .data(that.pie(that.new_data));

                    tick_line.enter()
                        .append("line")
                        .attr("class", "ticks");

                    tick_line.attr({
                        "x1": function (d,i) {
                            return (that.outer_radius) * (1)* Math.cos((d.startAngle + d.endAngle)/2);
                        },
                        "y1": function (d,i) {
                            return (that.outer_radius) * (1) *Math.sin((d.endAngle + d.startAngle )/2);
                        },
                        "x2": function (d,i) {
                            return (that.outer_radius) * (1)* Math.cos((d.startAngle + d.endAngle)/2);
                        },
                        "y2": function (d,i) {
                            return (that.outer_radius) * (1) *Math.sin((d.endAngle + d.startAngle )/2);
                        }
                    });
                    function tick_line_timeout() {
                        tick_line.attr({
                            "x2": function (d, i) {
                                return (that.outer_radius/1+12)* (1) * Math.cos((d.startAngle + d.endAngle)/2);
                            },
                            "y2": function (d, i) {
                                return (that.outer_radius/1+12)* (1) * Math.sin((d.startAngle + d.endAngle)/2);
                            },
                            "transform": "rotate(-90)",
                            "stroke-width": that.pointer_thickness + "px",
                            "stroke": that.pointer_color
                        });
                        tick_line.exit().remove();
                    }

                    setTimeout(tick_line_timeout,that.transitions.duration());
                return this;
            },
            centerLabel: function () {
                if(PykCharts['boolean'](that.show_total_at_center) && (type === "donut" || type === "election donut")) {

                    var h;
                    var label = that.group.selectAll(that.selector +" "+".centerLabel")
                                    .data([that.sum]);

                    label.enter()
                        .append("text");

                    label.attr("class","centerLabel")
                        .text("");

                    function label_timeout() {
                        label.text( function(d) {
                                return that.k.appendUnits(that.sum);
                            })
                            .text( function(d) {
                                h = this.getBBox().height;
                                return that.k.appendUnits(that.sum);
                            })
                            .attr({
                                "pointer-events": "none",
                                "text-anchor": "middle",
                                "y": function () {
                                    return (type === "donut") ? h/2 : (-0.25*that.inner_radius);
                                },
                                "fill": that.show_total_at_center_color
                            })
                            .style({
                                "font-family": that.show_total_at_center_family,
                                "font-weight": that.show_total_at_center_weight,
                                "font-size": that.show_total_at_center_size + "px"
                            });

                    }
                    setTimeout(label_timeout,that.transitions.duration());

                    label.exit().remove();
                }
                return this;
            },
            set_start_end_angle: function () {
                that.startAngle, that.endAngle;
                if(type === "pie" || type === "donut") {
                    that.start_angle = (0 * (Math.PI/180));
                    that.end_angle = (360 * (Math.PI/180));
                } else if(type === "election pie" || type === "election donut") {
                    that.start_angle = (-90 * (Math.PI/180));
                    that.end_angle = (90 * (Math.PI/180));
                }
                return this;
            }
        };
        return optional;
    };
};

PykCharts.oneD.pyramid = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});

	this.execute = function (pykquery_data) {
        that = new PykCharts.validation.processInputs(that, options,'oneDimensionalCharts');
        that.chart_height = options.chart_height ? options.chart_height : that.chart_width;
        that.k.validator()
            .validatingDataType(that.chart_height,"chart_height",that.chart_width);

        if(that.stop) {
            return;
        }
        that.k.storeInitialDivHeight();
        if(that.mode === "default") {
           that.k.loading();
        }

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }

			that.data = that.k.__proto__._groupBy("oned",data);
            that.data_length = that.data.length;
            that.compare_data = that.k.__proto__._groupBy("oned",data);
            that.k.remove_loading_bar(id);
			that.clubdata_enable = that.data_length > that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            that.render();
		};
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
	};

    this.refresh = function (pykquery_data) {
        that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("oned",data);
            that.data_length = that.data.length;
            that.clubdata_enable = that.data_length>that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            that.refresh_data = that.k.__proto__._groupBy("oned",data);
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }
            that.new_data = that.optionalFeatures().clubData();
            if(that.color_mode === "shade") {
                shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.length);
                shade_array.reverse();
                that.new_data.forEach(function (d,i) {
                    d.color = shade_array[i];
                })
            }
            that.optionalFeatures()
                    .createChart()
                    .label()
                    .ticks();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
    };

	this.render = function () {
        var id = that.selector.substring(1,that.selector.length);
        var container_id = id + "_svg";
        that.fillChart = new PykCharts.Configuration.fillChart(that);
        that.transitions = new PykCharts.Configuration.transition(that);

        if (that.mode === "default") {
            that.k.title()
                .backgroundColor(that)
                .export(that,"#"+container_id,"pyramid")
                .emptyDiv(that.selector)
                .subtitle();
            that.new_data = that.optionalFeatures().clubData();
            if(that.color_mode === "shade") {
                shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.length);
                shade_array.reverse();
                that.new_data.forEach(function (d,i) {
                    d.color = shade_array[i];
                })
            }
            that.optionalFeatures().svgContainer(container_id)
                .createChart()
                .label()
                .ticks();

            that.k.createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource()
                .tooltip()
                .liveData(that);

            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);

        } else if (that.mode === "infographics") {
            that.new_data = that.data;
            if(that.color_mode === "shade") {
                shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.length);
                shade_array.reverse();
                that.new_data.forEach(function (d,i) {
                    d.color = shade_array[i];
                })
            }
            that.k.backgroundColor(that)
                .export(that,"#"+container_id,"pyramid")
                .emptyDiv(that.selector);
            that.optionalFeatures().svgContainer(container_id)
                .createChart()
                .label()
                .ticks();

            that.k.tooltip();
            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
        }

        var add_extra_width = 0;
        setTimeout(function () {
            if(that.ticks_text_width.length) {
                add_extra_width = d3.max(that.ticks_text_width,function(d){
                        return d;
                    });
            }
            that.k.exportSVG(that,"#"+container_id,"pyramid",undefined,undefined,add_extra_width)
        },that.transitions.duration());

        var resize = that.k.resize(that.svgContainer);
        that.k.__proto__._ready(resize);
        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer);
        });
	};

	this.percentageValues = function (data){
        // var clubdata_length = 0;
        // if (that.clubdata_always_include_data_points.length != 0 && that.clubdata_maximum_nodes <= that.clubdata_always_include_data_points.length) {
        //     clubdata_length = that.clubdata_always_include_data_points.length;
        // }
        // else {
        //     clubdata_length = data.length;
        // }
        // for(var i=0;i<clubdata_length;i++) {
        //     that.sum+=data[i].weight;
        // }
        that.sum = d3.sum(data, function (d){
            return d.weight;
        });
        var percentValues = data.map(function (d){
            return d.weight/that.sum*100;
        });
        percentValues.sort(function(a,b){
            return b-a;
        });
        return percentValues;
    };
	this.pyramidLayout = function () {
        var data,
            size,
            coordinates;

        var pyramid = {
            data: function(d){
                if(!(d.length===0)) {
                     data = d;
                }
                return this;
            },
            size: function(s){
                if(s.length === 2) {
                    size = s;
                }
                // if (s.length!==2){
                // } else {
                //     size = s;
                // }
                return this;
            },
            coordinates: function(c){
                var w = size[0],
                    h = size[1],
                    ratio = (w/2)/h,
                    percentValues = that.percentageValues(data),
                    coordinates = [],
                    area_of_triangle = (w * h) / 2;
                 function d3Sum (i) {
                    return d3.sum(percentValues,function (d, j){
                        if (j>=i) {
                            return d;
                        }
                    });
                }
                for (var i=0,len=data.length;i<len; i++){
                    var selectedPercentValues = d3Sum(i),
                        area_of_element = selectedPercentValues/100 * area_of_triangle,
                        height1 = Math.sqrt(area_of_element/ratio),
                        base = 2 * ratio * height1,
                        xwidth = (w-base)/2;
                    if (i===0){
                        coordinates[i] = {"values":[{"x":w/2,"y":0},{"x":xwidth,"y":height1},{"x":base+xwidth,"y":height1}]};
                    }else{
                        coordinates[i] = {"values":[coordinates[i-1].values[1],{"x":xwidth,"y":height1},{"x":base+xwidth,"y":height1},coordinates[i-1].values[2]]};
                    }
                }
                return coordinates;
            }
        };
        return pyramid;
    };

    this.optionalFeatures = function () {

    	var optional = {
            svgContainer :function (container_id) {

                that.svgContainer = d3.select(that.selector)
                    .append('svg')
                    .attr({
                        "width": that.chart_width,
                        "height": that.chart_height,
                        "preserveAspectRatio": "xMinYMin",
                        "viewBox": "0 0 " + that.chart_width + " " + that.chart_height,
                        "id": container_id,
                        "class": "svgcontainer PykCharts-oneD"
                    });

                that.group = that.svgContainer.append("g")
                    .attr("id","pyrgrp");

                return this;
            },
        	createChart : function () {
                var border = new PykCharts.Configuration.border(that);
        		that.pyramid = that.pyramidLayout()
                    .data(that.new_data)
                    .size([that.chart_width,that.chart_height]);
		        that.coordinates = that.pyramid.coordinates();
                that.coordinates[0].values[1] = that.coordinates[that.coordinates.length-1].values[1];
                that.coordinates[0].values[2] = that.coordinates[that.coordinates.length-1].values[2];
                var k = that.new_data.length-1,p = that.new_data.length-1,tooltipArray = [];
                for(var i=0,len=that.new_data.length;i<len;i++){
                    if(i==0) {
                        tooltipArray[i] = that.new_data[i].tooltip || "<table class='PykCharts'><tr><th colspan='2'  class='tooltip-heading'>"+that.new_data[i].name+"</tr><tr><td class='tooltip-left-content'>"+that.k.appendUnits(that.new_data[i].weight)+"<td class='tooltip-right-content'>("+((that.new_data[i].weight*100)/that.sum).toFixed(1)+"%) </tr></table>";
                    } else {
                        tooltipArray[i] = that.new_data[k].tooltip || "<table class='PykCharts'><tr><th colspan='2'  class='tooltip-heading'>"+that.new_data[k].name+"</tr><tr><td class='tooltip-left-content'>"+that.k.appendUnits(that.new_data[k].weight)+"<td class='tooltip-right-content'>("+((that.new_data[k].weight*100)/that.sum).toFixed(1)+"%) </tr></table>";
                        k--;
                    }
                }
		        var line = d3.svg.line()
                    .interpolate('linear-closed')
                    .x(function(d,i) { return d.x; })
                    .y(function(d,i) { return d.y; });

                var a = [{x:0,y:that.chart_height},{x:that.chart_width,y:that.chart_height},{x:0,y:that.chart_height},{x:that.chart_width,y:that.chart_height},{x:0,y:that.chart_height},{x:that.chart_width,y:that.chart_height}]
                var k =that.new_data.length,b;

                that.chart_data =that.group.selectAll('.pyr-path')
                    .data(that.coordinates)
                that.chart_data.enter()
                    .append('path')

                that.chart_data.attr({
                    "class": "pyr-path",
                    'd': function(d) {return line(a);},
                    "stroke": border.color(),
                    "stroke-width": border.width(),
                    "stroke-dasharray": border.style(),
                    "fill": function (d,i) {
                        if(i===0) {
                            b = that.new_data[i];
                            d.color = that.new_data[i].color;
                        }
                        else {
                            k--;
                            b = that.new_data[k];
                            d.color = that.new_data[k].color;
                        }
                        return that.fillChart.selectColor(b);
                    },
                    "fill-opacity": 1,
                    "data-fill-opacity": function () {
                        return d3.select(this).attr("fill-opacity");
                    },
                    "data-id" : function (d,i) {
                        return that.new_data[i].name;
                    }
                })
                .on({
                    "mouseover": function (d,i) {
                        if(that.mode === "default") {
                            if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                that.mouseEvent.highlight(that.selector +" "+".pyr-path",this);
                            }
                            that.mouseEvent.tooltipPosition(d);
                            that.mouseEvent.tooltipTextShow(tooltipArray[i]);
                        }
                    },
                    "mouseout": function (d) {
                        if(that.mode === "default") {
                            if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                that.mouseEvent.highlightHide(that.selector +" "+".pyr-path")
                            }
                            that.mouseEvent.tooltipHide(d);
                        }
                    },
                    "mousemove": function (d,i) {
                        if(that.mode === "default") {
                            that.mouseEvent.tooltipPosition(d);
                        }
                    },
                    "click" : function (d,i) {
                        if(PykCharts['boolean'](that.click_enable)){
                           that.addEvents(that.new_data[i].name, d3.select(this).attr("data-id"));
                        }
                    }
                })
                .transition()
                .duration(that.transitions.duration())
                .attr('d',function (d){ return line(d.values); });

                that.chart_data.exit().remove();

		        return this;
        	},
            label: function () {
                    var j = that.new_data.length;
                    var p = that.new_data.length;
                    that.chart_text = that.group.selectAll("text")
                        .data(that.coordinates)

                    that.chart_text.enter()
                        .append("text")

                    that.chart_text.attr({
                        "text-anchor": "middle",
                        "pointer-events": "none",
                        "fill": function(d) {
                            if(that.color_mode === "shade" && !options.label_color) {
                                var color_value = that.k.__proto__._colourBrightness(d.color);
                                if(color_value === "light") {
                                    return "black";
                                } else {
                                    return "white";
                                }
                            }
                            return that.label_color;
                        },
                        "y": function (d,i) {
                            if(d.values.length === 4) {
                                return (((d.values[0].y-d.values[1].y)/2)+d.values[1].y) + 5;
                            } else {
                                return (d.values[0].y + that.coordinates[that.coordinates.length-1].values[1].y)/2 + 10;
                            }
                        },
                        "x": function (d,i) { return that.chart_width/2;}
                    })
                    .text("")
                    .style({
                        "font-weight": that.label_weight,
                        "font-size": that.label_size + "px",
                        "font-family": that.label_family
                    });
                    function chart_text_timeout() {
                        that.chart_text.text(function (d,i) {
                                if(i===0) {
                                    return ((that.new_data[i].weight*100)/that.sum).toFixed(1)+"%";

                                }
                                else {
                                    j--;
                                     return ((that.new_data[j].weight*100)/that.sum).toFixed(1)+"%";
                                }
                             })
                            .text(function (d,i) {
                                if(this.getBBox().width < (d.values[2].x - d.values[1].x) && this.getBBox().height < Math.abs(d.values[1].y - d.values[0].y)) {
                                    if(i===0) {
                                        return ((that.new_data[i].weight*100)/that.sum).toFixed(1)+"%";

                                    }else {
                                        p--;
                                        return ((that.new_data[p].weight*100)/that.sum).toFixed(1)+"%";

                                    }
                                }
                                else {
                                    return "";
                                }
                            });
                    }
                    setTimeout(chart_text_timeout,that.transitions.duration());

                    that.chart_text.exit().remove();

                return this;
            },
            ticks : function () {
                if(PykCharts['boolean'](that.pointer_overflow_enable)) {
                    that.svgContainer.style("overflow","visible");
                }

                var tick_label = that.group.selectAll(".ticks_label")
                        .data(that.coordinates);

                tick_label.enter()
                    .append("text")
                    .attr({
                        "x": 0,
                        "y": 0,
                        "class": "ticks_label"
                    });

                var x,y,w = [];
                that.ticks_text_width = [];
                var j = that.new_data.length;
                var n = that.new_data.length;
                tick_label.attr("transform",function (d) {
                    if (d.values.length === 3) {
                        x = ((d.values[0].x + that.coordinates[that.coordinates.length-1].values[2].x)/2) + 17;
                    } else {
                        x = ((d.values[2].x + d.values[3].x)/2 ) + 17;
                    }
                    if(d.values.length === 4) {
                        y= (((d.values[0].y-d.values[1].y)/2)+d.values[1].y) +2;
                    } else {
                        y =(d.values[0].y + that.coordinates[that.coordinates.length-1].values[1].y)/2;
                    }

                    return "translate(" + x + "," + (y + 5) + ")";
                });

                tick_label.text("");

                function tick_label_timeout() {
                    tick_label.text(function (d,i) {
                            if(i===0) {
                                return that.new_data[i].name;
                            }
                            else {
                                n--;
                                return that.new_data[n].name;
                            }
                        })
                        .text(function (d,i) {
                            if(i===0) {
                                w[i] = this.getBBox().height;
                                that.ticks_text_width[i] = this.getBBox().width;
                                if (this.getBBox().height < (d.values[1].y - d.values[0].y)) {
                                    return that.new_data[i].name;

                                } else {
                                    return "";
                                }
                            }
                            else {
                                w[i] = this.getBBox().height;
                                if (this.getBBox().height < (d.values[0].y - d.values[1].y)) {
                                     j--;
                                    return that.new_data[j].name;
                                }
                                else {
                                    return "";
                                }
                            }
                    })
                    .style({
                        "fill": that.pointer_color,
                        "font-size": that.pointer_size + "px",
                        "font-family": that.pointer_family,
                        "font-weight": that.pointer_weight
                    })
                    .attr("text-anchor","start");

                }
                setTimeout(tick_label_timeout,that.transitions.duration());

                tick_label.exit().remove();
                var tick_line = that.group.selectAll(".pyr-ticks")
                    .data(that.coordinates);

                tick_line.enter()
                    .append("line")
                    .attr("class", "pyr-ticks");

                tick_line
                    .attr({
                        "x1": function (d,i) {
                            if (d.values.length === 3) {
                                return (d.values[0].x + that.coordinates[that.coordinates.length-1].values[2].x)/2 ;
                            } else {
                                return ((d.values[2].x + d.values[3].x)/2 );
                            }
                        },
                        "y1": function (d,i) {
                            if(d.values.length === 4) {
                                return (((d.values[0].y-d.values[1].y)/2)+d.values[1].y) +2;
                            } else {
                                return (d.values[0].y + that.coordinates[that.coordinates.length-1].values[1].y)/2;
                            }
                        },
                        "x2": function (d, i) {
                            if (d.values.length === 3) {
                                return (d.values[0].x + that.coordinates[that.coordinates.length-1].values[2].x)/2  ;
                            } else {
                                return ((d.values[2].x + d.values[3].x)/2 )  ;
                            }
                        },
                        "y2": function (d, i) {
                            if(d.values.length === 4) {
                                return (((d.values[0].y-d.values[1].y)/2)+d.values[1].y) +2;
                            } else {
                                return (d.values[0].y + that.coordinates[that.coordinates.length-1].values[1].y)/2;
                            }
                        },
                        "stroke-width": that.pointer_thickness + "px",
                        "stroke": that.pointer_color
                    });
                    function tick_line_timeout() {
                        tick_line.attr("x2", function (d,i) {
                            if(Math.abs(d.values[0].y - d.values[1].y) > w[i]) {
                                if (d.values.length === 3) {
                                    return (d.values[0].x + that.coordinates[that.coordinates.length-1].values[2].x)/2 + 12;
                                } else {
                                    return ((d.values[2].x + d.values[3].x)/2 ) + 12;
                                }
                            } else {
                                if (d.values.length === 3) {
                                    return (d.values[0].x + that.coordinates[that.coordinates.length-1].values[2].x)/2 ;
                                } else {
                                    return ((d.values[2].x + d.values[3].x)/2 ) ;
                                }
                            }
                        });
                    }
                    setTimeout(tick_line_timeout, that.transitions.duration());

                tick_line.exit().remove();
                return this;
            },
            clubData: function () {
            	if (PykCharts['boolean'](that.clubdata_enable)) {
                    var clubdata_content = [];
                    if(that.clubdata_always_include_data_points.length!== 0){
                        var l = that.clubdata_always_include_data_points.length;
                        for(i=0; i < l; i++){
                            clubdata_content[i] = that.clubdata_always_include_data_points[i];
                        }
                    }
                    var new_data1 = [];
                    for(i=0;i<clubdata_content.length;i++){
                        for(j=0;j<that.data.length;j++){
                            if(clubdata_content[i].toUpperCase() === that.data[j].name.toUpperCase()){
                                new_data1.push(that.data[j]);
                            }
                        }
                    }
                    that.data.sort(function (a,b) { return b.weight - a.weight; });
                    var k = 0;

                    while(new_data1.length<that.clubdata_maximum_nodes-1){
                        for(i=0;i<clubdata_content.length;i++){
                            if(that.data[k].name.toUpperCase() === clubdata_content[i].toUpperCase()){
                                k++;
                            }
                        }
                        new_data1.push(that.data[k]);
                        k++;
                    }
                    var sum_others = 0;
                    for(j=k; j < that.data.length; j++){
                        for(i=0; i<new_data1.length && j<that.data.length; i++){
                            if(that.data[j].name.toUpperCase() === new_data1[i].name.toUpperCase()){
                                sum_others +=0;
                                j++;
                                i = -1;
                            }
                        }
                        if(j < that.data.length){
                            sum_others += that.data[j].weight;
                        }
                    }
                    var sortfunc = function (a,b) { return b.weight - a.weight; };

                    while(new_data1.length > that.clubdata_maximum_nodes){
                        new_data1.sort(sortfunc);
                        var a=new_data1.pop();
                    }
                    var others_Slice = { "name":that.clubdata_text, "weight": sum_others,/* "color": that.clubdata_color,*/ "tooltip": that.clubdata_tooltip };
                    new_data1.sort(function(a,b){
                        return a.weight - b.weight;
                    })
                    if(new_data1.length < that.clubdata_maximum_nodes){
                        new_data1.push(others_Slice);
                    }
                    that.new_data = new_data1;
                }
                else {
                    that.data.sort(function (a,b) { return a.weight - b.weight; });
                    that.new_data = that.data;
                }
                return that.new_data;
            }
        }
    	return optional;
    };
};

PykCharts.oneD.treemap = function (options){
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});
    this.execute = function (pykquery_data){
        that = new PykCharts.validation.processInputs(that, options,'oneDimensionalCharts');
        optional = options.optional;
        that.chart_height = options.chart_height ? options.chart_height : that.chart_width;
        that.k.validator()
            .validatingDataType(that.chart_height,"chart_height",that.chart_width);

        if(that.stop) {
            return;
        }
        that.k.storeInitialDivHeight();
        if(that.mode === "default") {
           that.k.loading();
        }

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }

            that.data = that.k.__proto__._groupBy("oned",data);
            that.compare_data = that.k.__proto__._groupBy("oned",data);
            that.k.remove_loading_bar(id);
            that.clubdata_enable = that.data.length>that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            that.render();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };

    this.refresh = function (pykquery_data){
        that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("oned",data);
            that.clubdata_enable = that.data.length>that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            that.refresh_data = that.k.__proto__._groupBy("oned",data);
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }
            that.optionalFeatures()
                .clubData()
            if(that.color_mode === "shade") {
                shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.children.length);
                that.new_data.children.forEach(function (d,i) {
                    d.color = shade_array[i];
                })
            }
            that.optionalFeatures()
                .createChart()
                .label();

        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
    };

    this.render = function (){
        var id = that.selector.substring(1,that.selector.length);
        var container_id = id + "_svg";
        that.fillChart = new PykCharts.Configuration.fillChart(that);
        that.transitions = new PykCharts.Configuration.transition(that);

        if(that.mode === "default") {
            that.k.title()
                .backgroundColor(that)
                .export(that,"#"+container_id,"treemap")
                .emptyDiv(that.selector)
                .subtitle();
        }

        that.k.tooltip();
        that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
        if(that.mode === "infographics"){
            that.k.backgroundColor(that)
                .export(that,"#"+container_id,"treemap")
                .emptyDiv(that.selector);
            that.new_data = {"children" : that.data};
        }

        if(that.mode === "default") {
            that.optionalFeatures()
                .clubData()
        }
        if(that.color_mode === "shade") {
            shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.children.length);
            that.new_data.children.forEach(function (d,i) {
                d.color = shade_array[i];
            })
        }
        that.optionalFeatures().svgContainer(container_id)
            .createChart()
            .label();
        if(that.mode === "default") {
            that.k.liveData(that)
                .createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource();
        }

        that.k.exportSVG(that,"#"+container_id,"treemap")

        var resize = that.k.resize(that.svgContainer);
        that.k.__proto__._ready(resize);
        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer);
        });
    };

    this.optionalFeatures = function (){
        var optional = {
            svgContainer: function (container_id) {

                that.svgContainer = d3.select(that.selector).append("svg:svg")
                    .attr({
                        "width": that.chart_width,
                        "height": that.chart_height,
                        "preserveAspectRatio": "xMinYMin",
                        "viewBox": "0 0 " + that.chart_width + " " + that.chart_height,
                        "id": container_id,
                        "class": "svgcontainer PykCharts-oneD"
                    });

                that.group = that.svgContainer.append("g")
                    .attr("id","treemap");
                return this;
            },
            createChart: function () {
                that.treemap = d3.layout.treemap()
                    .sort(function (a,b) { return a.weight - b.weight; })
                    .size([that.chart_width,that.chart_height])
                    .value(function (d) { return d.weight; })
                    .sticky(false);
                that.sum = d3.sum(that.new_data.children, function (d){
                        return d.weight;
                    });
                var l;

                that.node = that.treemap.nodes(that.new_data);
                l = that.new_data.children.length;
                that.chart_data = that.group.selectAll(".cell")
                                    .data(that.node);
                that.chart_data.enter()
                    .append("svg:g")
                    .attr("class","cell")
                    .append("svg:rect")
                    .attr("class","treemap-rect");

                that.chart_data.attr("class","cell")
                    .select("rect")
                    .attr({
                        "class": "treemap-rect",
                        "id": function (d,i) { return "rect" + i; },
                        "x": function (d) { return d.x; },
                        "y": function (d) { return d.y; },
                        "width": function (d) { return d.dx-1; },
                        "height": 0,
                        "fill": function (d) {
                            return d.children ? "white" : that.fillChart.selectColor(d);
                        },
                        "fill-opacity": 1,
                        "data-fill-opacity": function () {
                            return d3.select(this).attr("fill-opacity");
                        },
                        "data-id" : function (d,i) {
                            return d.name;
                        }
                    })
                    .on({
                        'mouseover': function (d) {
                            if(!d.children && that.mode === "default") {
                                d.tooltip = d.tooltip || "<table class='PykCharts'><tr><th colspan='2' class='tooltip-heading'>"+d.name+"</tr><tr><td class='tooltip-left-content'>"+that.k.appendUnits(d.weight)+"<td class='tooltip-right-content'>("+((d.weight*100)/that.sum).toFixed(1)+"%)</tr></table>";
                                if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlight(that.selector +" "+".treemap-rect", this);
                                }
                                that.mouseEvent.tooltipPosition(d);
                                that.mouseEvent.tooltipTextShow(d.tooltip);
                            }
                        },
                        'mouseout': function (d) {
                            if(that.mode === "default") {
                                that.mouseEvent.tooltipHide(d);
                                if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlightHide(that.selector +" "+".treemap-rect");
                                }
                            }
                        },
                        'mousemove': function (d) {
                            if(!d.children && that.mode === "default") {
                                that.mouseEvent.tooltipPosition(d);
                            }
                        },
                        'click' :  function (d,i) {
                            if(PykCharts['boolean'](that.click_enable)){
                               that.addEvents(d.name, d3.select(this).attr("data-id"));
                            }
                        }
                    })
                    .transition()
                    .duration(that.transitions.duration())
                    .attr("height", function (d) { return d.dy-1; });

                that.chart_data.exit()
                    .remove();
                return this;
            },
            label: function () {
                    that.chart_text = that.group.selectAll(".name")
                        .data(that.node);
                    that.chart_text1 = that.group.selectAll(".weight")
                        .data(that.node);
                    that.chart_text.enter()
                        .append("svg:text")
                        .attr("class","name");

                    that.chart_text1.enter()
                        .append("svg:text")
                        .attr("class","weight");

                    that.chart_text.attr({
                        "class": "name",
                        "x": function (d) { return d.x + d.dx / 2; },
                        "y": function (d) { return d.y + d.dy / 2; }
                    });

                    that.chart_text1.attr({
                        "class": "weight",
                        "x": function (d) { return d.x + d.dx / 2; },
                        "y": function (d) { return d.y + d.dy / 2 + that.label_size; }
                    });

                    that.chart_text
                        .attr({
                            "text-anchor": "middle",
                            "fill": function(d) {
                                if(that.color_mode === "shade" && !d.children && !options.label_color) {
                                    var color_value = that.k.__proto__._colourBrightness(d.color);
                                    if(color_value === "light") {
                                        return "black";
                                    } else {
                                        return "white";
                                    }
                                }
                                return that.label_color;
                            }
                        })
                        .style({
                            "font-weight": that.label_weight,
                            "font-size": that.label_size + "px",
                            "font-family": that.label_family
                        })
                        .text("");
                    function chart_text1_timeout() {
                        that.chart_text.text(function (d) { return d.children ? " " :  d.name; })
                            .attr("pointer-events","none")
                            .text(function (d) {

                                if(this.getBBox().width<d.dx && this.getBBox().height<d.dy-15) {
                                    return d.children ? " " :  d.name;
                                }
                                else {
                                    return "";
                                }
                            });
                    }
                    setTimeout(chart_text1_timeout,that.transitions.duration());

                    that.chart_text1
                        .attr({
                            "text-anchor": "middle",
                            "fill": function(d) {
                                if(that.color_mode === "shade" && !d.children && !options.label_color) {
                                    var color_value = that.k.__proto__._colourBrightness(d.color);
                                    if(color_value === "light") {
                                        return "black";
                                    } else {
                                        return "white";
                                    }
                                }
                                return that.label_color;
                            },
                            "pointer-events": "none"
                        })
                        .style({
                            "font-weight": that.label_weight,
                            "font-size": that.label_size + "px",
                            "font-family": that.label_family
                        })
                        .text("");

                    function timeout() {
                        that.chart_text1.text(function (d) { return d.children ? " " :  that.k.appendUnits(d.weight); })
                            .text(function (d) {
                                if(this.getBBox().width < d.dx && this.getBBox().height < d.dy-15) {
                                    return d.children ? " " :  ((d.weight*100)/that.sum).toFixed(1)+"%"; /*that.k.appendUnits(d.weight);*/

                                }
                                else {
                                    return "";
                                }
                            });
                    }

                    setTimeout(timeout,that.transitions.duration());

                    that.chart_text.exit()
                        .remove();
                    that.chart_text1.exit()
                        .remove();
                return this;
            },
            clubData : function () {
                if(PykCharts['boolean'](that.clubdata_enable)){
                    var clubdata_content = [],sum_others = 0,k=0;
                    if(that.data.length <= that.clubdata_maximum_nodes) {
                        that.new_data = { "children" : that.data };
                        return this;
                    }
                    if(that.clubdata_always_include_data_points.length!== 0){
                        var l = that.clubdata_always_include_data_points.length;
                        for(i=0; i < l; i++){
                            clubdata_content[i] = that.clubdata_always_include_data_points[i];
                        }
                    }
                    var new_data1 = [];
                    for(i=0;i<clubdata_content.length;i++){
                        for(j=0;j<that.data.length;j++){
                            if(clubdata_content[i].toUpperCase() === that.data[j].name.toUpperCase()){
                                new_data1.push(that.data[j]);
                            }
                        }
                    }
                    that.data.sort(function (a,b) { return b.weight - a.weight; });

                    while(new_data1.length<that.clubdata_maximum_nodes-1){
                        for(i=0;i<clubdata_content.length;i++){
                            if(that.data[k].name.toUpperCase() === clubdata_content[i].toUpperCase()){
                                k++;
                            }
                        }
                        new_data1.push(that.data[k]);
                        k++;
                    }
                    for(j=k; j < that.data.length; j++){
                        for(i=0; i<new_data1.length && j<that.data.length; i++){
                            if(that.data[j].name.toUpperCase() === new_data1[i].name.toUpperCase()){
                                sum_others +=0;
                                j++;
                                i = -1;
                            }
                        }
                        if(j < that.data.length){
                            sum_others += that.data[j].weight;
                        }
                    }
                    var sortfunc = function (a,b) { return b.weight - a.weight; };
                    while(new_data1.length > that.clubdata_maximum_nodes){
                        new_data1.sort(sortfunc);
                        var a=new_data1.pop();
                    }
                    var others_Slice = { "name":that.clubdata_text, "weight": sum_others, "color": that.clubData_color, "tooltip": that.clubData_tooltip };

                    if(new_data1.length < that.clubdata_maximum_nodes){
                        new_data1.push(others_Slice);

                    }
                    that.new_data = {"children" : new_data1};
                }
                else {
                    that.new_data = {"children" : that.data};
                }
                return this;
            },
        };
        return optional;
    };
};

PykCharts.other.pictograph = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});
    this.execute = function () {
        that = new PykCharts.validation.processInputs(that, options, "other");
        var optional = options.optional,
            otherCharts = theme.otherCharts;
        that.pictograph_show_all_images = options.pictograph_show_all_images ? options.pictograph_show_all_images.toLowerCase() : otherCharts.pictograph_show_all_images;
        that.pictograph_total_count_enable = options.pictograph_total_count_enable ? options.pictograph_total_count_enable.toLowerCase() : otherCharts.pictograph_total_count_enable;
        that.pictograph_current_count_enable = options.pictograph_current_count_enable ? options.pictograph_current_count_enable.toLowerCase() : otherCharts.pictograph_current_count_enable;
        that.pictograph_image_per_line = options.pictograph_image_per_line ?  options.pictograph_image_per_line : otherCharts.pictograph_image_per_line;
        that.pictograph_current_count_size = options.pictograph_current_count_size ? options.pictograph_current_count_size : otherCharts.pictograph_current_count_size;
        that.pictograph_current_count_color = options.pictograph_current_count_color ? options.pictograph_current_count_color : otherCharts.pictograph_current_count_color;
        that.pictograph_current_count_weight = options.pictograph_current_count_weight ? options.pictograph_current_count_weight.toLowerCase() : otherCharts.pictograph_current_count_weight;
        that.pictograph_current_count_family = options.pictograph_current_count_family ? options.pictograph_current_count_family.toLowerCase() : otherCharts.pictograph_current_count_family;
        that.pictograph_total_count_size = options.pictograph_total_count_size ? options.pictograph_total_count_size : otherCharts.pictograph_total_count_size;
        that.pictograph_total_count_color = options.pictograph_total_count_color ? options.pictograph_total_count_color : otherCharts.pictograph_total_count_color;
        that.pictograph_total_count_weight = options.pictograph_total_count_weight ? options.pictograph_total_count_weight.toLowerCase() : otherCharts.pictograph_total_count_weight;
        that.pictograph_total_count_family = options.pictograph_total_count_family ? options.pictograph_total_count_family.toLowerCase() : otherCharts.pictograph_total_count_family;
        that.pictograph_image_width =  options.pictograph_image_width ? options.pictograph_image_width : otherCharts.pictograph_image_width;
        that.pictograph_image_height = options.pictograph_image_height ? options.pictograph_image_height : otherCharts.pictograph_image_height;
        that.pictograph_units_per_image = options.pictograph_units_per_image ? options.pictograph_units_per_image : "";
        that.pictograph_units_per_image_text_family = options.pictograph_units_per_image_text_family ? options.pictograph_units_per_image_text_family.toLowerCase(): otherCharts.pictograph_units_per_image_text_family;
        that.pictograph_units_per_image_text_size = options.pictograph_units_per_image_text_size ? options.pictograph_units_per_image_text_size : otherCharts.pictograph_units_per_image_text_size;
        that.pictograph_units_per_image_text_color = options.pictograph_units_per_image_text_color ? options.pictograph_units_per_image_text_color : otherCharts.pictograph_units_per_image_text_color;
        that.pictograph_units_per_image_text_weight = options.pictograph_units_per_image_text_weight ? options.pictograph_units_per_image_text_weight.toLowerCase() : otherCharts.pictograph_units_per_image_text_weight;
        that.chart_height = options.chart_height ? options.chart_height : that.chart_width;
        that.k.validator()
            .validatingDataType(that.chart_height,"chart_height",that.chart_width)
            .validatingDataType(that.pictograph_units_per_image_text_size,"pictograph_units_per_image_text_size",otherCharts.pictograph_units_per_image_text_size)
            .validatingDataType(that.pictograph_current_count_size,"pictograph_current_count_size",otherCharts.pictograph_current_count_size)
            .validatingDataType(that.pictograph_total_count_size,"pictograph_total_count_size",otherCharts.pictograph_total_count_size)
            .validatingDataType(that.pictograph_image_width,"pictograph_image_width",otherCharts.pictograph_image_width)
            .validatingDataType(that.pictograph_image_height,"pictograph_image_height",otherCharts.pictograph_image_height)
            .validatingDataType(that.pictograph_image_per_line,"pictograph_image_per_line",otherCharts.pictograph_image_per_line)
            .validatingFontWeight(that.pictograph_current_count_weight,"pictograph_current_count_weight",otherCharts.pictograph_current_count_weight)
            .validatingFontWeight(that.pictograph_total_count_weight,"pictograph_total_count_weight",otherCharts.pictograph_total_count_weight)
            .validatingFontWeight(that.pictograph_units_per_image_text_weight,"pictograph_units_per_image_text_weight",otherCharts.pictograph_units_per_image_text_weight)
            .validatingColor(that.pictograph_current_count_color,"pictograph_current_count_color",otherCharts.pictograph_current_count_color)
            .validatingColor(that.pictograph_total_count_color,"pictograph_total_count_color",otherCharts.pictograph_total_count_color)
            .validatingColor(that.pictograph_units_per_image_text_color,"pictograph_units_per_image_text_color",otherCharts.pictograph_units_per_image_text_color);
        if(that.stop) {
            return;
        }

        that.k.storeInitialDivHeight();
        if(that.mode === "default") {
           that.k.loading();
        }

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }

            that.data = data.sort(function(a,b) {
                return b.weight - a.weight;
            });
            that.old_weight = 0;

            that.compare_data = that.data;
            that.k.remove_loading_bar(id);
            that.render();
        };
        that.k.dataSourceFormatIdentification(options.data,that,"executeData");
    };
    this.refresh = function () {
        that.executeRefresh = function (data) {
            that.old_data = that.data;
            that.old_weight = that.weight;
            var validate = that.k.validator().validatingJSON(data);
            if(that.stop || validate === false) {
                return;
            }

            that.data = data.sort(function(a,b) {
                return b.weight - a.weight;
            });
            that.refresh_data = that.data;
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }
            that.optionalFeatures()
                .labelText()
                .enableLabel()
                .createChart();
        }
        that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
    }
    this.render = function () {
        var id = that.selector.substring(1,that.selector.length),
            container_id = id + "_svg";
        that.transitions = new PykCharts.Configuration.transition(that);

        if(that.mode==="default") {
            that.k.title()
                .backgroundColor(that)
                .export(that,"#"+container_id,"pictograph")
                .emptyDiv()
                .subtitle()
                .liveData(that);
        } else {
            that.k.backgroundColor(that)
                .export(that,"#"+container_id,"pictograph")
                .emptyDiv();
        }

        that.optionalFeatures()
                .svgContainer(container_id)
                .labelText()
                .enableLabel()
        if(PykCharts['boolean'](that.pictograph_units_per_image)) {
            that.optionalFeatures().appendUnits()
        }
        that.optionalFeatures().createChart();
        if(that.mode==="default") {
            that.k.createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource();
        }
        that.k.exportSVG(that,"#"+container_id,"pictograph");
        var resize = that.k.resize(that.svgContainer);
        that.k.__proto__._ready(resize);
        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer);
        });
    };

    this.optionalFeatures = function () {

        var optional = {
            svgContainer: function (container_id) {
                that.svgContainer = d3.select(that.selector).append('svg')
                    .attr({
                        "width": that.chart_width,
                        "id": container_id,
                        "class": "svgcontainer",
                        "preserveAspectRatio": "xMinYMin",
                        "viewBox": "0 0 " + that.chart_width + " " + that.chart_height
                    });

                that.group = that.svgContainer.append("g")
                    .attr("id", "pictograph_image_group")

                that.group1 = that.svgContainer.append("g")
                    .attr("transform","translate(0,0)");

                if(PykCharts['boolean'](that.pictograph_units_per_image)) {
                    that.group2 = that.svgContainer.append("g")
                        .attr("id","units-per-image");
                }

                return this;
            },
            createChart: function () {
                var a = 0,b=0;

                that.optionalFeatures().showTotal();
                var counter = 0;

                if(!that.textWidth) {
                    that.textWidth = 0;
                }

                if(!that.totalTxtWeight) {
                    that.totalTxtWeight = 0;
                }

                var width = that.textWidth + that.totalTxtWeight + 25;

                if(that.total_unit_width > width) {
                    width = that.total_unit_width + 10
                }

                that.group.attr("transform", "translate(" + (width) + ",0)")
                for(var j=1; j<=that.weight; j++) {
                    if(j <= that.data[1].weight) {
                        if (!that.old_data || (that.old_data && j > that.old_data[1].weight)) {
                            that.group.append("image")
                                .attr({
                                    "xlink:href": that.data[1]["image"],
                                    "id": "current_image"+j,
                                    "x": b *(that.pictograph_image_width + 1),
                                    "y": a *(that.pictograph_image_height + 10),
                                    "width": 0,
                                    "height": that.pictograph_image_height + "px"
                                })
                                .transition()
                                .duration(that.transitions.duration())
                                .attr("width", that.pictograph_image_width + "px");

                            setTimeout(function () {
                                var total_image_element = d3.selectAll("#total_image"+j);
                                if (total_image_element) {
                                    total_image_element.remove();
                                }
                            },that.transitions.duration());
                        }
                    } else if ((j > that.old_weight && that.weight > that.old_weight) || (that.old_data && j <= that.old_data[1].weight)) {
                            that.group.append("image")
                                .attr({
                                    "xlink:href": that.data[0]["image"],
                                    "id": "total_image"+j,
                                    "x": b *(that.pictograph_image_width + 1),
                                    "y": a *(that.pictograph_image_height+ 10),
                                    "width": 0,
                                    "height": that.pictograph_image_height + "px"
                                })
                                .transition()
                                .duration(that.transitions.duration())
                                .attr("width", that.pictograph_image_width + "px");
                    }
                    counter++;
                    b++;

                    if (counter >= that.pictograph_image_per_line) {
                        a++;
                        b=0;
                        counter=0;
                    }

                    var group_bbox_height = that.group.node().getBBox().height;
                    if (j===+that.weight && group_bbox_height != 0) {
                        that.chart_height = group_bbox_height;

                        that.svgContainer
                            .attr({
                                "height": group_bbox_height,
                                "viewBox": "0 0 " + that.chart_width + " " + group_bbox_height
                            });
                    }
                    else {
                        that.svgContainer
                            .attr({
                                "height": group_bbox_height,
                                "viewBox": "0 0 " + that.chart_width + " " + that.chart_height
                            });
                    }
                }

                setTimeout(function () {
                    if (that.old_data && that.old_data[1].weight > that.data[1].weight) {
                        for (var i = that.old_data[1].weight; i > that.data[1].weight; i--) {
                            var current_image_elements = d3.selectAll("#current_image"+i);
                            if (current_image_elements) {
                                current_image_elements.remove();
                            }
                        }
                    }
                    if (that.old_data && that.old_data[0].weight > that.data[0].weight) {
                        for (var i = that.old_data[0].weight; i > that.data[0].weight; i--) {
                            var total_image_element = d3.selectAll("#total_image"+i);
                                if (total_image_element) {
                                    total_image_element.remove();
                                }
                        }
                    }
                },that.transitions.duration());

                if(((that.pictograph_image_width * that.pictograph_image_per_line) + width) > that.chart_width) {
                    console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px',"Your Lable text size and image width exceeds the chart conatiner width")
                }
                return this;
            },
            showTotal: function () {
                 if (PykCharts['boolean'](that.pictograph_show_all_images)) {
                    that.weight = that.data[0].weight;
                }
                else {
                    that.weight = that.data[1].weight;
                }
                return this ;
            },
            enableLabel: function () {
                if (PykCharts['boolean'](that.pictograph_total_count_enable)) {
                    var current_text = d3.selectAll(that.selector+" .PykCharts-current-text");
                    if (current_text.length > 0) {
                        current_text.remove();
                    };

                    if(!that.textWidth) {
                        that.textWidth = 0;
                    }

                    var y_pos =  ((that.data[0].weight)/(that.pictograph_image_per_line));
                    var textHeight;

                    that.group1.append("text")
                        .attr({
                            "class": "PykCharts-current-text",
                            "font-family": that.pictograph_total_count_family,
                            "font-size": that.pictograph_total_count_size,
                            "font-weight": that.pictograph_total_count_weight,
                            "fill": that.pictograph_total_count_color
                        })
                        .text("/"+that.data[0].weight)
                        .text(function () {
                            that.textHeight =this.getBBox().height;
                            that.totalTxtWeight = this.getBBox().width;
                            return "/"+that.data[0].weight;
                        })
                        .attr({
                            "x": (that.textWidth+5),
                            "y": function () { return ((that.textHeight)-10); }
                        });
                }
                return this;
            },
            labelText: function () {
                if (PykCharts['boolean'](that.pictograph_current_count_enable)) {
                    var total_text = d3.selectAll(that.selector+" .PykCharts-total-text");
                    if (total_text.length > 0) {
                        total_text.remove();
                    };
                    var y_pos =  ((that.data[0].weight)/(that.pictograph_image_per_line));
                    var textHeight;
                    that.group1.append("text")
                        .attr({
                            "x": 0,
                            "class": "PykCharts-total-text",
                            "font-family": that.pictograph_current_count_family,
                            "font-size": that.pictograph_current_count_size,
                            "font-weight": that.pictograph_current_count_weight,
                            "fill": that.pictograph_current_count_color
                        })
                        .text(that.data[1].weight)
                        .text(function () {
                            that.textHeight = this.getBBox().height;
                            that.textWidth = this.getBBox().width;
                            return that.data[1].weight;
                        })
                        .attr("y", function () { return ((that.textHeight)-10); });
                }
                return this;
            },
            appendUnits: function () {

                if(!that.textHeight) {
                    that.textHeight = 0;
                }

                var unit_text_width, image_width,unit_text_width1,unit_text_height;
                that.group2.attr("transform","translate(0," + (that.textHeight + 15)+")");

                that.group2.append("text")
                        .attr({
                            "x": 0,
                            "class": "PykCharts-unit-text",
                            "font-family": that.pictograph_units_per_image_text_family,
                            "font-size": that.pictograph_units_per_image_text_size,
                            "font-weight": that.pictograph_units_per_image_text_weight,
                            "fill": that.pictograph_units_per_image_text_color
                        })
                        .text(function () {
                            return "1 ";
                        })
                        .text(function () {
                            unit_text_height = this.getBBox().height;
                            unit_text_width = this.getBBox().width;
                            return "1 ";
                        })
                        .attr({
                            "dy": 0,
                            "y": unit_text_height - 5
                        });

                that.group2.append("image")
                        .attr({
                            "xlink:href": that.data[1]["image"],
                            "id": "unit-image",
                            "x": unit_text_width + 2 + "px",
                            "y": 0,
                            "height": unit_text_height + "px",
                            "width": unit_text_height + "px"
                        });
                image_width = d3.select(that.selector +" #unit-image").attr("width");

                that.group2.append("text")
                        .attr({
                            "x": function () {
                                return parseFloat(image_width) + unit_text_width + 4;
                            },
                            "class": "PykCharts-unit-text",
                            "font-family": that.pictograph_units_per_image_text_family,
                            "font-size": that.pictograph_units_per_image_text_size,
                            "font-weight": that.pictograph_units_per_image_text_weight,
                            "fill": that.pictograph_units_per_image_text_color
                        })
                        .text(function () {
                            return "= " + that.pictograph_units_per_image;
                        })
                        .text(function () {
                            unit_text_width1 = this.getBBox().width;
                            return "= " + that.pictograph_units_per_image;
                        })
                        .attr("y", function () { return (unit_text_height - 5); });
                that.total_unit_width = unit_text_width + parseFloat(image_width) + unit_text_width1+4;
                return this;
            }
        }
        return optional;
    }
};

PykCharts.multiD = {};
var theme = new PykCharts.Configuration.Theme({});

PykCharts.multiD.configuration = function (options){
    var that = this;
    var fillColor = new PykCharts.Configuration.fillChart(options);
    var multiDConfig = {
        opacity : function (d,weight,data) {
            if(!(PykCharts['boolean'](options.variable_circle_size_enable))) {
                var z = d3.scale.linear()
                    .domain(d3.extent(data,function (d) {
                        return d.weight;
                    }))
                    .range([0.3,1]);
                return d ? z(d) : z(Math.min.apply(null, weight));
            }
            else {
                return 0.8;
            }
        },
        legendsPosition : function (options,type,params,color,index) {
            var j=0,legend,translate_x = 0;
             if(options.legends_display === "vertical" ) {
                options.legendsGroup.attr("height", (params.length * 30)+20);
                options.legendsGroup_height = 0;
                text_parameter1 = "x";
                text_parameter2 = "y";
                rect_parameter1 = "width";
                rect_parameter2 = "height";
                rect_parameter3 = "x";
                rect_parameter4 = "y";
                rect_parameter1value = 13;
                rect_parameter2value = 13;
                text_parameter1value = function (d,i) { return 36; };
                rect_parameter3value = function (d,i) { return 20; };
                var rect_parameter4value = function (d,i) { return i * 24 + 12;};
                var text_parameter2value = function (d,i) { return i * 24 + 23;};
            } else if(options.legends_display === "horizontal") {
                options.legendsGroup_height = 50;
                temp_i = j;
                final_rect_x = 0;
                final_text_x = 0;
                legend_text_widths = [];
                sum_text_widths = 0;
                temp_text = temp_rect = 0;
                text_parameter1 = "x";
                text_parameter2 = "y";
                rect_parameter1 = "width";
                rect_parameter2 = "height";
                rect_parameter3 = "x";
                rect_parameter4 = "y";
                var text_parameter1value = function (d,i) {
                    legend_text_widths[i] = this.getBBox().width;
                    legend_start_x = 16;
                    final_text_x = (i === 0) ? legend_start_x : (legend_start_x + temp_text);
                    temp_text = temp_text + legend_text_widths[i] + 30;
                    return final_text_x;
                };
                text_parameter2value = 30;
                rect_parameter1value = 13;
                rect_parameter2value = 13;
                var rect_parameter3value = function (d,i) {
                    final_rect_x = (i === 0) ? 0 : temp_rect;
                    temp_rect = temp_rect + legend_text_widths[i] + 30;
                    return final_rect_x;
                };
                rect_parameter4value = 18;
            }
            if (type === "scatter") {
                if(options.panels_enable === "yes"){
                    var legend_data =[];
                    legend_data.push(options.map_group_data[0][index]);
                    legend = options.legendsGroup.selectAll("rect")
                        .data(legend_data);
                    options.legends_text = options.legendsGroup.selectAll(".legends_text")
                        .data(legend_data);
                } else {
                    legend = options.legendsGroup.selectAll("rect")
                        .data(options.map_group_data[0]);
                    options.legends_text = options.legendsGroup.selectAll(".legends_text")
                        .data(options.map_group_data[0]);
                }
            } else {
                legend = options.legendsGroup.selectAll(".legends-rect")
                    .data(params);
                options.legends_text = options.legendsGroup.selectAll(".legends_text")
                    .data(params);
            }

            options.legends_text.enter()
                .append('text');
            options.legends_text.attr("class","legends_text")
                .attr("pointer-events","none")
                .text(function (d) {
                    switch (type) {
                        case "groupColumn" :
                        case "groupBar" :
                            return d;
                        case "spiderWeb" :
                        case "scatter" :
                            return d.group;
                        case "stackedArea" :
                            return d.name;
                    }
                })
                .attr("fill", options.legends_text_color)
                .attr("font-family", options.legends_text_family)
                .style("font-size",options.legends_text_size+"px")
                .attr("font-weight", options.legends_text_weight)
                .attr(text_parameter1, text_parameter1value)
                .attr(text_parameter2, text_parameter2value);

            legend.enter()
                .append("rect");

            legend.attr("class","legends-rect")
                .attr(rect_parameter1, rect_parameter1value)
                .attr(rect_parameter2, rect_parameter2value)
                .attr(rect_parameter3, rect_parameter3value)
                .attr(rect_parameter4, rect_parameter4value)
                .attr("fill", function (d,i) {
                    switch(type) {
                        case "groupColumn" :
                        case "groupBar" :
                            if(options.color_mode === "color")
                                return color[i];
                            else return options.saturation_color;
                        case "spiderWeb" :
                        case "scatter" :
                            return options.fillChart.colorPieW(d);
                        case "stackedArea" :
                            return options.fillColor.colorPieMS(d,options.type);
                    }
                })
                .attr("fill-opacity", function (d,i) {
                    switch(type) {
                        case "groupColumn" :
                        case "groupBar" :
                            if (options.color_mode === "saturation") {
                                return (i+1)/options.no_of_groups;
                            }
                            break;
                        case "spiderWeb" :
                            return 0.6;
                        case "scatter" :
                            return 1;
                        case "stackedArea" :
                            if(options.color_mode === "saturation") {
                             return (i+1)/options.new_data.length;
                            }
                    }
                });

            var legend_container_width = options.legendsGroup.node().getBBox().width,translate_x;
            options.legendsGroup_width = (options.legends_display === "vertical") ? legend_container_width + 20 : 0;
            if (type === "scatter") {
                translate_x = (options.legends_display === "vertical") ? (options.w - options.legendsGroup_width) : ((!PykCharts['boolean'](options.panels_enable)) ? (options.chart_width - legend_container_width - 20) : options.chart_margin_left);
            } else {
                translate_x = (options.legends_display === "vertical") ? (options.chart_width - options.legendsGroup_width) : (options.chart_width - legend_container_width - 20);
            }
            if (legend_container_width < options.chart_width) {
                options.legendsGroup.attr("transform","translate("+translate_x+",10)");
            }
            options.legendsGroup.style("visibility","visible");
            options.legends_text.exit().remove();
            legend.exit().remove();
        },
        mapGroup : function (data,type) {
            var newarr = [],
                unique = {},
                group_arr = [],
                uniq_group_arr = [],
                uniq_group_obj = {},
                new_arr = [],
                k = 0,
                checkGroup = true,
                checkColor = true;
            for (var i=0 ; i<data.length ; i++) {
                group_arr[i] = data[i]['group'];
            }
            uniq_group_arr = options.k.__proto__._unique(group_arr);
            for (var i=0 ; i<uniq_group_arr.length ; i++) {
                uniq_group_obj[uniq_group_arr[i]] = [];
            }
            for (var key in uniq_group_obj) {
                for (var j=0 ; j<data.length ; j++) {
                    if (key === data[j]['group']) {
                        uniq_group_obj[key].push(data[j]);
                    }
                }
            }
            for (var key in uniq_group_obj) {
                for (var i=0 ; i<uniq_group_obj[key].length ; i++) {
                    new_arr.push(uniq_group_obj[key][i]);
                }
            }
            data = new_arr;
            data.forEach(function (item) {
                if(item.group) {
                    checkGroup = true;
                } else {
                    checkGroup = false;
                    if(options.chart_color) {
                        checkGroup = false;
                        item.color = options.chart_color[0];
                    } else if(item.color) {
                        checkColor = false;
                        item.color = item.color;
                    } else{
                        checkColor = false;
                        item.color = options.default_color[0];
                    }
                }
            });
            i = 0
            if(checkGroup) {
                data.forEach(function(item) {
                    if (!unique[item.group] && item.color) {
                        unique[item.group] = item;
                        if(options.chart_color.length !== 0 && PykCharts['boolean'](options.chart_color[k])) {
                            item.color = options.chart_color[k];
                        } else if(item.color) {
                            item.color = item.color;
                        } else {
                            item.color = options.default_color;
                        }
                        if(i<data.length-2 && item.group !== data[i+1].group) {
                            k++;
                        }
                        newarr.push(item);
                    } else {
                        if(i < data.length-2 && item.group !== data[i+1].group) {
                            k++;
                        }
                    }
                    i++;
                });
                k=0;i=0;
                data.forEach(function(item) {
                    if(!unique[item.group]) {
                        unique[item.group] = item;
                        if(options.chart_color.length !== 0 && PykCharts['boolean'](options.chart_color[k])) {
                            item.color = options.chart_color[k];
                        } else {
                            item.color = options.default_color;
                        }
                        if(i<data.length-2 &&item.group !== data[i+1].group) {
                            k++;
                        }
                        newarr.push(item);
                    } else {
                        if(i<data.length-2 && item.group !== data[i+1].group) {
                            k++;
                        }
                    }
                    i++;
                })

                var arr = [];
                var uniqueColor = {};
                k = 0;
                newarr.forEach(function(item) {
                    arr.push(item);
                });
                var arr_length = arr.length,
                data_length = data.length;
                for(var i = 0;i < arr_length; i++) {
                    for(var j = 0;j<data_length;j++) {
                        if(data[j].group === arr[i].group) {
                            data[j].color = arr[i].color;
                        }
                    }
                }
                return [arr,checkGroup];
            } else {
                return [data,checkGroup];
            }
        }

    };
    return multiDConfig;
};

PykCharts.multiD.bubbleSizeCalculation = function (options,data,rad_range) {
    var size = function (d) {
        if(d && PykCharts['boolean'](options.variable_circle_size_enable)) {
            var z = d3.scale.linear()
                        .domain(d3.extent(data,function (d) {
                            return d.weight;
                        }))
                        .range(rad_range);
            return z(d);
        } else {
            return options.bubbleRadius;
        }
    };
    return size;
};

PykCharts.multiD.sortDataByGroup = function (data) {
    data.sort(function(a,b) {
        if (a.group < b.group) {
            return -1;
        }
        else if (a.group > b.group) {
            return 1;
        }
    });
    return data;
}


PykCharts.annotation = function (options) {
    options.k.annotation = function (svg,data,xScale,yScale) {
        var legendsGroup_height = (options.legendsGroup_height) ? options.legendsGroup_height: 0;

        if(options.annotation_view_mode === "onclick") {
            var annotation_circle = d3.select(svg).selectAll(".PykCharts-annotation-circle")
                .data(data);
            var annotation_text = d3.select(svg).selectAll(".PykCharts-annotation-text")
                .data(data);

            annotation_circle.enter()
                .append("circle")
                .attr("class","PykCharts-annotation-circle");

            annotation_circle
                .attr("r",0);
            setTimeout(function () {
                annotation_circle
                    .attr("cx",function (d,i) {
                        return (parseInt(xScale(d.x))+options.extra_left_margin+options.chart_margin_left);
                    })
                    .attr("cy", function (d,i) {
                        return (parseInt(yScale(d.y))-15+options.chart_margin_top+legendsGroup_height);
                    })
                    .attr("r", "7")
                    .style("cursor","pointer")
                    .on("click",function (d,i) {
                        d3.selectAll(".pyk-tooltip")
                            .style("display","none");
                        options.mouseEvent.tooltipPosition(d);
                        options.mouseEvent.tooltipTextShow(d.annotation);
                    })
                    .on("mouseover", function (d) {
                        options.mouseEvent.tooltipHide(d,options.panels_enable,"multilineChart")
                    })
                    .attr("fill",options.annotation_background_color)
            },options.transitions.duration());

            annotation_circle.exit().remove();
        } else if(options.annotation_view_mode === "onload") {
            var w = [],h=[];
            var annotation_rect = d3.select(svg).selectAll(".annotation-rect")
                .data(data)

            annotation_rect.enter()
                .append("rect")
                .attr("class","annotation-rect");

            var annotation_text = d3.select(svg).selectAll(".annotation-text")
                .data(data)

            annotation_text.enter()
                .append("text")
                .attr("class","annotation-text");
            annotation_text
                .text(function (d) {
                    return "";
                });
            annotation_rect
                .attr("width",0)
                .attr("height",0);
            setTimeout(function () {
                annotation_text.attr("x",function (d) {
                        return parseInt(xScale(d.x)-(5))+options.extra_left_margin+options.chart_margin_left;
                    })
                    .attr("y", function (d) {
                        return parseInt(yScale(d.y)-18+options.chart_margin_top+legendsGroup_height);
                    })
                    .attr("text-anchor","middle")
                    .style("font-size","12px")
                    .text(function (d) {
                        return d.annotation;
                    })
                    .text(function (d,i) {
                        w[i] = this.getBBox().width + 20;
                        h[i] = this.getBBox().height + 10;
                        return d.annotation;
                    })
                    .attr("fill",options.annotation_font_color)
                    .style("pointer-events","none");

                annotation_rect.attr("x",function (d,i) {
                        return (parseInt(xScale(d.x)-(5))+options.extra_left_margin+options.chart_margin_left) - (w[i]/2);
                    })
                    .attr("y", function (d,i) {
                        return (parseInt(yScale(d.y)-10+options.chart_margin_top)+legendsGroup_height) - h[i];
                    })
                    .attr("width",function (d,i) { return w[i]; })
                    .attr("height",function (d,i) { return h[i]; })
                    .attr("fill",options.annotation_background_color)
                    .style("pointer-events","none");
            },options.transitions.duration());
            annotation_text.exit()
                .remove();
            annotation_rect.exit()
                .remove();
        }

        return this;
    }
}
PykCharts.crossHair = function (options) {
    options.k.crossHair= function (svg,len,data,fill,type) {
        if(PykCharts['boolean'](options.crosshair_enable) && options.mode === "default") {

            PykCharts.Configuration.cross_hair_v = svg.append("line")
                .attr({
                    "class" : "line-cursor",
                    "id" : "cross-hair-v"
                });

            PykCharts.Configuration.cross_hair_h = svg.append("line")
                .attr({
                    "class" : "line-cursor",
                    "id" : "cross-hair-h"
                })
                .style("display","none");

            for (j=0; j<len; j++) {
                PykCharts.Configuration.focus_circle = svg.append("g")
                    .attr({
                        "class" : "focus",
                        "id" : "f_circle"+j
                    })
                    .style("display","none");

                PykCharts.Configuration.focus_circle.append("circle")
                    .attr({
                        "fill" : function (d) {
                            return fill.colorPieMS(data[j],type);
                        },
                        "id" : "focus-circle"+j,
                        "r" : "6"
                    });
            }
        }
        return this;
    }

}
//     };
//     return configuration1;
// };
PykCharts.grid = function (options) {
    options.k.yGrid =  function (svg, gsvg, yScale,legendsGroup_width) {
        var width = options.chart_width,
            height = options.chart_height;
        if(PykCharts['boolean'](options.chart_grid_y_enable)) {
            var ygrid = PykCharts.Configuration.makeYGrid(options,yScale,legendsGroup_width);
            gsvg.selectAll(options.selector + " g.y.grid-line")
                .style("stroke",function () { return options.chart_grid_color; })
                .call(ygrid);
        }
        return this;
    },
    options.k.xGrid = function (svg, gsvg, xScale,legendsGroup_height) {
        var width = options.chart_width,
            height = options.chart_height;

        if(PykCharts['boolean'](options.chart_grid_x_enable)) {
            var xgrid = PykCharts.Configuration.makeXGrid(options,xScale,legendsGroup_height);
            gsvg.selectAll(options.selector + " g.x.grid-line")
                .style("stroke",function () { return options.chart_grid_color; })
                .call(xgrid);
        }
        return this;
    }
}
PykCharts.Configuration.makeXGrid = function(options,xScale,legendsGroup_height) {
    var that = this;
    if(!legendsGroup_height) {
        legendsGroup_height = 0;
    }
    var xgrid = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(options.axis_x_no_of_axis_value)
                    .tickFormat("")
                    .tickSize(options.chart_height - options.chart_margin_top - options.chart_margin_bottom - legendsGroup_height)
                    .outerTickSize(0);

    d3.selectAll(options.selector + " .x.axis .tick text")
                    .attr("font-size",options.axis_x_pointer_size + "px")
                    .style({
                        "font-weight" : options.axis_x_pointer_weight,
                        "font-family" : options.axis_x_pointer_family
                    });

    return xgrid;
};

configuration.makeYGrid = function(options,yScale,legendsGroup_width) {
    var that = this, size;
    if(!legendsGroup_width) {
        legendsGroup_width = 0;
    }

    if(PykCharts['boolean'](options.panels_enable)) {
        size = options.w - options.chart_margin_left - options.chart_margin_right - legendsGroup_width;
    } else {
        size = options.chart_width - options.chart_margin_left - options.chart_margin_right - legendsGroup_width;
    }
    var ygrid = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(options.axis_y_no_of_axis_value)
                    .tickSize(-size)
                    .tickFormat("")
                    .outerTickSize(0);

    d3.selectAll(options.selector + " .y.axis .tick text")
                    .attr("font-size",options.axis_y_pointer_size + "px")
                    .style({
                        "font-weight" : options.axis_y_pointer_weight,
                        "font-family" : options.axis_y_pointer_family
                    });


    return ygrid;
};
PykCharts.scaleFunction = function (options) {
    var isNumber = options.k.__proto__._isNumber;
    options.k.scaleIdentification = function (type,data,range,x) {
        var scale;
        switch (type) {
            case "ordinal" :
                scale = d3.scale.ordinal()
                    .domain(data)
                    .rangeRoundBands(range, x);
                return scale;

            case "linear" :
                scale = d3.scale.linear()
                    .domain(data)
                    .range(range);
                return scale;

            case "time" :
                scale = d3.time.scale()
                    .domain(data)
                    .range(range);
                return scale;
        }
    }
    options.k.ordinalXAxisTickFormat = function (domain,extra) {
        var a = d3.selectAll(options.selector + " g.x.axis .tick text")[0],
            len = a.length, comp, flag, largest = 0, rangeband = (extra*2);
        for(var i = 0; i < len; i++) {
            largest = (a[i].getBBox().width > largest) ? a[i].getBBox().width: largest;
        }
        if (rangeband >= (largest+10)) { flag = 1; }
        else if (rangeband >= (largest*0.75) && rangeband < largest) { flag = 2; }
        else if (rangeband >= (largest*0.65) && rangeband < (largest*0.75)) { flag = 3; }
        else if (rangeband >= (largest*0.55) && rangeband < (largest*0.65)) { flag = 4; }
        else if (rangeband >= (largest*0.35) && rangeband < (largest*0.55)) { flag = 5; }
        else if (rangeband <= 20 || rangeband < (largest*0.35)) { flag = 0; }

        for(var i=0; i<len; i++) {
            comp = a[i].__data__;
            if (flag === 0) {
                comp = "";
                d3.selectAll(options.selector + " .x.axis .tick").remove();
            }
            else if (rangeband >= (a[i].getBBox().width+10) && flag === 1) {}
            else if (rangeband >= (a[i].getBBox().width*0.75) && rangeband < a[i].getBBox().width && flag === 2){
                comp = comp.substr(0,5) + "..";
            }
            else if (rangeband >= (a[i].getBBox().width*0.65) && rangeband < (a[i].getBBox().width*0.75) && flag === 3){
                comp = comp.substr(0,4) + "..";
            }
            else if (flag === 4){
                comp = comp.substr(0,3);
            }
            else if (flag === 5){
                comp = comp.substr(0,2);
            }
            d3.select(a[i]).text(comp);
        }

        xaxistooltip = d3.selectAll(options.selector + " g.x.axis .tick text")
            .data(domain);

        if(options.mode === "default") {
            xaxistooltip.on('mouseover',function (d) {
                options.mouseEvent.tooltipPosition(d);
                options.mouseEvent.tooltipTextShow(d);
            })
            .on('mousemove', function (d) {
                options.mouseEvent.tooltipPosition(d);
                options.mouseEvent.tooltipTextShow(d);
            })
            .on('mouseout', function (d) {
                options.mouseEvent.tooltipHide(d);
            });
        }

        return this;
    }
    options.k.ordinalYAxisTickFormat = function (domain) {
        var a = d3.selectAll(options.selector + " g.y.axis .tick text")[0];
        var len = a.length,comp;
        for(i=0; i<len; i++) {
            comp = a[i].textContent;
            if(a[i].getBBox().width > (options.chart_margin_left * 0.9)) {
                comp = comp.substr(0,3) + "..";
            }

            d3.select(a[i]).text(comp);
        }
        yaxistooltip = d3.selectAll(options.selector + " g.y.axis .tick text")
            .data(domain);
        if (options.mode === "default") {
            yaxistooltip.on('mouseover',function (d) {
                options.mouseEvent.tooltipPosition(d);
                options.mouseEvent.tooltipTextShow(d);
            })
            .on('mousemove', function (d) {
                options.mouseEvent.tooltipPosition(d);
                options.mouseEvent.tooltipTextShow(d);
            })
            .on('mouseout', function (d) {
                options.mouseEvent.tooltipHide(d);
            });
       }
        return this;
    }
    options.k.xAxis =  function (svg, gsvg, xScale,extra,domain,tick_values,legendsGroup_height,type,that) {
        if(PykCharts['boolean'](options.axis_x_enable)) {
            var width = options.chart_width,
                height = options.chart_height,
                e = extra;

            if(legendsGroup_height === undefined) {
                legendsGroup_height = 0;
            }
            d3.selectAll(options.selector + " .x.axis").attr("fill",function () {
                if (that && that.axis_x_pointer_color != undefined && that.axis_x_pointer_color != "") {
                    return that.axis_x_pointer_color;
                }
                else {
                    return options.axis_x_pointer_color;
                }
            });
            if(options.axis_x_position === "bottom") {
                gsvg.attr("transform", "translate(0," + (options.chart_height - options.chart_margin_top - options.chart_margin_bottom - legendsGroup_height) + ")");
            }

            var xaxis = PykCharts.Configuration.makeXAxis(options,xScale);

            if(tick_values && tick_values.length) {
                xaxis.tickValues(tick_values);
            }

            gsvg.style("stroke",function () { return options.axis_x_line_color; })
                .call(xaxis)
            if((options.axis_x_data_format === "string") && options.panels_enable === "no") {
                options.k.ordinalXAxisTickFormat(domain,extra);
            }

            d3.selectAll(options.selector + " .x.axis .tick text")
                .attr("font-size",options.axis_x_pointer_size)
                .style({
                    "font-weight" : options.axis_x_pointer_weight,
                    "font-family" : options.axis_x_pointer_family
                });

            if(type && options.axis_x_data_format !== "string") {
                d3.selectAll(options.selector + " .x.axis .domain").remove();
            }
        }

        return this;
    }
    options.k.yAxis = function (svg, gsvg, yScale,domain,tick_values,legendsGroup_width, type,  tick_format_function, that) {
        if(PykCharts['boolean'](options.axis_y_enable)){
            if(!legendsGroup_width) {
                legendsGroup_width = 0;
            }
            var width = options.chart_width,
                height = options.chart_height,
                w = PykCharts['boolean'](options.panels_enable) ? options.w : options.chart_width;

            if(options.axis_y_position === "right") {
                gsvg.attr("transform", "translate(" + (w - options.chart_margin_left - options.chart_margin_right - legendsGroup_width) + ",0)");
            }
            d3.selectAll(options.selector + " .y.axis").attr("fill",function () {
                if (that && that.axis_y_pointer_color != undefined && that.axis_y_pointer_color != "") {
                    return that.axis_y_pointer_color;
                }
                else {
                    return options.axis_y_pointer_color;
                }
            });
            var yaxis = PykCharts.Configuration.makeYAxis(options,yScale,tick_format_function);

            if(tick_values && tick_values.length) {
                yaxis.tickValues(tick_values);
            }

            var mouseEvent = new PykCharts.Configuration.mouseEvent(options);
            gsvg.style("stroke",function () { return options.axis_y_line_color; })
                .call(yaxis);

            if((options.axis_y_data_format === "string") && options.panels_enable === "no") {
                options.k.ordinalYAxisTickFormat(domain);
            }

            d3.selectAll(options.selector + " .y.axis .tick text")
                    .attr("font-size",options.axis_y_pointer_size)
                    .style({
                        "font-weight" : options.axis_y_pointer_weight,
                        "font-family" : options.axis_y_pointer_family
                    });

            if(type && options.axis_y_data_format !== "string") {
                d3.selectAll(options.selector + " .y.axis .domain").remove();
            }
        }
        return this;
    }
    options.k.xAxisTitle = function (gsvg,legendsGroup_height,legendsGroup_width) {
        if(options.axis_x_title) {
            var w = PykCharts['boolean'](options.panels_enable) ? options.w : options.chart_width,
            position;
            if(!legendsGroup_height) {
                legendsGroup_height = 0;
            }
            if(!legendsGroup_width) {
                legendsGroup_width = 0;
            }

            if(!PykCharts['boolean'](options.axis_x_enable)) {
                gsvg.attr("transform", "translate(0," + (options.chart_height - options.chart_margin_top - options.chart_margin_bottom - legendsGroup_height) + ")");
            }

            if(options.axis_x_position === "bottom") {
                position = options.chart_margin_bottom;
            } else if (options.axis_x_position === "top") {
                position = - options.chart_margin_top + options.axis_x_title_size;
            }
             gsvg.append("text")
                .attr({
                    "class" : "x-axis-title",
                    "x" : (w - options.chart_margin_left - options.chart_margin_right -legendsGroup_width)/2,
                    "y" : position
                })
                .style({
                    'text-anchor':'middle',"fill":options.axis_x_title_color,
                    'font-weight':options.axis_x_title_weight,
                    'font-size':options.axis_x_title_size
                })
                .text(options.axis_x_title);
        }
        return this;
    }
    options.k.yAxisTitle = function (gsvg) {
        if(options.axis_y_title) {
            var w = PykCharts['boolean'](options.panels_enable) ? options.w : options.chart_width,
            position,dy;
            if(options.axis_y_position === "left") {
                position = -(options.chart_margin_left - options.axis_y_title_size);
                dy = 0;
            } else if (options.axis_y_position === "right") {
                position = (options.chart_margin_right - options.axis_y_title_size);
                dy = "0.71em";
            }
            gsvg.append("text")
                .attr({
                    "class" : "y-axis-title",
                    "x" : -((options.chart_height - options.chart_margin_bottom - options.chart_margin_top)/2),
                    "transform" : "rotate(-90)",
                    "y" : position,
                    "dy" : dy
                })
                .style({
                    "fill":options.axis_y_title_color,
                    "font-weight":options.axis_y_title_weight,
                    "font-family":options.axis_y_title_family,
                    "font-size":options.axis_y_title_size,
                    "text-anchor":"middle"
                })
                .text(options.axis_y_title);
        }
        return this;
    }
    options.k.isOrdinal = function(svg,container,scale,domain,extra) {
        if(container === ".x.axis" && PykCharts['boolean'](options.axis_x_enable)) {
            svg.select(container).call(PykCharts.Configuration.makeXAxis(options,scale));
            if((options.axis_x_data_format === "string") && options.panels_enable === "no") {
                options.k.ordinalXAxisTickFormat(domain,extra);
            }
        }
        else if (container === ".x.grid") {
            svg.select(container).call(PykCharts.Configuration.makeXGrid(options,scale));
        }
        else if (container === ".y.axis" && PykCharts['boolean'](options.axis_y_enable)) {
            svg.select(container).call(PykCharts.Configuration.makeYAxis(options,scale));
            if((options.axis_y_data_format === "string") && options.panels_enable === "no") {
                options.k.ordinalyAxisTickFormat(domain);
            }
        }
        else if (container === ".y.grid") {
            svg.select(container).call(PykCharts.Configuration.makeYGrid(options,scale));
        }
        return this;
    }
    options.k.xAxisDataFormatIdentification = function (data){
        if(isNumber(data[0].x) || !(isNaN(data[0].x))){
            return "number";
        } else if(!(isNaN(new Date(data[0].x).getTime()))) {
            return "time";
        } else {
            return "string";
        }
    }
    options.k.yAxisDataFormatIdentification = function (data) {
        if(isNumber(data[0].y) || !(isNaN(data[0].y))){
            return "number";
        } else if(!(isNaN(new Date(data[0].y).getTime()))) {
            return "time";
        } else {
            return "string";
        }
    }
    options.k.processXAxisTickValues = function () {
        var values = [], newVal = [];
        var length = options.axis_x_pointer_values.length;
        if(length) {
            for(var i = 0 ; i < length ; i++) {
                if(options.axis_x_data_format === "number") {
                    if((isNumber(options.axis_x_pointer_values[i]) || !(isNaN(options.axis_x_pointer_values[i]))) && options.axis_x_pointer_values[i]!=""){

                        values.push(parseFloat(options.axis_x_pointer_values[i]))
                    }
                } else if(options.axis_x_data_format === "time") {
                    if(!(isNaN(new Date(options.axis_x_pointer_values[i]).getTime()))) {
                        values.push(options.axis_x_pointer_values[i])
                    }
                }
            }
        }
        if(values.length) {
            var len = values.length
            if(options.axis_x_data_format === "time") {
                for(var i=0 ; i<len; i++) {
                    newVal.push(options.k.dateConversion(values[i]));
                }
            } else {
                newVal = values;
            }
        }

        return newVal;
    }
    options.k.processYAxisTickValues = function () {
        var length = options.axis_y_pointer_values.length;
        var values = [];
        if(length) {
            for(var i = 0 ; i < length ; i++) {
                if(options.axis_y_data_format === "number") {
                    if((isNumber(options.axis_y_pointer_values[i]) || !(isNaN(options.axis_y_pointer_values[i]))) && options.axis_y_pointer_values[i]!=""){
                        values.push(options.axis_y_pointer_values[i])
                    }
                }
            }
        }
        return values;
    }
}
var configuration = PykCharts.Configuration;
configuration.makeXAxis = function(options,xScale) {
    var that = this;
    var k = PykCharts.Configuration(options);
    var xaxis = d3.svg.axis()
                    .scale(xScale)
                    .tickSize(options.axis_x_pointer_length)
                    .outerTickSize(options.axis_x_outer_pointer_length)
                    .tickFormat(function (d,i) {
                        if(options.panels_enable === "yes" && options.axis_x_data_format === "string") {
                            return d.substr(0,2);
                        }
                        else {
                            return d;
                        }
                    })
                    .tickPadding(options.axis_x_pointer_padding)
                    .orient(options.axis_x_pointer_position);

    d3.selectAll(options.selector + " .x.axis .tick text")
            .attr("font-size",options.axis_x_pointer_size +"px")
            .style({
                "font-weight" : options.axis_x_pointer_weight,
                "font-family" : options.axis_x_pointer_family
            });

    if(options.axis_x_data_format=== "time" && PykCharts['boolean'](options.axis_x_time_value_datatype)) {
        switch (options.axis_x_time_value_datatype) {
            case "month" :
                a = d3.time.month;
                b = "%b";
                break;

            case "date" :
                a = d3.time.day;
                b = "%d";
                break;

            case "year" :
                a = d3.time.year;
                b = "%Y";
                break;

            case "hours" :
                a = d3.time.hour;
                b = "%H";
                break;

            case "minutes" :
                a = d3.time.minute;
                b = "%M";
                break;
        }
        xaxis.ticks(a,options.axis_x_time_value_interval)
            .tickFormat(d3.time.format(b));

    } else if(options.axis_x_data_format === "number") {
        xaxis.ticks(options.axis_x_no_of_axis_value);
    }

    return xaxis;
};

configuration.makeYAxis = function(options,yScale,tick_format_function) {
    var that = this;
    var k = PykCharts.Configuration(options);
    var yaxis = d3.svg.axis()
                    .scale(yScale)
                    .orient(options.axis_y_pointer_position)
                    .tickSize(options.axis_y_pointer_length)
                    .outerTickSize(options.axis_y_outer_pointer_length)
                    .tickPadding(options.axis_y_pointer_padding)
                    .tickFormat(function (d,i) {
                        if(tick_format_function) {
                            return tick_format_function(d);
                        } else {
                            return d;
                        }
                    });

    d3.selectAll(options.selector + " .y.axis .tick text")
                .attr("font-size",options.axis_y_pointer_size +"px")
                .style({
                    "font-weight" : options.axis_y_pointer_weight,
                    "font-family" : options.axis_y_pointer_family
                });

    /*if(options.axis_y_data_format=== "time" && PykCharts['boolean'](options.axis_y_time_value_type)) {
        switch (options.axis_y_time_value_datatype) {
            case "month" :
                a = d3.time.month;
                b = "%b";
                break;

            case "date" :
                a = d3.time.day;
                b = "%d";
                break;

            case "year" :
                a = d3.time.year;
                b = "%Y";
                break;

            case "hours" :
                a = d3.time.hour;
                b = "%H";
                break;

            case "minutes" :
                a = d3.time.minute;
                b = "%M";
                break;
        }
        xaxis.ticks(a,options.axis_y_time_value_unit)
            .tickFormat(d3.time.format(b));

    }else */if(options.axis_y_data_format === "number"){
        yaxis.ticks(options.axis_y_no_of_axis_value);
    }
    return yaxis;
};

PykCharts.crossHairMovement = function (options) {
    var that = this;
    var mouseEvent = PykCharts.Configuration.mouseEvent(options);
    that.tooltip = configuration.tooltipp;
    that.cross_hair_v = configuration.cross_hair_v;
    that.cross_hair_h = configuration.cross_hair_h;
    that.focus_circle = configuration.focus_circle;
    that.pt_circle = configuration.pt_circle;
    that.start_pt_circle = configuration.start_pt_circle;
    mouseEvent.crossHairPosition = function(new_data,xScale,yScale,dataLineGroup,lineMargin,domain,type,tooltipMode,panels_enable,container_id,no_of_panel_in_row){
        if((PykCharts['boolean'](options.crosshair_enable) || PykCharts['boolean'](options.tooltip_enable) || PykCharts['boolean'](options.axis_onhover_highlight_enable))  && options.mode === "default") {
            var offset =  options.k.__proto__._offset;
            var selectSVG = document.querySelector(options.selector + " #"+dataLineGroup[0][0][0].parentNode.parentNode.id),
                width_percentage = 0,
                height_percentage = 0;
            if (!PykCharts['boolean'](panels_enable)) {
                width_percentage = parseFloat(d3.select(selectSVG).style("width")) / options.chart_width;
                height_percentage = parseFloat(d3.select(selectSVG).style("height")) / options.chart_height;
            } else {
                width_percentage = 1;
                height_percentge = 1;
            }
            var legendsGroup_height = options.legendsGroup_height ? options.legendsGroup_height: 0,
                offsetLeft =  ((options.chart_margin_left + lineMargin) * width_percentage) + offset(selectSVG).left,
                offsetTop = offset(selectSVG).top,
                number_of_lines = new_data.length,
                left = options.chart_margin_left,
                right = options.chart_margin_right,
                top = options.chart_margin_top,
                bottom = options.chart_margin_bottom,
                w = options.chart_width,
                h = options.chart_height,
                group_index = parseInt(PykCharts.getEvent().target.id.substr((PykCharts.getEvent().target.id.length-1),1)),
                c = b - a,
                x = PykCharts.getEvent().pageX  - offsetLeft,
                y = PykCharts.getEvent().pageY - offsetTop - top,
                x_range = [];
            if(options.axis_x_data_format==="string") {
                x_range = xScale.range();
            } else {
                temp = xScale.range();
                pad = (temp[1]-temp[0])/(new_data[0].data.length-1);
                len = new_data[0].data.length;
                strt = 0;
                for(i = 0;i<len;i++){
                    x_range[i] = strt;
                    strt = strt + pad;
                }
            }
            var y_range = yScale.range(),
                y_range_length = y_range.length;
            var j,tooltpText,active_x_tick,active_y_tick = [],left_diff,right_diff,
                pos_line_cursor_x,pos_line_cursor_y = [],right_tick,left_tick,
                range_length = x_range.length,colspan,top_tick;
            for(j = 0;j < range_length;j++) {
                if((j+1) >= range_length) {
                    return false;
                }
                else {
                    if((right_tick === x_range[j] && left_tick === x_range[j+1]) && (top_tick === y_range[0])) {
                        return false;
                    }
                    else if((x >= (width_percentage*x_range[j]) && x <= width_percentage*x_range[j+1]) && (y < (y_range[0] + legendsGroup_height))) {
                        left_tick = width_percentage*x_range[j], right_tick = width_percentage*x_range[j+1];
                        top_tick = y_range[0];
                        left_diff = (left_tick - x), right_diff = (x - right_tick);
                        if(left_diff >= right_diff) {
                            active_x_tick = new_data[0].data[j].x;
                            active_y_tick.push(new_data[0].data[j].y);
                            tooltipText = new_data[0].data[j].tooltip || new_data[0].data[j].y;
                        }
                        else {
                            active_x_tick = new_data[0].data[j+1].x;
                            active_y_tick.push(new_data[0].data[j+1].y);
                            tooltipText = new_data[0].data[j+1].tooltip || new_data[0].data[j+1].y; // Line Chart ONLY!
                        }
                        pos_line_cursor_x = (xScale(active_x_tick) + lineMargin + left);
                        pos_line_cursor_y = (yScale(tooltipText) + top);
                        switch(type) {
                            case "multi_series_line" :
                                var test = [];
                                d3.selectAll(options.selector+" #pyk-tooltip").classed({"pyk-tooltip":false,"pyk-multiline-tooltip":true,"pyk-tooltip-table":true});
                                var len_data = new_data[0].data.length,tt_row=""; // Assumption -- number of Data points in different groups will always be equal
                                active_y_tick = [];
                                for(var a=0;a < number_of_lines;a++) {
                                    for(var b=0;b < len_data;b++) {
                                        if(options.axis_x_data_format === "time") {
                                            cond = Date.parse(active_x_tick) === Date.parse(new_data[a].data[b].x);
                                        } else {
                                            cond = new_data[a].data[b].x === active_x_tick;
                                        }
                                        if(cond) {
                                            active_y_tick.push(new_data[a].data[b].y);
                                            test.push(yScale(new_data[a].data[b].y) + top);
                                            tt_row += "<tr><td>"+new_data[a].name+"</td><td><b>"+ (new_data[a].data[b].tooltip || new_data[a].data[b].y) +"</b></td></tr>";
                                        }
                                    }
                                }

                                pos_line_cursor_x += 6;
                                tooltipText = "<table><thead><th colspan='2'>"+active_x_tick+"</th></thead><tbody>"+tt_row+"</tbody></table>";
                                if(PykCharts['boolean'](options.tooltip_enable)) {
                                    this.tooltipPosition(tooltipText,pos_line_cursor_x,(y),60,-15,group_index,width_percentage,height_percentage,type);
                                    this.tooltipTextShow(tooltipText);
                                }
                                (options.crosshair_enable) ? this.crossHairShowMultipleline(pos_line_cursor_x,top,pos_line_cursor_x,(h - bottom),pos_line_cursor_x,test,new_data): null;
                            break;
                            case "panels_of_line":
                                pos_line_cursor_x += 5;
                                var len_data = new_data[0].data.length,
                                    multiply_value = h,
                                    multiply_by = 0,
                                    final_displacement = 0;
                                for(var a=0;a < number_of_lines;a++) {
                                    var div_offset = offset(document.querySelector(options.selector)),
                                        svg_offset = offset(document.querySelector(options.selector + " #"+container_id+"-"+a));

                                    var left_offset = svg_offset.left - div_offset.left;
                                    var top_offset = svg_offset.top - div_offset.top;
                                    for(var b=0;b < len_data;b++) {
                                        if(options.axis_x_data_format === "time") {
                                            cond = Date.parse(active_x_tick)===Date.parse(new_data[a].data[b].x);
                                        } else {
                                            cond = new_data[a].data[b].x === active_x_tick;
                                        }
                                        if(cond) {
                                            active_y_tick.push(new_data[a].data[b].y);
                                            tooltipText = (new_data[a].data[b].tooltip || new_data[a].data[b].y);
                                            if (a%no_of_panel_in_row == 0 && a != 0) {
                                            ++multiply_by;
                                            final_displacement = multiply_value * multiply_by;
                                            }
                                            pos_line_cursor_y = (yScale(new_data[a].data[b].y) + top);
                                            this.tooltipPosition(tooltipText,(pos_line_cursor_x+left_offset-15-30),(pos_line_cursor_y + final_displacement),-15,-15,a,width_percentage,height_percentage,type);
                                            this.tooltipTextShow(tooltipText,type,a);
                                            (options.crosshair_enable) ? this.crossHairShowPanelOfLine(pos_line_cursor_x,top,pos_line_cursor_x,(h - bottom),pos_line_cursor_x,pos_line_cursor_y,a,container_id): null;
                                        }
                                    }
                                }
                            break;
                            case "lineChart":
                            case "areaChart":
                                if(PykCharts['boolean'](options.tooltip_enable)) {
                                    if((options.tooltip_mode).toLowerCase() === "fixed") {
                                        this.tooltipPosition(tooltipText,-options.chart_margin_left,(pos_line_cursor_y),-14,23,group_index,width_percentage,height_percentage,type);
                                    } else if((options.tooltip_mode).toLowerCase() === "moving") {
                                        this.tooltipPosition(tooltipText,(pos_line_cursor_x-options.chart_margin_left + 10),(pos_line_cursor_y-5),0,-45,group_index,width_percentage,height_percentage,type);
                                    }
                                    this.tooltipTextShow(tooltipText);
                                }
                                (options.crosshair_enable) ? this.crossHairShowLineArea(pos_line_cursor_x,top,pos_line_cursor_x,(h - bottom),pos_line_cursor_x,pos_line_cursor_y): null;
                            break;
                            case "stackedAreaChart":
                                var test = [];
                                d3.selectAll(options.selector+" #pyk-tooltip").classed({"pyk-tooltip":false,"pyk-multiline-tooltip":true,"pyk-tooltip-table":true});
                                var len_data = new_data[0].data.length,tt_row=""; // Assumption -- number of Data points in different groups will always be equal
                                active_y_tick = [];
                                for(var a=0;a < number_of_lines;a++) {
                                    for(var b=0;b < len_data;b++) {
                                        if(options.axis_x_data_format === "time") {
                                            cond = Date.parse(active_x_tick)===Date.parse(new_data[a].data[b].x);
                                        } else {
                                            cond = new_data[a].data[b].x === active_x_tick;
                                        }
                                        if(cond) {
                                            active_y_tick.push(new_data[a].data[b].y);
                                            test.push(yScale(new_data[a].data[b].y+new_data[a].data[b].y0) + top + options.legendsGroup_height);
                                            tt_row += "<tr><td>"+new_data[a].name+"</td><td><b>"+ (new_data[a].data[b].tooltip || new_data[a].data[b].y) +"</b></td></tr>";
                                        }
                                    }
                                }
                                pos_line_cursor_x += 6;
                                tooltipText = "<table><thead><th colspan='2'>"+active_x_tick+"</th></thead><tbody>"+tt_row+"</tbody></table>";
                                if(PykCharts['boolean'](options.tooltip_enable)) {
                                    group_index = 1;
                                    this.tooltipPosition(tooltipText,pos_line_cursor_x,(y),60,70,group_index,width_percentage,height_percentage);
                                    this.tooltipTextShow(tooltipText);
                                }
                                (options.crosshair_enable) ? this.crossHairShowStackedArea(pos_line_cursor_x,top+legendsGroup_height,pos_line_cursor_x,(h - bottom),pos_line_cursor_x,test,new_data): null;
                            break;
                        }
                        if(!PykCharts['boolean'](panels_enable)) {
                            this.axisHighlightShow(active_y_tick,options.selector+" .y.axis",domain);
                            this.axisHighlightShow(active_x_tick,options.selector+" .x.axis",domain);
                        }
                    }
                }
            }
        }
    }
    mouseEvent.crossHairShowLineArea = function (x1,y1,x2,y2,cx,cy) {
        if(PykCharts['boolean'](options.crosshair_enable)) {
            d3.selectAll(options.selector+ " .line-cursor").style("display","block");
            d3.select(options.selector + " #cross-hair-v")
                .attr({
                    "x1" : x1,
                    "y1" : y1,
                    "x2" : x2,
                    "y2" : y2
                });
            d3.select(options.selector + " #cross-hair-h")
                .attr({
                    "x1" : options.chart_margin_left,
                    "y1" : cy,
                    "x2" : (options.chart_width - options.chart_margin_right),
                    "y2" : cy
                });
            that.focus_circle.style("display","block")
                .attr("transform", "translate(" + cx + "," + cy + ")");
        }
        return this;
    }
    mouseEvent.crossHairShowMultipleline = function (x1,y1,x2,y2,cx,cy,new_data) {
        if(PykCharts['boolean'](options.crosshair_enable)) {
            that.cross_hair_v.style("display","block");
            d3.select(options.selector + " #cross-hair-v")
                .attr({
                    "x1" : (x1 - 5),
                    "y1" : y1,
                    "x2" : (x2 - 5),
                    "y2" : y2
                });
            for(var j=0; j<new_data.length; j++) {
                d3.select(options.selector+" #f_circle"+j).style("display","block")
                    .attr("transform", "translate(" + (cx-3) + "," + cy[j] + ")");
            }
        }
        return this;
    }
    mouseEvent.crossHairShowPanelOfLine = function (x1,y1,x2,y2,cx,cy,group_index,container_id) {
        if(PykCharts['boolean'](options.crosshair_enable)) {
            d3.selectAll(options.selector+" .line-cursor").style("display","block");
            d3.selectAll(options.selector+" #cross-hair-v")
                .attr({
                    "x1" : (x1 - 5),
                    "y1" : y1,
                    "x2" : (x2 - 5),
                    "y2" : y2
                });
            d3.select(options.selector+" #"+container_id+"-"+group_index+" #cross-hair-h")
                .attr({
                    "x1" : options.chart_margin_left,
                    "y1" : cy,
                    "x2" : (options.w - options.chart_margin_right),
                    "y2" : cy
                });
            d3.select(options.selector+" #"+container_id+"-"+group_index+" .focus").style("display","block")
                .attr("transform", "translate(" + (cx - 5) + "," + cy + ")");
        }
        return this;
    }
    mouseEvent.crossHairShowStackedArea = function (x1,y1,x2,y2,cx,cy,new_data) {
        if(PykCharts['boolean'](options.crosshair_enable)) {
            d3.selectAll(options.selector+" .line-cursor").style("display","block");
            d3.selectAll(options.selector+" #cross-hair-v")
                .attr({
                    "x1" : (x1 - 5),
                    "y1" : y1,
                    "x2" : (x2 - 5),
                    "y2" : y2
                });
            for(var j=0; j<new_data.length; j++) {
                d3.select(options.selector+" #f_circle"+j).style("display","block")
                    .attr("transform", "translate(" + (cx-3) + "," + cy[j] + ")");
            }
        }
        return this;
    }
    mouseEvent.crossHairHide = function (type) {
        if(PykCharts['boolean'](options.crosshair_enable)) {
            that.cross_hair_v.style("display","none");
            if(type === "lineChart" || type === "areaChart") {
                that.cross_hair_h.style("display","none");
                that.focus_circle.style("display","none");
            } else if(type === "multilineChart" || type === "stackedAreaChart") {
                d3.selectAll(options.selector+" .line-cursor").style("display","none");
                d3.selectAll(options.selector+" .focus").style("display","none");
            }
        }
        return this;
    }
    mouseEvent.tooltipPosition = function (d,xPos,yPos,xDiff,yDiff,group_index,width_percentage,height_percentage,type) {
        if(PykCharts['boolean'](options.tooltip_enable) || PykCharts['boolean'](options.annotation_enable) || options.axis_x_data_format === "string" || options.axis_y_data_format === "string") {
            if(xPos !== undefined){
                var offset = options.k.__proto__._offset,
                    selector = options.selector.substr(1,options.selector.length),
                    selector_element = document.getElementById(selector),
                    width_tooltip = document.querySelector("#tooltip-svg-container-"+group_index +"-pyk-tooltip"+selector) ? parseFloat(d3.select("#tooltip-svg-container-"+group_index +"-pyk-tooltip"+selector).style("width")) : 0,
                    height_tooltip = document.querySelector("#tooltip-svg-container-"+group_index +"-pyk-tooltip"+selector) ? parseFloat(d3.select("#tooltip-svg-container-"+group_index +"-pyk-tooltip"+selector).style("height")) : 0,
                    tooltip = d3.select("#tooltip-svg-container-"+group_index +"-pyk-tooltip"+selector),
                    offset_left = offset(selector_element).left,
                    offset_top = offset(selector_element).top;

                if (type === "lineChart" || type === "areaChart") {
                    var place_tooltip_from_top = yPos * height_percentage;
                } else {
                    var place_tooltip_from_top = yPos - ((height_tooltip)/2) * height_percentage;
                }
                tooltip
                    .style({
                        "display": "block",
                        "top": place_tooltip_from_top + offset_top + "px",
                        "left": ((xPos + options.chart_margin_left) * width_percentage) + offset_left + "px"
                });
            } else {
                that.tooltip
                    .style({
                        "display" : "block",
                        "top" : (PykCharts.getEvent().pageY - 20) + "px",
                        "left" : (PykCharts.getEvent().pageX + 30) + "px"
                    });
            }
        return that.tooltip;
        }
    }
    mouseEvent.tooltipTextShow = function (d,type,group_index) {
        var selector = options.selector.substr(1,options.selector.length)
        if(PykCharts['boolean'](options.tooltip_enable) || PykCharts['boolean'](options.annotation_enable) || options.axis_x_data_format === "string" || options.axis_y_data_format === "string") {
            if(type === "panels_of_line") {
                d3.selectAll("#tooltip-svg-container-"+group_index +"-pyk-tooltip"+selector).html(d);
            } else {
                that.tooltip.html(d);
            }
            return this;
        }
    }
    mouseEvent.tooltipHide = function (d,panels_enable,type) {
        if(PykCharts['boolean'](options.tooltip_enable) || PykCharts['boolean'](options.annotation_enable) || options.axis_x_data_format === "string" || options.axis_y_data_format === "string") {
            if(panels_enable === "yes" && type === "multilineChart") {
                return d3.selectAll(".pyk-tooltip").style("display","none");
            }
            else {
                return that.tooltip.style("display", "none");
            }
        }
    }
    return mouseEvent;
}
PykCharts.multiD.line = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});

    this.execute = function (pykquery_data) {
        that = new PykCharts.validation.processInputs(that, options, 'multiDimensionalCharts');
        PykCharts.crossHair(that);
        PykCharts.annotation(that);
        PykCharts.scaleFunction(that);
        PykCharts.grid(that);
        if(that.stop) {
            return;
        }
        that.k.storeInitialDivHeight();

        if(that.mode === "default") {
            that.k.loading();
        }

        var multiDimensionalCharts = theme.multiDimensionalCharts,
            stylesheet = theme.stylesheet,
            optional = options.optional;

        that.pointer_overflow_enable = options.pointer_overflow_enable ? options.pointer_overflow_enable.toLowerCase() : stylesheet.pointer_overflow_enable;
        that.crosshair_enable = options.crosshair_enable ? options.crosshair_enable.toLowerCase() : multiDimensionalCharts.crosshair_enable;
        that.curvy_lines_enable = options.curvy_lines_enable ? options.curvy_lines_enable.toLowerCase() : multiDimensionalCharts.curvy_lines_enable;
        that.interpolate = PykCharts['boolean'](that.curvy_lines_enable) ? "cardinal" : "linear";
        that.panels_enable = "no";

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                // that.k.remove_loading_bar(id);
                return;
            }
            that.data = that.k.__proto__._groupBy("line",data);

            that.axis_y_data_format = "number";
            that.axis_x_data_format = that.k.xAxisDataFormatIdentification(that.data);
            if(that.axis_x_data_format === "time" && that.axis_x_time_value_datatype === "") {
                console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to have passed Date data so please pass the value for axis_x_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_"+"15");
            }

            if (that.axis_x_data_format === "string") {
                that.data_sort_enable = "no";
            }
            else {
                that.data_sort_enable = "yes";
                that.data_sort_type = (that.axis_x_data_format === "time") ? "date" : "numerically";
                that.data_sort_order = "ascending";
            }
            PykCharts.multiD.lineFunctions(options,that,"line");
        }
        if (PykCharts.boolean(that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };
};
PykCharts.multiD.multiSeriesLine = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});

    this.execute = function (pykquery_data){
        that = new PykCharts.validation.processInputs(that, options, 'multiDimensionalCharts');
        PykCharts.crossHair(that);
        PykCharts.annotation(that);
        PykCharts.scaleFunction(that);
        PykCharts.grid(that);
        if(that.stop) {
            return;
        }
        that.k.storeInitialDivHeight();

        if(that.mode === "default") {
            that.k.loading();
        }

        var multiDimensionalCharts = theme.multiDimensionalCharts,
            stylesheet = theme.stylesheet,
            optional = options.optional;

        that.pointer_overflow_enable = options.pointer_overflow_enable ? options.pointer_overflow_enable.toLowerCase() : stylesheet.pointer_overflow_enable;
        that.crosshair_enable = options.crosshair_enable ? options.crosshair_enable.toLowerCase() : multiDimensionalCharts.crosshair_enable;
        that.curvy_lines_enable = options.curvy_lines_enable ? options.curvy_lines_enable.toLowerCase() : multiDimensionalCharts.curvy_lines_enable;
        that.interpolate = PykCharts['boolean'](that.curvy_lines_enable) ? "cardinal" : "linear";
        that.panels_enable = "no";

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }
            that.data = that.k.__proto__._groupBy("line",data);
            that.axis_y_data_format = "number";
            that.axis_x_data_format = that.k.xAxisDataFormatIdentification(that.data);
            if(that.axis_x_data_format === "time" && that.axis_x_time_value_datatype === "") {
                console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to have passed Date data so please pass the value for axis_x_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_15");
            }

            if (that.axis_x_data_format === "string") {
                that.data_sort_enable = "no";
            }
            else {
                that.data_sort_enable = "yes";
                that.data_sort_type = (that.axis_x_data_format === "time") ? "date" : "numerically";
                that.data_sort_order = "ascending";
            }
            PykCharts.multiD.lineFunctions(options,that,"multi_series_line");
        };
        if (PykCharts.boolean(that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };
};
PykCharts.multiD.panelsOfLine = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});

    this.execute = function (pykquery_data){

        that = new PykCharts.validation.processInputs(that, options, 'multiDimensionalCharts');

        PykCharts.crossHair(that);
        PykCharts.annotation(that);
        PykCharts.scaleFunction(that);
        PykCharts.grid(that);

        if(that.stop) {
            return;
        }
        that.k.storeInitialDivHeight();
        if(that.mode === "default") {
            that.k.loading();
        }

        var multiDimensionalCharts = theme.multiDimensionalCharts,
            stylesheet = theme.stylesheet,
            optional = options.optional;

        that.pointer_overflow_enable = options.pointer_overflow_enable ? options.pointer_overflow_enable.toLowerCase() : stylesheet.pointer_overflow_enable;
        that.crosshair_enable = options.crosshair_enable ? options.crosshair_enable.toLowerCase() : multiDimensionalCharts.crosshair_enable;
        that.curvy_lines_enable = options.curvy_lines_enable ? options.curvy_lines_enable.toLowerCase() : multiDimensionalCharts.curvy_lines_enable;
        that.interpolate = PykCharts['boolean'](that.curvy_lines_enable) ? "cardinal" : "linear";
        that.panels_enable = "yes";

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }

            that.data = that.k.__proto__._groupBy("line",data);
            that.axis_y_data_format = "number";
            that.axis_x_data_format = that.k.xAxisDataFormatIdentification(that.data);
            if(that.axis_x_data_format === "time" && that.axis_x_time_value_datatype === "") {
                console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to have passed Date data so please pass the value for axis_x_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_15");
            }

            if (that.axis_x_data_format === "string") {
                that.data_sort_enable = "no";
            }
            else {
                that.data_sort_enable = "yes";
                that.data_sort_type = (that.axis_x_data_format === "time") ? "date" : "numerically";
                that.data_sort_order = "ascending";
            }
            PykCharts.multiD.lineFunctions(options,that,"panels_of_line");

        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };
};
PykCharts.multiD.lineFunctions = function (options,chartObject,type) {
    var that = chartObject,
        id = that.selector.substring(1,that.selector.length);

    that.compare_data = that.data;
    that.data_length = that.data.length;
    that.k.remove_loading_bar(id);

    that.dataTransformation = function () {
        that.group_arr = [], that.new_data = [];
        that.ticks = [], that.x_arr = [];

        for(j = 0;j < that.data_length;j++) {
            that.group_arr[j] = that.data[j].name;
        }
        that.uniq_group_arr = that.k.__proto__._unique(that.group_arr);
        that.uniq_color_arr = [];
        var uniq_group_arr_length = that.uniq_group_arr.length;

        for(var k = 0;k < that.data_length;k++) {
            that.x_arr[k] = that.data[k].x;
        }
        var uniq_x_arr = that.k.__proto__._unique(that.x_arr);

        for (k = 0;k < uniq_group_arr_length;k++) {
            if(that.chart_color[k]) {
                that.uniq_color_arr[k] = that.chart_color[k];
            } else {
                for (l = 0;l < that.data_length;l++) {
                    if (that.uniq_group_arr[k] === that.data[l].name && that.data[l].color) {
                        that.uniq_color_arr[k] = that.data[l].color;
                        break;
                    }
                } if(!PykCharts['boolean'](that.uniq_color_arr[k])) {
                    that.uniq_color_arr[k] = that.default_color[0];
                }
            }
        }

        that.flag = 0;
        for (k = 0;k < uniq_group_arr_length;k++) {
            that.new_data[k] = {
                    name: that.uniq_group_arr[k],
                    data: [],
                    color: that.uniq_color_arr[k]
            };
            for (l = 0;l < that.data_length;l++) {
                if (that.uniq_group_arr[k] === that.data[l].name) {
                    that.new_data[k].data.push({
                        x: that.data[l].x,
                        y: that.data[l].y,
                        tooltip: that.data[l].tooltip,
                        annotation: that.data[l].annotation || ""
                    });
                }
            }
        }

        that.new_data_length = that.new_data.length;
        var uniq_x_arr_length = uniq_x_arr.length;

        for (var a = 0;a < that.new_data_length;a++) {
            var uniq_x_arr_copy = that.k.__proto__._unique(that.x_arr)
            ,   every_data_length = that.new_data[a].data.length
            for(var b = 0;b < every_data_length;b++) {
                for(var k = 0;k < uniq_x_arr_length;k++) {
                    if(that.new_data[a].data[b].x == uniq_x_arr_copy[k]) {
                        uniq_x_arr_copy[k] = undefined;
                        break;
                    }
                }
            }
            for (var i = 0; i < uniq_x_arr_length ; i++) {
                if (uniq_x_arr_copy[i] != undefined) {
                    var temp_obj_to_insert_in_new_data = {
                        x: uniq_x_arr_copy[i],
                        y: 0,
                        tooltip: 0,
                        annotation: ""
                    };
                    that.new_data[a].data.splice(i, 0, temp_obj_to_insert_in_new_data);
                }
            }
        }

        for (var k = 0;k < that.new_data_length;k++) {
            that.new_data[k].data = that.k.__proto__._sortData(that.new_data[k].data, "x", "name", that);
        }
    };

    that.calculatePanelInRow = function () {
        var width= parseInt(that.k._getHighestParentsAttribute(that.selector,"width")),total_width;
        if(width) {
            total_width = width;
        } else {
            total_width = d3.select("body").style("width");
        }

        that.no_of_containers_in_row = Math.floor(parseInt(total_width)/that.chart_width);

        if(that.no_of_containers_in_row > that.new_data.length) {
            that.no_of_containers_in_row = that.new_data.length;
        }

        if(total_width < that.chart_width) {
            that.no_of_containers_in_row = 1;
        }
    }

    that.render = function () {
        var id = that.selector.substring(1,that.selector.length);
        that.container_id = id + "_svg";
        that.dataLineGroup = [],that.clicked;
        that.multid = new PykCharts.multiD.configuration(that);
        that.fillColor = new PykCharts.Configuration.fillChart(that,null,options);
        that.transitions = new PykCharts.Configuration.transition(that);

        if(PykCharts["boolean"](that.panels_enable)) {
            that.calculatePanelInRow();
            that.new_width = that.no_of_containers_in_row * that.chart_width;
        }
        if(that.mode === "default") {

            that.k.title(that.new_width);

            if(PykCharts['boolean'](that.panels_enable)) {
                that.w = that.chart_width;
                that.chart_height = that.chart_height;
                that.chart_margin_left = that.chart_margin_left;
                that.chart_margin_right = that.chart_margin_right;

                that.k.backgroundColor(that)
                    .export(that,that.container_id+"-","lineChart",that.panels_enable,that.new_data,that.new_width)
                    .emptyDiv(that.selector)
                    .subtitle(that.new_width);

                d3.select(that.selector).append("div")
                        .attr("id","panels_of_line_main_div")

                that.k.liveData(that);
                that.optionalFeature().chartType();
                that.reducedWidth = that.w - that.chart_margin_left - that.chart_margin_right;
                that.reducedHeight = that.chart_height - that.chart_margin_top - that.chart_margin_bottom;
                that.fill_data = [];
                if(that.axis_x_data_format === "time") {
                    for(i = 0;i<that.new_data_length;i++) {

                        that.new_data[i].data.forEach(function (d) {
                            d.x = that.k.dateConversion(d.x);
                        });

                    }
                    that.data.forEach(function (d) {
                        d.x =that.k.dateConversion(d.x);
                    });
                }

                that.renderPanelOfLines();
            } else {
                that.k.backgroundColor(that)
                    .export(that,"#"+that.container_id+"-1","lineChart")
                    .emptyDiv(that.selector)
                    .subtitle();

                that.w = that.chart_width;
                that.reducedWidth = that.w - that.chart_margin_left - that.chart_margin_right;
                that.reducedHeight = that.chart_height - that.chart_margin_top - that.chart_margin_bottom;
                var selector = that.selector.substr(1,that.selector.length);
                d3.selectAll("#tooltip-svg-container-" + 1 + "-pyk-tooltip"+selector)
                    .remove();
                that.k.liveData(that)
                        .makeMainDiv(that.selector,1)
                        .tooltip(true,that.selector,1,that.flag);

                that.optionalFeature()
                        .chartType();
                if(that.axis_x_data_format === "time") {
                    for(i = 0;i<that.new_data_length;i++) {

                        that.new_data[i].data.forEach(function (d) {
                            d.x = that.k.dateConversion(d.x);
                        });

                    }
                    that.data.forEach(function (d) {
                        d.x =that.k.dateConversion(d.x);
                    });
                }
                try {
                    if(that.type === "multilineChart" && type === "line" ) {
                        throw "Invalid data in the JSON";
                    }
                }
                catch (err) {
                    console.error('%c[Error - Pykih Charts] ', 'color: red;font-weight:bold;font-size:14px', " at "+that.selector+".\""+err+"\"  Visit www.pykcharts.com/errors#error_6");
                    return;
                }

                that.renderLineChart();
            }
            that.k.createFooter(that.new_width)
                .lastUpdatedAt()
                .credits()
                .dataSource();
            if(PykCharts['boolean'](that.annotation_enable)) {
                that.annotation();
            }
        }
        else if(that.mode === "infographics") {
            if(PykCharts['boolean'](that.panels_enable)) {

                that.k.backgroundColor(that)
                    .export(that,"#"+that.container_id+"-","lineChart",that.panels_enable,that.new_data,that.new_width)
                    .emptyDiv(that.selector);
                d3.select(that.selector).append("div")
                        .attr("id","panels_of_line_main_div")
                that.optionalFeature().chartType();
                that.w = that.chart_width;
                that.chart_height = that.chart_height;
                if(that.axis_x_data_format === "time") {
                    for(i = 0;i<that.new_data_length;i++) {

                        that.new_data[i].data.forEach(function (d) {
                            d.x = that.k.dateConversion(d.x);
                        });

                    }
                    that.data.forEach(function (d) {
                        d.x =that.k.dateConversion(d.x);
                    });
                }
                that.reducedWidth = that.w - that.chart_margin_left - that.chart_margin_right;
                that.reducedHeight = that.chart_height - that.chart_margin_top - that.chart_margin_bottom;
                that.fill_data = [];

                that.renderPanelOfLines();
            } else {

                that.k.backgroundColor(that)
                    .export(that,"#"+that.container_id+"-0","lineChart")
                    .emptyDiv(that.selector);

                that.w = that.chart_width;
                that.reducedWidth = that.w - that.chart_margin_left - that.chart_margin_right;
                that.reducedHeight = that.chart_height - that.chart_margin_top - that.chart_margin_bottom;

                that.k.makeMainDiv(that.selector,1)

                that.optionalFeature()
                        .chartType();
                if(that.axis_x_data_format === "time") {
                    for(i = 0;i<that.new_data_length;i++) {
                        that.new_data[i].data.forEach(function (d) {
                            d.x = that.k.dateConversion(d.x);
                        });

                    }
                    that.data.forEach(function (d) {
                        d.x =that.k.dateConversion(d.x);
                    });
                }

                try {
                    if(that.type === "multilineChart" && type === "line" ) {
                        throw "Invalid data in the JSON";
                    }
                }
                catch (err) {
                    console.error('%c[Error - Pykih Charts] ', 'color: red;font-weight:bold;font-size:14px', " at "+that.selector+".\""+err+"\"  Visit www.pykcharts.com/errors#error_6");
                    return;
                }

                that.renderLineChart();
            }
        }

        if(!PykCharts['boolean'](that.panels_enable)) {
            var resize = that.k.resize(that.svgContainer);
            that.k.__proto__._ready(resize);
            window.addEventListener('resize', function(event){
                return that.k.resize(that.svgContainer);
            });
        } else {
            var resize = that.k.resize(null,that.new_width);
            that.k.__proto__._ready(resize);
            window.addEventListener('resize', function(event){
                that.calculatePanelInRow();
                return that.k.resize(null,that.new_width);
            });
        }
    };

    that.refresh = function (pykquery_data) {
        that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("line",data);
            that.data_length = that.data.length;
            var compare = that.k.checkChangeInData(that.data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            that.dataTransformation();

            if(data_changed || (PykCharts['boolean'](that.zoom_enable) && that.count > 1 && that.count <= that.zoom_level) || that.transition_duration) {
                that.k.lastUpdatedAt("liveData");
                that.mouseEvent.tooltipHide(null,that.panels_enable,that.type);
                that.mouseEvent.crossHairHide(that.type);
                that.mouseEvent.axisHighlightHide(that.selector + " .x.axis");
                that.mouseEvent.axisHighlightHide(that.selector + " .y.axis");
            }
            that.optionalFeature().hightLightOnload();
            if(that.axis_x_data_format === "time") {
                for(var i = 0;i<that.new_data_length;i++) {

                    that.new_data[i].data.forEach(function (d) {
                        d.x = that.k.dateConversion(d.x);
                    });

                }
                that.data.forEach(function (d) {
                    d.x =that.k.dateConversion(d.x);
                });
            }
            if(PykCharts['boolean'](that.panels_enable)) {
                for (var i = 0;i < that.previous_length;i++) {
                    var element = document.querySelector(that.selector + " #panels_of_line_main_div #chart-container-"+i);
                    element.parentNode.removeChild(element);
                }
                that.renderPanelOfLines();
            }

            if(that.type === "multilineChart" && !PykCharts['boolean'](that.panels_enable)) {
                document.querySelector(that.selector +" #chart-container-1").innerHTML = null;
                that.renderLineChart();
            }

            if(that.type === "lineChart") {

                that.optionalFeature()
                    .createChart("liveData")
                    .ticks();

                that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values)
                        .yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values)
                        .yGrid(that.svgContainer,that.group,that.yScale)
                        .xGrid(that.svgContainer,that.group,that.xScale)

                if(PykCharts['boolean'](that.annotation_enable)) {
                    that.annotation();
                }
            }

        };
        if (PykCharts.boolean(that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
    };

    that.optionalFeature = function (){
        var id = that.selector.substring(1,that.selector.length);
        var optional = {
            chartType: function () {
                for(var j = 0;j < that.data_length;j++) {
                    for(var k = (j+1);k < that.data_length;k++) {
                        if(that.data[j].x === that.data[k].x) {
                            that.type = "multilineChart";
                            break;
                        }
                    }
                }
                that.type = that.type || "lineChart";
                return this;
            },
            hightLightOnload: function () {
                if(that.type === "multilineChart") {
                    if(that.new_data_length > 0 && that.highlight) {
                        for(var i = 0;i< that.uniq_group_arr.length;i++) {

                            if(that.highlight.toLowerCase() === that.uniq_group_arr[i].toLowerCase()) {
                                that.new_data[i].highlight = true;
                            } else
                            {
                                that.new_data[i].highlight = false;
                            }
                        }
                    }
                }
                return this;
            },
            svgContainer: function (i){
                var element = document.getElementById(id);
                if(that.type === "multilineChart" && !element.classList.contains('PykCharts-line-chart')) {
                    element.className += " PykCharts-twoD PykCharts-line-chart PykCharts-multi-series2D";
                } else if(that.type === "lineChart" && !element.classList.contains('PykCharts-line-chart')) {
                    element.className += " PykCharts-twoD PykCharts-line-chart";
                }
                that.svgContainer = d3.select(that.selector+" #chart-container-"+i)
                    .append("svg:svg")
                    .attr({
                        "id": that.container_id+"-" + i,
                        "width": that.w,
                        "height": that.chart_height,
                        "class": "svgcontainer",
                        "preserveAspectRatio": "xMinYMin",
                        "viewBox": "0 0 " + that.w + " " + that.chart_height
                    });

                if(PykCharts['boolean'](that.pointer_overflow_enable) && !PykCharts['boolean'](that.panels_enable)) {
                    that.svgContainer.style("overflow","visible");
                }

                return this;
            },
            createGroups : function (i) {
                that.group = that.svgContainer.append("g")
                    .attr({
                        "id": that.type+"-svg",
                        "transform": "translate("+ that.chart_margin_left +","+ that.chart_margin_top +")"
                    });

                if(PykCharts['boolean'](that.chart_grid_y_enable)){
                    that.group.append("g")
                        .attr({
                            "id": "ygrid",
                            "class": "y grid-line"
                        });
                }
                if(PykCharts['boolean'](that.chart_grid_x_enable)){
                    that.group.append("g")
                        .attr({
                            "id": "xgrid",
                            "class": "x grid-line"
                        });
                }

                that.clip = that.svgContainer.append("svg:clipPath")
                    .attr("id","clip" + i + that.selector)
                    .append("svg:rect")
                    .attr({
                        "width": that.reducedWidth,
                        "height": that.reducedHeight
                    });

                that.chartBody = that.svgContainer.append("g")
                    .attr({
                        "id": "clipPath",
                        "clip-path": "url(#clip" + i + that.selector + ")",
                        "transform": "translate("+ that.chart_margin_left +","+ that.chart_margin_top +")"
                    });

                return this;
            },
            axisContainer : function () {

                if(PykCharts['boolean'](that.axis_x_enable) || that.axis_x_title){
                    that.xGroup = that.group.append("g")
                        .attr({
                            "id": "xaxis",
                            "class": "x axis"
                        });
                }
                if(PykCharts['boolean'](that.axis_y_enable) || that.axis_y_title) {
                    that.yGroup = that.group.append("g")
                        .attr({
                            "id": "yaxis",
                            "class": "y axis"
                        });
                }
                return this;
            },
            createChart : function (evt,index) {
                that.previous_length = that.new_data.length;

                that.x_tick_values = that.k.processXAxisTickValues();
                that.y_tick_values = that.k.processYAxisTickValues();

                var x_domain,x_data = [],y_data,y_range,x_range,y_domain,min_x_tick_value,max_x_tick_value, min_y_tick_value,max_y_tick_value;

                if(that.axis_y_data_format === "number") {
                    max = d3.max(that.new_data, function(d) { return d3.max(d.data, function(k) { return k.y; }); });
                    min = d3.min(that.new_data, function(d) { return d3.min(d.data, function(k) { return k.y; }); });
                    y_domain = [min,max];

                    y_data = that.k.__proto__._domainBandwidth(y_domain,2);
                    min_y_tick_value = d3.min(that.y_tick_values);
                    max_y_tick_value = d3.max(that.y_tick_values);

                    if(y_data[0] > min_y_tick_value) {
                        y_data[0] = min_y_tick_value;
                    }
                    if(y_data[1] < max_y_tick_value) {
                        y_data[1] = max_y_tick_value;
                    }

                    y_range = [that.reducedHeight, 0];
                    that.yScale = that.k.scaleIdentification("linear",y_data,y_range);

                } else if(that.axis_y_data_format === "string") {
                    that.new_data[0].data.forEach(function(d) { y_data.push(d.y); });
                    y_range = [0,that.reducedHeight];
                    that.yScale = that.k.scaleIdentification("ordinal",y_data,y_range,0);

                } else if (that.axis_y_data_format === "time") {
                    y_data = d3.extent(that.data, function (d) {
                        return new Date(d.x);
                    });

                    min_y_tick_value = d3.min(that.y_tick_values, function (d) {
                        return new Date(d);
                    });

                    max_y_tick_value = d3.max(that.y_tick_values, function (d) {
                        return new Date(d);
                    });

                    if(new Date(y_data[0]) > new Date(min_y_tick_value)) {
                        y_data[0] = min_y_tick_value;
                    }
                    if(new Date(y_data[1]) < new Date(max_y_tick_value)) {
                        y_data[1] = max__tick_value;
                    }

                    y_range = [that.reducedHeight, 0];
                    that.yScale = that.k.scaleIdentification("time",y_data,y_range);
                }
                that.xdomain = [];
                if(that.axis_x_data_format === "number") {
                    max = d3.max(that.new_data, function(d) { return d3.max(d.data, function(k) { return +k.x; }); });
                    min = d3.min(that.new_data, function(d) { return d3.min(d.data, function(k) { return +k.x; }); });
                    x_domain = [min,max];
                    x_data = that.k.__proto__._domainBandwidth(x_domain,2);

                    min_x_tick_value = d3.min(that.x_tick_values);
                    max_x_tick_value = d3.max(that.x_tick_values);

                    if(x_data[0] > min_x_tick_value) {
                        x_data[0] = min_x_tick_value;
                    }
                    if(x_data[1] < max_x_tick_value) {
                        x_data[1] = max_x_tick_value;
                    }

                    x_range = [0 ,that.reducedWidth];
                    that.xScale = that.k.scaleIdentification("linear",x_data,x_range);
                    that.extra_left_margin = 0;
                    that.new_data[0].data.forEach(function (d) {
                        that.xdomain.push(+d.x);
                    })

                } else if(that.axis_x_data_format === "string") {
                    that.new_data[0].data.forEach(function(d) { x_data.push(d.x); });
                    x_range = [0 ,that.reducedWidth];
                    that.xScale = that.k.scaleIdentification("ordinal",x_data,x_range,0);
                    that.extra_left_margin = (that.xScale.rangeBand() / 2);
                    that.xdomain = that.xScale.domain();

                } else if (that.axis_x_data_format === "time") {
                    max = d3.max(that.new_data, function(d) { return d3.max(d.data, function(k) { return k.x; }); });
                    min = d3.min(that.new_data, function(d) { return d3.min(d.data, function(k) { return k.x; }); });
                    x_data = [min,max];
                    x_range = [0 ,that.reducedWidth];

                    min_x_tick_value = d3.min(that.x_tick_values, function (d) {
                        d = that.k.dateConversion(d);
                        return d;
                    });

                    max_x_tick_value = d3.max(that.x_tick_values, function (d) {
                        d = that.k.dateConversion(d);
                        return d;
                    });

                    if((x_data[0]) > (min_x_tick_value)) {
                        x_data[0] = min_x_tick_value;
                    }
                    if((x_data[1]) < (max_x_tick_value)) {
                        x_data[1] = max_x_tick_value;
                    }
                    that.xScale = that.k.scaleIdentification("time",x_data,x_range);
                    that.extra_left_margin = 0;
                    that.new_data[0].data.forEach(function (d) {
                        that.xdomain.push(d.x);
                    })
                }
                that.count = 1;
                that.zoom_event = d3.behavior.zoom();
                if(!(that.axis_y_data_format==="string" || that.axis_x_data_format==="string")) {
                    that.zoom_event.x(that.xScale)
                        .y(that.yScale)
                        .scale(that.count)
                        .on("zoom",that.zoomed);
                } else {
                    that.zoom_event.y(that.yScale)
                        .scale(that.count)
                        .on("zoom",that.zoomed);
                }

                if(PykCharts['boolean'](that.zoom_enable) && (that.mode === "default")) {
                    if(PykCharts['boolean'](that.panels_enable)){
                        n = that.new_data_length;
                        j = 0;
                    } else {
                        n = 2;
                        j = 1;
                    }
                    for(var i=j;i<n;i++) {
                        d3.selectAll(that.selector + " #"+that.container_id+"-" +i).call(that.zoom_event);
                        d3.selectAll(that.selector + " #"+that.container_id+"-" + i).on("wheel.zoom", null)
                            .on("mousewheel.zoom", null);
                    }
                }

                that.chart_path = d3.svg.line()
                    .x(function(d) { return that.xScale(d.x); })
                    .y(function(d) { return that.yScale(d.y); })
                    .interpolate(that.interpolate);
                var chartType = (that.type === "lineChart") ? "lineChart" : (that.panels_enable === "yes") ? "panels_of_line" : "multi_series_line";
                that.chartPathClass = (that.type === "lineChart") ? "line" : "multi-line";
                if(evt === "liveData" && that.type === "lineChart") {

                        for (var i = 0;i < that.new_data_length;i++) {
                            var data = that.new_data[i].data;
                            var type = that.type + "-svg-" +i;

                            that.svgContainer.select(that.selector + " #"+type)
                                .datum(that.new_data[i].data)
                                .attr("transform", "translate("+ that.extra_left_margin +",0)")
                                .style("stroke", function() {
                                    if(that.new_data[i].highlight && that.type === "multilineChart" && !that.clicked) {
                                        that.highlightLine(this,null);
                                    } else if(that.clicked) {
                                        that.highlightLine(that.selected,null,that.previous_color);
                                    }
                                    else {
                                        d3.select(this).classed({'multi-line-selected':false,'multi-line':true,'multi-line-hover':false});
                                    }
                                    return that.fillColor.colorPieMS(that.new_data[i],that.type);
                                })
                                .attr("data-id",function (d,i) {
                                    return that.new_data[i];
                                });

                            function transition1 (i) {
                                that.dataLineGroup[i].transition()
                                    .duration(that.transitions.duration())
                                    .attrTween("d", function (d) {
                                        var interpolate = d3.scale.quantile()
                                            .domain([0,1])
                                            .range(d3.range(1, data.length + 1));
                                        return function(t) {
                                            return that.chart_path(that.new_data[i].data.slice(0, interpolate(t)));
                                        };
                                    });
                            }
                            transition1(i);

                            d3.selectAll(that.selector+" text#"+ (that.type + "-svg-" + i))
                                .style("fill",function() {
                                    return that.fillColor.colorPieMS(that.new_data[i],that.type);
                                });
                        }
                    if(that.mode === "default") {
                        that.svgContainer
                            .on('mouseout',function (d) {
                                that.mouseEvent.tooltipHide();
                                that.mouseEvent.crossHairHide(that.type);
                                that.mouseEvent.axisHighlightHide(that.selector + " .x.axis");
                                that.mouseEvent.axisHighlightHide(that.selector + " .y.axis");
                            })
                            .on("mousemove", function(){
                                that.mouseEvent.crossHairPosition(that.new_data,that.xScale,that.yScale,that.dataLineGroup,that.extra_left_margin,that.xdomain,chartType,that.tooltipMode,null,that.container_id);
                            });
                    }
                }
                else { // Static Viz
                    that.clk = true;
                    if(!PykCharts['boolean'](that.panels_enable)) {
                        var i;
                        for (var i = 0;i < that.new_data_length;i++) {
                            var type = that.type + "-svg-" + i;
                            that.dataLineGroup[i] = that.chartBody.append("path");
                            var data = that.new_data[i].data;
                            that.dataLineGroup[i]
                                    .datum(that.new_data[i].data)
                                    .attr({
                                        "class": "lines-hover " + that.chartPathClass,
                                        "id": type,
                                        "transform": "translate("+ that.extra_left_margin +",0)",
                                        "stroke-opacity": function () {
                                            if(that.color_mode === "saturation") {
                                                return (i+1)/that.new_data.length;
                                            } else {
                                                return 1;
                                            }
                                        },
                                        "path-stroke-opacity": function () {
                                            return d3.select(this).attr("stroke-opacity");
                                        }
                                    })
                                    .style("stroke", function() {
                                        if(that.new_data[i].highlight) {
                                            that.highlightLine(this,null);
                                        }
                                        return that.fillColor.colorPieMS(that.new_data[i],that.type);
                                    });

                                function transition (i) {
                                    that.dataLineGroup[i].transition()
                                        .duration(that.transitions.duration())
                                        .attrTween("d", function (d) {
                                            var interpolate = d3.scale.quantile()
                                                .domain([0,1])
                                                .range(d3.range(1, data.length + 1));
                                            return function(t) {
                                                return that.chart_path(that.new_data[i].data.slice(0, interpolate(t)));
                                            };
                                        })
                                }
                                transition(i);
                        }
                    } else {                // Multiple Containers -- "Yes"
                        data = that.new_data[index].data;
                        type = that.type + that.svgContainer.attr("id");
                        that.dataLineGroup[0] = that.chartBody.append("path");

                        that.dataLineGroup[0]
                                .datum(that.new_data1.data)
                                .attr({
                                    "class": "lines-hover "+that.chartPathClass,
                                    "id": type,
                                    "transform": "translate("+ that.extra_left_margin +",0)",
                                    "stroke-opacity": function () {
                                        if(that.color_mode === "saturation") {
                                            return (index+1)/that.new_data.length;
                                        } else {
                                            return 1;
                                        }
                                    },
                                    "path-stroke-opacity": function () {
                                        return d3.select(this).attr("stroke-opacity");
                                    },
                                    "data-id":function (d,i) {
                                        return that.new_data[i];
                                    }
                                })
                                .style("stroke", function() {
                                    if(that.new_data[index].highlight) {
                                        that.highlightLine(this,null);
                                    }
                                    return that.fillColor.colorPieMS(that.new_data[index],that.type);
                                })
                                .on({
                                    "click": function (d) {
                                        if(that.mode === "default") {
                                            that.clicked = true;
                                            that.highlightLine(PykCharts.getEvent().target,that.clicked,that.previous_color);
                                        }
                                    },
                                    "mouseover": function (d) {
                                        if(this !== that.selected && (that.color_mode === "saturation" || that.hover) && that.mode === "default") {
                                            that.previous_color = d3.select(this).attr("stroke-opacity");
                                            that.click_color = d3.select(this).style("stroke");
                                            d3.select(this)
                                                .classed({'multi-line-hover':true,'multi-line':false})
                                                .style("stroke", "orange");
                                        }
                                    },
                                    "mouseout": function (d,i) {
                                        if(this !== that.selected && (that.color_mode === "saturation" || that.hover) && that.mode === "default") {
                                            d3.select(this)
                                                .classed({'multi-line-hover':false,'multi-line':true})
                                                .style("stroke", function() {
                                                    if(that.new_data[index].highlight) {
                                                        that.highlightLine(this,null,that.previous_color/*that.new_data[i].highlight*/);
                                                    }
                                                    return that.click_color;
                                                })
                                                .attr("stroke-opacity", function () {
                                                    if(that.color_mode === "saturation") {
                                                        return that.previous_color;
                                                    } else {
                                                        return 1;
                                                    }
                                                });
                                        }
                                    }
                                });

                        function animation(i) {
                            that.dataLineGroup[0].transition()
                                    .duration(that.transitions.duration())
                                    .attrTween("d", function (d) {
                                        var interpolate = d3.scale.quantile()
                                            .domain([0,1])
                                            .range(d3.range(1, data.length + 1));
                                        return function(t) {
                                            return that.chart_path(data.slice(0, interpolate(t)));
                                        };
                                    });
                        }
                        animation(index);
                    }

                    if(that.type === "lineChart" && that.mode === "default") {

                        that.svgContainer
                            .on('mouseout',function (d) {
                                that.mouseEvent.tooltipHide();
                                that.mouseEvent.crossHairHide(that.type);
                                that.mouseEvent.axisHighlightHide(that.selector + " .x.axis");
                                that.mouseEvent.axisHighlightHide(that.selector + " .y.axis");
                            })
                            .on("mousemove", function(){
                                that.mouseEvent.crossHairPosition(that.new_data,that.xScale,that.yScale,that.dataLineGroup,that.extra_left_margin,that.xdomain,chartType,that.tooltipMode,null,that.container_id);
                            });
                    }
                    else if (that.type === "multilineChart" && that.mode === "default") {
                        that.svgContainer
                            .on('mouseout', function (d) {
                                that.mouseEvent.tooltipHide(null,that.panels_enable,that.type);
                                that.mouseEvent.crossHairHide(that.type);
                                that.mouseEvent.axisHighlightHide(that.selector + " .x.axis");
                                that.mouseEvent.axisHighlightHide(that.selector + " .y.axis");
                            })
                            .on("mousemove", function(){
                                var line = [];
                                line[0] = d3.select(that.selector+" #"+this.id+" .lines-hover");
                                that.mouseEvent.crossHairPosition(that.new_data,that.xScale,that.yScale,line,that.extra_left_margin,that.xdomain,chartType,that.tooltipMode,that.panels_enable,that.container_id,that.no_of_containers_in_row);
                            });
                    }
                }
                return this;
            },
            ticks: function (index) {
                if(PykCharts['boolean'](that.pointer_size)) {
                    if(PykCharts['boolean'](that.panels_enable)) {
                        var type = that.type + that.svgContainer.attr("id");
                        if (that.axis_x_position  === "bottom" && (that.axis_y_position === "left" || that.axis_y_position === "right")) {
                            that.ticks[0] = that.svgContainer.append("text")
                                .attr({
                                    "id": type,
                                    "x": that.chart_margin_left,
                                    "y": that.chart_margin_top,
                                    "dy": -5
                                })
                                .style({
                                    "font-size": that.pointer_size + "px",
                                    "font-weight": that.pointer_weight,
                                    "font-family": that.pointer_family,
                                    "fill": function() {
                                        return that.fillColor.colorPieMS(that.new_data1,that.type);
                                    }
                                })
                                .html(that.new_data1.name);
                        } else if (that.axis_x_position  === "top"  && (that.axis_y_position === "left" || that.axis_y_position === "right")) {
                            that.ticks[0] = that.svgContainer.append("text")
                                .attr({
                                    "id": type,
                                    "x": that.w - that.chart_margin_left,
                                    "y": that.chart_height-that.chart_margin_bottom,
                                    "dy": 10,
                                    "text-anchor": "end"
                                })
                                .style({
                                    "font-size": that.pointer_size + "px",
                                    "font-weight": that.pointer_weight,
                                    "font-family": that.pointer_family,
                                    "fill": function() {
                                        return that.fillColor.colorPieMS(that.new_data1,that.type);
                                    }
                                })
                                .html(that.new_data1.name);
                        }

                    } else {
                        that.ticks_text_width = [];
                        tickPosition = function (d,i) {
                            var end_x_circle, end_y_circle;
                            if(that.axis_y_position === "left") {
                                end_x_circle = (that.xScale(that.new_data[i].data[(that.new_data[i].data.length - 1)].x) + that.extra_left_margin + that.chart_margin_left);
                                end_y_circle = (that.yScale(that.new_data[i].data[(that.new_data[i].data.length - 1)].y) + that.chart_margin_top);
                            } else if(that.axis_y_position === "right") {
                                end_x_circle = (that.xScale(that.new_data[i].data[0].x) + that.extra_left_margin + that.chart_margin_left) - 10;
                                end_y_circle = (that.yScale(that.new_data[i].data[0].y) + that.chart_margin_top);
                            }
                            text_x = end_x_circle,
                            text_y = end_y_circle,
                            text_rotate = 0;
                            return "translate("+text_x+","+text_y+") rotate("+text_rotate+")";
                        }
                        orient = function () {
                            if(that.axis_y_position === "left") {
                                return "start";
                            } else if(that.axis_y_position === "right") {
                                return "end";
                            }
                        }
                        that.ticks = that.svgContainer.selectAll(".legend-heading")
                                .data(that.new_data);

                        that.ticks.enter()
                                .append(
                                    "text")

                        that.ticks.attr({
                            "id": function (d,i) { return that.type + "-svg-" + i; },
                            "class": "legend-heading",
                            "transform": tickPosition,
                            "text-anchor": orient
                        });

                        that.ticks.text(function (d,i) {
                                return "";
                            })
                        function setTimeoutTicks() {
                            that.ticks.text(function (d,i) {
                                    return d.name;
                                })
                                .text(function (d,i) {
                                    that.ticks_text_width[i] = this.getBBox().width;
                                    return d.name;
                                })
                                .attr({
                                    "dx": 5,
                                    "dy": 5
                                })
                                .style({
                                    "font-size": that.pointer_size + "px",
                                    "font-weight": function(d){
                                        if(d.highlight) {
                                            return "bold";
                                        } else {
                                            return that.pointer_weight;
                                        }
                                    },
                                    "font-family": that.pointer_family,
                                    "visibility": "visible",
                                    "fill": function(d,i) {
                                        return that.fillColor.colorPieMS(that.new_data[i],that.type);
                                    },
                                    "pointer-events" : "none"
                                });
                        }
                        setTimeout(setTimeoutTicks, that.transitions.duration());
                        that.ticks.exit()
                            .remove();
                    }
                }
                return this;
            }
        };
        return optional;
    };
    that.zoomed = function() {
        if(!PykCharts['boolean'](that.panels_enable)) {
            if(PykCharts['boolean'](that.pointer_overflow_enable)) {
                that.svgContainer.style("overflow","hidden");
            }

            that.k.isOrdinal(that.svgContainer,".x.axis",that.xScale,that.xdomain,that.extra_left_margin);
            that.k.isOrdinal(that.svgContainer,".x.grid",that.xScale);
            that.k.isOrdinal(that.svgContainer,".y.axis",that.yScale,that.ydomain);
            that.k.isOrdinal(that.svgContainer,".y.grid",that.yScale);
            for (var i = 0;i < that.new_data_length;i++) {
                var type = that.type+"-svg-"+i;
                that.svgContainer.select(that.selector+" #"+type)
                    .attr({
                        "class": "lines-hover " + that.chartPathClass,
                        "d": that.chart_path
                    });

            }
        } else {
            for (var i = 0;i < that.new_data_length;i++) {
                var type = that.type;
                currentContainer = d3.selectAll("#"+that.container_id + "-" + i);
                that.k.isOrdinal(currentContainer,".x.axis",that.xScale,that.xdomain,that.extra_left_margin);
                that.k.isOrdinal(currentContainer,".x.grid",that.xScale);
                that.k.isOrdinal(currentContainer,".y.axis",that.yScale,that.ydomain);
                that.k.isOrdinal(currentContainer,".y.grid",that.yScale);
                currentContainer.select("#"+type+that.container_id+"-"+i)
                    .attr({
                        "class": "lines-hover " + that.chartPathClass,
                        "d": that.chart_path
                    });

            }
        }
        if(PykCharts.getEvent().sourceEvent.type === "dblclick") {
            that.count++;
        }
        that.mouseEvent.tooltipHide();
        that.mouseEvent.crossHairHide(that.type);
        that.mouseEvent.axisHighlightHide(that.selector + " .x.axis");
        that.mouseEvent.axisHighlightHide(that.selector + " .y.axis");

        if(that.count === that.zoom_level+1) {
            that.zoomOut();
        }
        if(PykCharts['boolean'](that.annotation_enable)) {
            that.annotation();
        }
        that.optionalFeature().ticks();
    };
    that.zoomOut = function () {
        if(PykCharts['boolean'](that.pointer_overflow_enable) && !PykCharts['boolean'](that.panels_enable)) {
            that.svgContainer.style("overflow","visible");
        }
        if(PykCharts['boolean'](that.panels_enable)) {
            for (var i = 0;i < that.previous_length;i++) {
                var element = document.querySelector(that.selector + " #panels_of_line_main_div #chart-container-"+i);
                element.parentNode.removeChild(element);
            }
            that.renderPanelOfLines();
        }
        if(that.type === "lineChart") {
            that.optionalFeature().createChart("liveData");
        } else if(that.type === "multilineChart" && !PykCharts['boolean'](that.panels_enable)) {
            document.querySelector(that.selector +" #chart-container-1").innerHTML = null;
            that.renderLineChart();
        }
        that.k.isOrdinal(that.svgContainer,".x.axis",that.xScale,that.xdomain,that.extra_left_margin);
        that.k.isOrdinal(that.svgContainer,".x.grid",that.xScale);
        that.k.isOrdinal(that.svgContainer,".y.axis",that.yScale,that.ydomain);
        that.k.isOrdinal(that.svgContainer,".y.grid",that.yScale);
    };

    that.onBrush = function (min,max) {
        that.addEvents(min,max);
    };

    that.highlightLine = function(linePath,clicked,prev_opacity) {

            that.selected_line = linePath;
            that.selected_line_data = that.selected_line.__data__;
            that.selected_line_data_len = that.selected_line_data.length;
            that.deselected = that.selected;

            that.selected = linePath;

            if(that.type === "multilineChart" && (that.color_mode === "saturation" || that.hover))
                d3.select(that.selected)
                    .style("stroke", function (d,i) {
                        return that.click_color;
                    });

            if(clicked) {
                 if (d3.select(that.selected).classed("multi-line")) {
                        d3.selectAll(that.selector+" path.multi-line").attr("stroke-opacity",0.3);
                        if (that.color_mode === "color") {
                            d3.selectAll(that.selector+ " .legend-heading").style("opacity",0.3);
                        }
                        d3.select(that.selector+" text#"+that.selected.id).style("opacity",1).style
                        ("font-weight","bold");
                        d3.selectAll(".lines-hover")
                            .attr("stroke-opacity",0.3)
                            .classed({
                                "multi-line-selected": false,
                                "multi-line": true
                            });
                        d3.select(that.selected)
                            .attr("stroke-opacity",1)
                            .classed({
                                "multi-line-selected": true,
                                "multi-line": false
                            });
                 } else {
                    if (that.color_mode === "color") {
                        d3.selectAll(that.selector+" path.multi-line").attr("stroke-opacity",prev_opacity);
                    } else {
                        d3.selectAll(that.selector+" path.multi-line").attr("stroke-opacity",function () {
                            return d3.select(this).attr("path-stroke-opacity");
                        });
                    }
                    d3.selectAll(that.selector+ " .legend-heading").style("opacity",1);
                    d3.select(that.selector+" text#"+that.selected.id).style({
                        "opacity": 1,
                        "font-weight": "normal"
                    });
                    d3.select(that.selected)
                        .attr("stroke-opacity",prev_opacity)
                        .classed({
                            "multi-line-selected": false,
                            "multi-line": true
                        });
                }
            }

    };

    that.annotation = function () {
        that.line = d3.svg.line()
                .interpolate('linear-closed')
                .x(function(d,i) { return d.x; })
                .y(function(d,i) { return d.y; });

        if(!PykCharts['boolean'](that.panels_enable)) {
            var arrow_size = 12/*line_size = 15*/,annotation = [];

            for(var i=0;i<that.new_data_length;i++){
                that.new_data[i].data.map(function (d) {
                    if(d.annotation) {
                        annotation.push({
                            annotation : d.annotation,
                            x : d.x,
                            y : d.y
                        })
                    }
                });
            }

            annotationComman(annotation,1);
            that.k.annotation(that.selector + " #svg-1",annotation, that.xScale,that.yScale);
        } else if(PykCharts['boolean'](that.panels_enable)) {
            for(var i=0;i<that.new_data_length;i++){
                var annotation = [], arrow_size = 12;
                that.new_data[i].data.map(function (d) {
                    if(d.annotation) {
                        annotation.push({
                            annotation : d.annotation,
                            x : d.x,
                            y : d.y
                        })
                    }
                });
                annotationComman(annotation,i);
                that.k.annotation(that.selector + " #"+that.container_id+"-" + i,annotation, that.xScale,that.yScale)
            }
        }
        function annotationComman (annotation,i) {
            var anno = d3.select(that.selector + " #"+that.container_id+"-" + i).selectAll(that.selector+ " .PykCharts-annotation-line")
                .data(annotation);
            anno.enter()
                .append("path");
            anno.attr("d", function (d,i) {
                    var a = [
                        {
                            x:parseInt(that.xScale(d.x))+that.extra_left_margin+that.chart_margin_left,
                            y:parseInt(that.yScale(d.y)-(arrow_size)+that.chart_margin_top)
                        },
                        {
                            x:parseInt(that.xScale(d.x))+that.extra_left_margin+that.chart_margin_left,
                            y:parseInt(that.yScale(d.y)-(arrow_size)+that.chart_margin_top)
                        }
                    ];
                    return that.line(a);
                })
            function setTimeoutAnnotationPanelOfLine() {
                anno.attr("class", "PykCharts-annotation-line")
                    .attr("d", function (d,i) {
                        var a = [
                            {
                                x:parseInt(that.xScale(d.x)-(arrow_size*0.5))+that.extra_left_margin+that.chart_margin_left,
                                y:parseInt(that.yScale(d.y)-(arrow_size)+that.chart_margin_top)
                            },
                            {
                                x:parseInt(that.xScale(d.x)+(arrow_size*0.5))+that.extra_left_margin+that.chart_margin_left,
                                y:parseInt(that.yScale(d.y)-(arrow_size)+that.chart_margin_top)
                            },
                            {
                                x:parseInt(that.xScale(d.x))+that.extra_left_margin+that.chart_margin_left,
                                y:parseInt(that.yScale(d.y)+that.chart_margin_top),
                            }
                        ];
                        return that.line(a);
                    })
                    .attr("fill",that.annotation_background_color);
            }
            setTimeout(setTimeoutAnnotationPanelOfLine,that.transitions.duration());
            anno.exit().remove();
        }
    };

    that.renderPanelOfLines = function () {
        for(var i=0;i<that.new_data_length;i++) {
            var selector = that.selector.substr(1,that.selector.length);
            d3.selectAll("#tooltip-svg-container-" + i + "-pyk-tooltip"+selector)
                .remove()
            that.k.makeMainDiv((that.selector + " #panels_of_line_main_div"),i)
                .tooltip(true,that.selector,i);
            that.new_data1 = that.new_data[i];
            that.fill_data[0] = that.new_data1;
            that.optionalFeature()
                    .svgContainer(i)
                    .createGroups(i);

            that.k.crossHair(that.svgContainer,1,that.fill_data,that.fillColor,that.type);
            that.mouseEvent = new PykCharts.crossHairMovement(that);

            that.optionalFeature()
                    .createChart(null,i)
                    .ticks(i)
                    .axisContainer();

            that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values)
                    .yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values)
                    .xAxisTitle(that.xGroup)
                    .yAxisTitle(that.yGroup);

            if(that.mode === "default") {
                that.k.yGrid(that.svgContainer,that.group,that.yScale)
                    .xGrid(that.svgContainer,that.group,that.xScale)
            }
        }
        that.k.exportSVG(that,that.container_id+"-","lineChart",that.panels_enable,that.new_data);
        that.k.emptyDiv(that.selector);
    };

    that.renderLineChart = function () {

        that.optionalFeature().svgContainer(1)
            .createGroups(1)
            .hightLightOnload();

        that.k.crossHair(that.svgContainer,that.new_data_length,that.new_data,that.fillColor,that.type);
        that.mouseEvent = new PykCharts.crossHairMovement(that);

        that.optionalFeature()
                .createChart()
                .ticks()
                .axisContainer();

        that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values)
                .yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values)
                .xAxisTitle(that.xGroup)
                .yAxisTitle(that.yGroup);

        if (PykCharts.boolean(that.interactive_enable)) {
            that.brush = new PykCharts.Configuration.renderBrush(that,that.xScale,that.group,that.reducedHeight);
        }

        if(that.mode === "default") {
            that.k.yGrid(that.svgContainer,that.group,that.yScale)
                .xGrid(that.svgContainer,that.group,that.xScale)
        }

        var add_extra_width = 0;
        function setTimeoutExport() {
            if(PykCharts['boolean'](that.pointer_size)) {
                add_extra_width = d3.max(that.ticks_text_width,function(d){
                        return d;
                    });
            }
            that.k.exportSVG(that,"#"+that.container_id+"-1","lineChart",undefined,undefined,add_extra_width);
        }
        setTimeout(setTimeoutExport,that.transitions.duration());
    };

    that.dataTransformation();
    that.render();
};

PykCharts.multiD.area = function (options){
	var that = this;
	that.interval = "";
	var theme = new PykCharts.Configuration.Theme({});

	this.execute = function (pykquery_data){
        that = new PykCharts.validation.processInputs(that, options, 'multiDimensionalCharts');
		PykCharts.crossHair(that);
        PykCharts.annotation(that);
        PykCharts.scaleFunction(that);
        PykCharts.grid(that);
        that.k.storeInitialDivHeight();
		if(that.stop) {
			return;
		}

		if(that.mode === "default") {
			that.k.loading();
		}

		var multiDimensionalCharts = theme.multiDimensionalCharts,
			stylesheet = theme.stylesheet,
			optional = options.optional;

	    that.crosshair_enable = options.crosshair_enable ? options.crosshair_enable.toLowerCase() : multiDimensionalCharts.crosshair_enable;
		that.curvy_lines_enable = options.curvy_lines_enable ? options.curvy_lines_enable.toLowerCase() : multiDimensionalCharts.curvy_lines_enable;
	  	that.panels_enable = "no";
	  	that.interpolate = PykCharts['boolean'](that.curvy_lines_enable) ? "cardinal" : "linear";
		that.w = that.chart_width - that.chart_margin_left - that.chart_margin_right;
		that.h = that.chart_height - that.chart_margin_top - that.chart_margin_bottom;

		that.executeData = function (data) {
			var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }

			that.data = that.k.__proto__._groupBy("area",data);
			that.axis_y_data_format = "number";
    		that.axis_x_data_format = that.k.xAxisDataFormatIdentification(that.data);
    		if(that.axis_x_data_format === "time" && that.axis_x_time_value_datatype === "") {
    			console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to have passed Date data so please pass the value for axis_x_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_15");
    		}
			that.compare_data = that.data;
			that.data_length = that.data.length;
            that.k.remove_loading_bar(id);

			if (that.axis_x_data_format === "string") {
                that.data_sort_enable = "no";
            }
            else {
                that.data_sort_enable = "yes";
                that.data_sort_type = (that.axis_x_data_format === "time") ? "date" : "numerically";
                that.data_sort_order = "ascending";
            }
			PykCharts.multiD.areaFunctions(options,that,"area");
			that.dataTransformation();
			that.render();

		}
        if (PykCharts.boolean(that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }

	};
};
PykCharts.multiD.stackedArea = function (options){
	var that = this;
	that.interval = "";
	var theme = new PykCharts.Configuration.Theme({});

	this.execute = function (pykquery_data){
        that = new PykCharts.validation.processInputs(that, options, 'multiDimensionalCharts');
		PykCharts.crossHair(that);
        PykCharts.annotation(that);
        PykCharts.scaleFunction(that);
        PykCharts.grid(that);

		if(that.stop) {
			return;
		}
        that.k.storeInitialDivHeight();
		if(that.mode === "default") {
			that.k.loading();
		}

		var multiDimensionalCharts = theme.multiDimensionalCharts,
			stylesheet = theme.stylesheet,
			optional = options.optional;

	    that.crosshair_enable = options.crosshair_enable ? options.crosshair_enable.toLowerCase() : multiDimensionalCharts.crosshair_enable;
		that.curvy_lines_enable = options.curvy_lines_enable ? options.curvy_lines_enable.toLowerCase() : multiDimensionalCharts.curvy_lines_enable;
	  	that.panels_enable = "no";
	  	that.interpolate = PykCharts['boolean'](that.curvy_lines_enable) ? "cardinal" : "linear";
		that.w = that.chart_width - that.chart_margin_left - that.chart_margin_right;
		that.h = that.chart_height - that.chart_margin_top - that.chart_margin_bottom;

		that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);

            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }

			that.data = that.k.__proto__._groupBy("area",data);
			that.axis_y_data_format = "number";
    		that.axis_x_data_format = that.k.xAxisDataFormatIdentification(that.data);
    		if(that.axis_x_data_format === "time" && that.axis_x_time_value_datatype === "") {
    			console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to have passed Date data so please pass the value for axis_x_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_15");
    		}
			that.compare_data = that.data;
			that.data_length = that.data.length;
            that.k.remove_loading_bar(id);
			if (that.axis_x_data_format === "string") {
                that.data_sort_enable = "no";
            }
            else {
                that.data_sort_enable = "yes";
                that.data_sort_type = (that.axis_x_data_format === "time") ? "date" : "numerically";
                that.data_sort_order = "ascending";
            }
			PykCharts.multiD.areaFunctions(options,that,"stacked_area");
			that.dataTransformation();
			that.render();
		};
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
	};
};
PykCharts.multiD.areaFunctions = function (options,chartObject,type) {
	var that = chartObject;

	that.dataTransformation = function () {
        that.group_arr = [], that.new_data = [];
        that.ticks = [], that.x_arr = [];

        for(var j = 0;j < that.data_length;j++) {
            that.group_arr[j] = that.data[j].name;
        }
        that.uniq_group_arr = that.k.__proto__._unique(that.group_arr);
        that.uniq_color_arr = [];
        var uniq_group_arr_length = that.uniq_group_arr.length;

        for(var k = 0;k < that.data_length;k++) {
            that.x_arr[k] = that.data[k].x;
        }
        that.uniq_x_arr = that.k.__proto__._unique(that.x_arr);

        for (var k = 0;k < uniq_group_arr_length;k++) {
            if(that.chart_color[k]) {
                that.uniq_color_arr[k] = that.chart_color[k];
            } else {
                for (var l = 0;l < that.data_length;l++) {
                    if (that.uniq_group_arr[k] === that.data[l].name && that.data[l].color) {
                        that.uniq_color_arr[k] = that.data[l].color;
                        break;
                    }
                } if(!PykCharts['boolean'](that.uniq_color_arr[k])) {
                    that.uniq_color_arr[k] = that.default_color[0];
                }
            }
        }

        that.flag = 0;
        for (var k = 0;k < uniq_group_arr_length;k++) {
            that.new_data[k] = {
                    name: that.uniq_group_arr[k],
                    data: [],
                    color: that.uniq_color_arr[k]
            };
            for (var l = 0;l < that.data_length;l++) {
                if (that.uniq_group_arr[k] === that.data[l].name) {
                    that.new_data[k].data.push({
                        x: that.data[l].x,
                        y: that.data[l].y,
                        tooltip: that.data[l].tooltip,
                        annotation: that.data[l].annotation || ""
                    });
                }
            }
        }

        that.new_data_length = that.new_data.length;
        var uniq_x_arr_length = that.uniq_x_arr.length;

        for (var a = 0;a < that.new_data_length;a++) {
            var uniq_x_arr_copy = that.k.__proto__._unique(that.x_arr)
            ,	every_data_length = that.new_data[a].data.length
            for(var b = 0;b < every_data_length;b++) {
                for(var k = 0;k < uniq_x_arr_length;k++) {
                    if(that.new_data[a].data[b].x === uniq_x_arr_copy[k]) {
                        uniq_x_arr_copy[k] = undefined;
                        break;
                    }
                }
            }
            for (var i = 0; i < uniq_x_arr_length ; i++) {
                if (uniq_x_arr_copy[i] != undefined) {
                    var temp_obj_to_insert_in_new_data = {
                        x: uniq_x_arr_copy[i],
                        y: 0,
                        tooltip: 0,
                        annotation: ""
                    };
                    that.new_data[a].data.splice(i, 0, temp_obj_to_insert_in_new_data);
                }
            }
        }
        for (var k = 0;k < that.new_data_length;k++) {
            that.new_data[k].data = that.k.__proto__._sortData(that.new_data[k].data, "x", "name", that);
        }

    };

	that.render = function () {
        var id = that.selector.substring(1,that.selector.length);
		that.container_id = id + "_svg";

		that.dataLineGroup = [], that.dataLineGroupBorder = [];
		that.multid = new PykCharts.multiD.configuration(that);
		that.fillColor = new PykCharts.Configuration.fillChart(that,null,options);
		that.transitions = new PykCharts.Configuration.transition(that);
		that.border = new PykCharts.Configuration.border(that);
		that.xdomain = [];
		that.optional_feature()
		    .chartType();

		try {
			if(that.type === "stackedAreaChart" && type === "area" ) {
				throw "Invalid data in the JSON";
			}

		}
		catch (err) {
            console.error('%c[Error - Pykih Charts] ', 'color: red;font-weight:bold;font-size:14px', " at "+that.selector+".\""+err+"\"  Visit www.pykcharts.com/errors#error_7");
         	return;
		}
		if(that.axis_x_data_format === "time") {
			for(var i = 0;i<that.new_data_length;i++) {
	          	that.new_data[i].data.forEach(function (d) {
		          	d.x = that.k.dateConversion(d.x);
		          	that.xdomain.push(d.x);
	          	});
	          	that.data.forEach(function (d) {
		          	d.x =that.k.dateConversion(d.x);
          		});
	        }
	    }

		if(that.mode === "default") {
			var selector = that.selector.substr(1,that.selector.length);
			d3.selectAll("#tooltip-svg-container-" + 1 + "-pyk-tooltip"+selector)
                .remove();
			that.k.title()
					.backgroundColor(that)
					.export(that,"#"+that.container_id+"-1","areaChart")
					.liveData(that)
					.emptyDiv(that.selector)
					.subtitle()
					.makeMainDiv(that.selector,1)
					.tooltip(true,that.selector,1);

			that.renderChart();

			that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
					.yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width)
					.yGrid(that.svgContainer,that.group,that.yScale,that.legendsGroup_width)
					.xGrid(that.svgContainer,that.group,that.xScale,that.legendsGroup_height)
					.xAxisTitle(that.xGroup,that.legendsGroup_height,that.legendsGroup_width)
					.yAxisTitle(that.yGroup)
					.createFooter()
	                .lastUpdatedAt()
	                .credits()
	                .dataSource();

	        if(PykCharts['boolean'](that.annotation_enable)) {
	        	that.annotation();
	        }
		}
		else if(that.mode === "infographics") {
			  that.k/*.liveData(that)*/
			  			.backgroundColor(that)
			  			.export(that,"#"+that.container_id+"-1","areaChart")
			  			.emptyDiv(that.selector)
						.makeMainDiv(that.selector,1);

			  that.optional_feature()
						.svgContainer(1)
						.legendsContainer()
						.createGroups(1)
						.createChart()
			    		.axisContainer();

		    that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
					.yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width)
					.xAxisTitle(that.xGroup,that.legendsGroup_height,that.legendsGroup_width)
					.yAxisTitle(that.yGroup);
  		}


  		if (PykCharts.boolean(that.interactive_enable)) {
			that.brush = new PykCharts.Configuration.renderBrush(that,that.xScale,that.group,that.h);
		}

		that.k.exportSVG(that,"#"+that.container_id+"-1","areaChart")
  		that.mouseEvent = new PykCharts.crossHairMovement(that);

  		var resize = that.k.resize(that.svgContainer);
        that.k.__proto__._ready(resize);
        window.addEventListener('resize', function(event){
			return that.k.resize(that.svgContainer);
        });
	};

	that.refresh = function (pykquery_data) {
		that.xdomain = [];
		that.executeRefresh = function (data) {
			that.data = that.k.__proto__._groupBy("area",data);
			that.data_length = that.data.length;
			that.dataTransformation();
			var compare = that.k.checkChangeInData(that.data,that.compare_data);
			that.compare_data = compare[0];
			var data_changed = compare[1];

			if(data_changed || (PykCharts['boolean'](that.zoom_enable) && that.count > 1 && that.count <= that.zoom_level) || that.transition_duration) {
				that.k.lastUpdatedAt("liveData");
				that.mouseEvent.tooltipHide();
				that.mouseEvent.crossHairHide(that.type);
				that.mouseEvent.axisHighlightHide(that.selector + " .x.axis");
				that.mouseEvent.axisHighlightHide(that.selector + " .y.axis");
			}
			if(that.axis_x_data_format === "time") {
				for(var i = 0;i<that.new_data_length;i++) {
		          	that.new_data[i].data.forEach(function (d) {
			          	d.x = that.k.dateConversion(d.x);
			          	that.xdomain.push(d.x);
		          	});
		          	that.data.forEach(function (d) {
			          	d.x =that.k.dateConversion(d.x);
	          		});
		        }
		    }
			if(that.type === "stackedAreaChart") {
				document.querySelector(that.selector +" #chart-container-1").innerHTML = null;
				that.renderChart();
			}
			else {
				that.optional_feature().createChart("liveData");
			}

			that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
					.yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width)
					.yGrid(that.svgContainer,that.group,that.yScale,that.legendsGroup_width)
					.xGrid(that.svgContainer,that.group,that.xScale,that.legendsGroup_height);

			if(PykCharts['boolean'](that.annotation_enable)) {
	        	that.annotation();
	        }
		};
		if (PykCharts.boolean(that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
	};

	that.optional_feature = function (){
		var id = that.selector.substring(1,that.selector.length);
		var optional = {
			chartType: function () {
				for(var j = 1;j < that.data_length;j++) {
					if(that.data[0].x === that.data[j].x) {
						that.type = "stackedAreaChart";
						break;
					}
				}
				that.type = that.type || "areaChart";
				return this;
			},
			svgContainer: function (i){
				var element = document.getElementById(id);
				if(!element.classList.contains('PykCharts-line-chart')) {
                    element.className += " PykCharts-twoD PykCharts-line-chart PykCharts-multi-series2D";
                }
				that.svgContainer = d3.select(that.selector+" "+"#chart-container-"+i).append("svg:svg")
					.attr({
						"id": that.container_id+"-"+i,
						"width": that.chart_width,
						"height": that.chart_height,
						"class": "svgcontainer",
						"preserveAspectRatio": "xMinYMin",
	                    "viewBox": "0 0 " + that.chart_width + " " + that.chart_height
					});
    			return this;
			},
			createGroups : function (i) {
				that.group = that.svgContainer.append("g")
					.attr({
						"id": that.type+"-group",
						"transform": "translate("+ that.chart_margin_left +","+ (that.chart_margin_top + that.legendsGroup_height)+")"
					});

				if(PykCharts['boolean'](that.chart_grid_y_enable)){
					that.group.append("g")
						.attr({
							"id": "ygrid",
							"class": "y grid-line"
						});
				}
				if(PykCharts['boolean'](that.chart_grid_x_enable)){
					that.group.append("g")
						.attr({
							"id": "xgrid",
							"class": "x grid-line"
						});
				}

				that.clip = that.svgContainer.append("svg:clipPath")
				    .attr("id","clip" + i + that.selector)
				    .append("svg:rect")
				    .attr({
				    	"width": that.w - that.legendsGroup_width,
				    	"height": that.h - that.legendsGroup_height
				    });

				that.chartBody = that.svgContainer.append("g")
					.attr({
						"id": "clipPath",
						"clip-path": "url(#clip" + i + that.selector + " )",
						"transform": "translate("+ that.chart_margin_left +","+ (that.chart_margin_top+that.legendsGroup_height) +")"
					});

				that.stack_layout = d3.layout.stack()
					.values(function(d) { return d.data; });

    			return this;
			},
			legendsContainer : function (i) {
                if (PykCharts['boolean'](that.legends_enable) && that.type === "stackedAreaChart" && that.mode === "default") {
                    that.legendsGroup = that.svgContainer.append("g")
                                .attr('id',"stackedArea-legends")
                                .style("visibility","visible")
                                .attr("transform","translate(0,10)");
                } else {
                    that.legendsGroup_height = 0;
                    that.legendsGroup_width = 0;
                }
                return this;
            },
			axisContainer : function () {
	        	if(PykCharts['boolean'](that.axis_x_enable) || that.axis_x_title){
					that.xGroup = that.group.append("g")
							.attr({
								"id": "xaxis",
								"class": "x axis"
							});
				}
				if(PykCharts['boolean'](that.axis_y_enable) || that.axis_y_title){
					that.yGroup = that.group.append("g")
						.attr({
							"id": "yaxis",
							"class": "y axis"
						});
				}
	        	return this;
      		},
			createChart : function (evt) {

				that.legend_text = [];
				that.layers = that.stack_layout(that.new_data);

        		var x_domain,x_data = [],y_data,y_range,x_range,y_domain, min_x_tick_value,max_x_tick_value, min_y_tick_value,max_y_tick_value;
        		that.count = 1;

        		that.x_tick_values = that.k.processXAxisTickValues();
                that.y_tick_values = that.k.processYAxisTickValues();

				if(that.axis_y_data_format === "number") {
					max = d3.max(that.layers, function(d) { return d3.max(d.data, function(k) { return k.y0 + k.y; }); });
					min = 0;
         			y_domain = [min,max];
		          	y_data = that.k.__proto__._domainBandwidth(y_domain,1);
					y_range = [that.h - that.legendsGroup_height, 0];

					min_y_tick_value = d3.min(that.y_tick_values);
                    max_y_tick_value = d3.max(that.y_tick_values);

                    if(y_data[0] > min_y_tick_value) {
                        y_data[0] = min_y_tick_value;
                    }
                    if(y_data[1] < max_y_tick_value) {
                        y_data[1] = max_y_tick_value;
                    }

		          	that.yScale = that.k.scaleIdentification("linear",y_data,y_range);
		        }
		        else if(that.axis_y_data_format === "string") {
		          	that.new_data[0].data.forEach(function(d) { y_data.push(d.y); });
		          	y_range = [0,that.h];
		          	that.yScale = that.k.scaleIdentification("ordinal",y_data,y_range,0);
		        }
		        else if (that.axis_y_data_format === "time") {
		          	that.layers.data.forEach(function (k) {
		          		k.y0 = new Date(k.y0);
		          		k.y = new Date(k.y);
		          	});
		          	max = d3.max(that.layers, function(d) { return d3.max(d.data, function(k) { return k.y0 + k.y; }); });
					min = 0;
		         	y_data = [min,max];
		          	y_range = [that.h, 0];

	          	    min_y_tick_value = d3.min(that.y_tick_values, function (d) {
                        return new Date(d);
                    });

                    max_y_tick_value = d3.max(that.y_tick_values, function (d) {
                        return new Date(d);
                    });

                    if(new Date(y_data[0]) > new Date(min_y_tick_value)) {
                        y_data[0] = min_y_tick_value;
                    }
                    if(new Date(y_data[1]) < new Date(max_y_tick_value)) {
                        y_data[1] = max_y_tick_value;
                    }

		          	that.yScale = that.k.scaleIdentification("time",y_data,y_range);

		        }
		        if(that.axis_x_data_format === "number") {
        			max = d3.max(that.new_data, function(d) { return d3.max(d.data, function(k) { return +k.x; }); });
					min = d3.min(that.new_data, function(d) { return d3.min(d.data, function(k) { return +k.x; }); });
         			x_domain = [min,max];
			        x_data = that.k.__proto__._domainBandwidth(x_domain,2);
			        x_range = [0 ,that.w - that.legendsGroup_width];

		            min_x_tick_value = d3.min(that.x_tick_values);
                    max_x_tick_value = d3.max(that.x_tick_values);

                    if(x_data[0] > min_x_tick_value) {
                        x_data[0] = min_x_tick_value;
                    }
                    if(x_data[1] < max_x_tick_value) {
                        x_data[1] = max_x_tick_value;
                    }

			        that.xScale = that.k.scaleIdentification("linear",x_data,x_range);
			        that.extra_left_margin = 0;
			        that.new_data[0].data.forEach(function (d) {
                        that.xdomain.push(+d.x);
                    })
		        }
		        else if(that.axis_x_data_format === "string") {
		          	that.new_data[0].data.forEach(function(d) { x_data.push(d.x); });
		          	x_range = [0 ,that.w - that.legendsGroup_width];
		          	that.xScale = that.k.scaleIdentification("ordinal",x_data,x_range,0);
		          	that.extra_left_margin = (that.xScale.rangeBand() / 2);
		          	that.xdomain = that.xScale.domain()
		        }
		        else if (that.axis_x_data_format === "time") {
		        	max = d3.max(that.new_data, function(d) { return d3.max(d.data, function(k) { return k.x; }); });
					min = d3.min(that.new_data, function(d) { return d3.min(d.data, function(k) { return k.x; }); });
		         	x_data = [min,max];
		          	x_range = [0 ,that.w - that.legendsGroup_width];

	          	    min_x_tick_value = d3.min(that.x_tick_values, function (d) {
                        return that.k.dateConversion(d);
                    });

                    max_x_tick_value = d3.max(that.x_tick_values, function (d) {
                        return that.k.dateConversion(d);
                    });

                    if(new Date(x_data[0]) > new Date(min_x_tick_value)) {
                        x_data[0] = min_x_tick_value;
                    }
                    if(new Date(x_data[1]) < new Date(max_x_tick_value)) {
                        x_data[1] = max_x_tick_value;
                    }

		          	that.xScale = that.k.scaleIdentification("time",x_data,x_range);

		          	that.extra_left_margin = 0;
		          	that.new_data[0].data.forEach(function (d) {
                        that.xdomain.push(d.x);
                    })
		        }
		        that.ydomain = that.yScale.domain();
				that.zoom_event = d3.behavior.zoom();

		      	if(!(that.axis_y_data_format==="string" || that.axis_x_data_format==="string")) {
		      		that.zoom_event.x(that.xScale)
					    .y(that.yScale)
					    .scale(that.count)
					    .on("zoom",that.zoomed);
				} else {
					that.zoom_event.y(that.yScale)
					    .scale(that.count)
					    .on("zoom",that.zoomed);
				}

				if(PykCharts['boolean'](that.zoom_enable) && (that.mode === "default")) {
					that.svgContainer.call(that.zoom_event);
					that.svgContainer.on({
						"wheel.zoom": null,
                    	"mousewheel.zoom": null
					});
				}

				that.chart_path = d3.svg.area()
				    .x(function(d) { return that.xScale(d.x); })
				    .y0(function(d) { return that.yScale(d.y0); })
    				.y1(function(d) { return that.yScale(d.y0 + d.y); })
				    .interpolate(that.interpolate);

				that.chart_path_border = d3.svg.line()
				    .x(function(d) { return that.xScale(d.x); })
				    .y(function(d) { return that.yScale(d.y0 + d.y); })
				    .interpolate(that.interpolate);

				that.chartPathClass = (that.type === "areaChart") ? "area" : "stacked-area";

	        	if(evt === "liveData") {
	        		for (var i = 0;i < that.new_data_length;i++) {
	        			var data = that.new_data[i].data;
	        			type = that.chartPathClass + i;

	        			that.svgContainer.select("#"+type)
							.datum(that.layers[i].data)
							.attr("transform", "translate("+ that.extra_left_margin +",0)")
							.style({
								"stroke": that.border.color(),
			                    "stroke-width": that.border.width(),
			                    "stroke-dasharray": that.border.style()
							});

						function transition1 (i) {
						    that.dataLineGroup[i].transition()
							    .duration(that.transitions.duration())
							    .attrTween("d", function (d) {
							    	var interpolate = d3.scale.quantile()
						                .domain([0,1])
						                .range(d3.range(1, data.length + 1));
							        return function(t) {
							            return that.chart_path(that.new_data[i].data.slice(0, interpolate(t)));
							        };
							    });
						}

						transition1(i);

						that.svgContainer.select("#border-stacked-area"+i)
							.datum(that.layers[i].data)
							.attr("transform", "translate("+ that.extra_left_margin +",0)");

					    function borderTransition1 (i) {
						    that.dataLineGroupBorder[i].transition()
							    .duration(that.transitions.duration())
							    .attrTween("d", function (d) {
							    	var interpolate = d3.scale.quantile()
						                .domain([0,1])
						                .range(d3.range(1, that.layers[i].data.length + 1));
							        return function(t) {
							            return that.chart_path_border(that.layers[i].data.slice(0, interpolate(t)));
							        };
				 			    })
						}
						borderTransition1(i);
					}
					if(that.type === "areaChart") {
						that.svgContainer
							.on('mouseout',function (d) {
			          			that.mouseEvent.tooltipHide();
			          			that.mouseEvent.crossHairHide(that.type);
								that.mouseEvent.axisHighlightHide(that.selector + " .x.axis");
								that.mouseEvent.axisHighlightHide(that.selector + " .y.axis");
		          			})
							.on("mousemove", function(){
								that.mouseEvent.crossHairPosition(that.new_data,that.xScale,that.yScale,that.dataLineGroup,that.extra_left_margin,that.xdomain,that.type,that.tooltip_mode);
					  		});
					}
				}
				else {
					for (var i = 0;i < that.new_data_length;i++) {
						var data = that.new_data[i].data;
						type = that.chartPathClass + i;
						that.dataLineGroup[i] = that.chartBody.append("path");
						that.dataLineGroup[i]
							.datum(that.layers[i].data)
							.attr({
								"class": that.chartPathClass,
								"id": type,
								"fill-opacity": function() {
									if(that.type === "stackedAreaChart" && that.color_mode === "saturation") {
										return (i+1)/that.new_data.length;
									}
								},
								"data-fill-opacity": function () {
			                        return d3.select(this).attr("fill-opacity");
			                    },
								"transform": "translate("+ that.extra_left_margin +",0)",
								"data-id":function (d,i) {
	                                return that.new_data[i];
	                            }
							})
							.style("fill", function(d) {
								return that.fillColor.colorPieMS(that.new_data[i],that.type);
							});

						function transition (i) {
						    that.dataLineGroup[i].transition()
							    .duration(that.transitions.duration())
							    .attrTween("d", function (d) {
							    	var interpolate = d3.scale.quantile()
						                .domain([0,1])
						                .range(d3.range(1, data.length + 1));
							        return function(t) {
							            return that.chart_path(that.new_data[i].data.slice(0, interpolate(t)));
							        };
							    });
						}
						transition(i);

						that.dataLineGroupBorder[i] = that.chartBody.append("path");
						that.dataLineGroupBorder[i]
							.datum(that.layers[i].data)
							.attr({
								"class": "area-border",
								"id": "border-stacked-area"+i,
								"transform": "translate("+ that.extra_left_margin +",0)"
							})
							.style({
								"stroke": that.border.color(),
			                    "stroke-width": that.border.width(),
			                    "stroke-dasharray": that.border.style(),
			                    "pointer-events": "none"
							});

						function borderTransition (i) {
						    that.dataLineGroupBorder[i].transition()
							    .duration(that.transitions.duration())
							    .attrTween("d", function (d) {
							    	var interpolate = d3.scale.quantile()
						                .domain([0,1])
						                .range(d3.range(1, that.layers[i].data.length + 1));
							        return function(t) {
							            return that.chart_path_border(that.layers[i].data.slice(0, interpolate(t)));
							        };
							    });
						}
						borderTransition(i);

					}

					that.svgContainer
						.on('mouseout', function (d) {
							that.mouseEvent.tooltipHide();
							that.mouseEvent.crossHairHide(that.type);
							that.mouseEvent.axisHighlightHide(that.selector + " .x.axis");
							that.mouseEvent.axisHighlightHide(that.selector + " .y.axis");
						})
						.on("mousemove", function() {
							if(that.type === "areaChart") {
								that.mouseEvent.crossHairPosition(that.new_data,that.xScale,that.yScale,that.dataLineGroup,that.extra_left_margin,that.xdomain,that.type,that.tooltip_mode);
							} else if(that.type === "stackedAreaChart") {
								var line = [];
								line[0] = d3.select(that.selector+" #"+this.id+" .stacked-area");
								that.mouseEvent.crossHairPosition(that.new_data,that.xScale,that.yScale,line,that.extra_left_margin,that.xdomain,that.type,that.tooltipMode,that.color_from_data,"no");
							}
						});

				}
				d3.selectAll(that.selector + " ." +that.chartPathClass)
					.on({
						"mouseover": function () {
							if(that.mode === "default") {
								that.mouseEvent.highlight(that.selector + " ."+that.chartPathClass,this);
							}
						},
						"mouseout": function () {
							if(that.mode === "default") {
								that.mouseEvent.highlightHide(that.selector + " ."+that.chartPathClass);
							}
						}
					});
				return this;
			},
			legends: function () {
                if (PykCharts['boolean'](that.legends_enable) && that.type === "stackedAreaChart" && that.mode==="default") {
        			that.multid.legendsPosition(that,"stackedArea",that.new_data);
                }
                return this;
            }
		};
		return optional;
	};

	that.zoomed = function() {
		that.k.isOrdinal(that.svgContainer,".x.axis",that.xScale,that.xdomain,that.extra_left_margin);
	    that.k.isOrdinal(that.svgContainer,".x.grid",that.xScale);
	    that.k.isOrdinal(that.svgContainer,".y.axis",that.yScale,that.ydomain);
	    that.k.isOrdinal(that.svgContainer,".y.grid",that.yScale);

	    for (i = 0;i < that.new_data_length;i++) {
	    	type = that.chartPathClass + i;
	  	 	that.svgContainer.select(that.selector+" #"+type)
	  	 		.attr({
	  	 			"class": that.chartPathClass,
		        	"d": that.chart_path
	  	 		});
		    that.svgContainer.select(that.selector+" #border-stacked-area"+i)
		    	.attr({
		    		"class": "area-border",
					"d": that.chart_path_border
		    	});
	    }
	    if(PykCharts.getEvent().sourceEvent.type === "dblclick") {
	    	that.count++;
	    }
	    that.mouseEvent.tooltipHide();
		that.mouseEvent.crossHairHide(that.type);
		that.mouseEvent.axisHighlightHide(that.selector + " .x.axis");
		that.mouseEvent.axisHighlightHide(that.selector + " .y.axis");
	    if(that.count === that.zoom_level+1) {
	    	that.zoomOut();
	    }
	    if(PykCharts['boolean'](that.annotation_enable)) {
        	that.annotation();
        }
	};

	that.zoomOut =  function () {
		that.optional_feature().createChart("liveData");
    	that.k.isOrdinal(that.svgContainer,".x.axis",that.xScale,that.xdomain,that.extra_left_margin);
	    that.k.isOrdinal(that.svgContainer,".x.grid",that.xScale);
	    that.k.isOrdinal(that.svgContainer,".y.axis",that.yScale,that.ydomain);
	    that.k.isOrdinal(that.svgContainer,".y.grid",that.yScale);
	};

	that.onBrush = function (min,max) {
        that.addEvents(min,max);

    };

	that.annotation = function () {
		that.line = d3.svg.line()
				.interpolate('linear-closed')
                .x(function(d,i) { return d.x; })
                .y(function(d,i) { return d.y; });
        var arrow_size = 12,annotation = [];
		if(that.type === "areaChart") {
			that.new_data[0].data.map(function (d) {
				if(d.annotation) {
					annotation.push({
						annotation : d.annotation,
						x : d.x,
						y : d.y
					})
				}
			});
		} else if(that.type === "stackedAreaChart" && that.mode === "default") {

			for(i=0;i<that.new_data_length;i++) {
				that.new_data[i].data.map(function (d) {
					if(d.annotation) {
						annotation.push({
							annotation : d.annotation,
							x : d.x,
							y : d.y + d.y0
						});
					}
				});
			}
		}
		var anno = that.svgContainer.selectAll(" .PykCharts-annotation-line")
            .data(annotation);
        anno.enter()
            .append("path");

        anno.attr("d", function (d,i) {
            	var a = [
            		{
            			x:parseInt(that.xScale(d.x))+that.extra_left_margin+that.chart_margin_left,
            			y:parseInt(that.yScale(d.y)-(arrow_size)+that.chart_margin_top+that.legendsGroup_height)
            		},
            		{
            			x:parseInt(that.xScale(d.x))+that.extra_left_margin+that.chart_margin_left,
            			y:parseInt(that.yScale(d.y)-(arrow_size)+that.chart_margin_top+that.legendsGroup_height)
            		}
            	];
            	return that.line(a);
            })
        function setTimeoutAnnotation () {
        	anno.attr("class", "PykCharts-annotation-line")
	            .attr("d", function (d,i) {
	            	var a = [
                		{
                			x:parseInt(that.xScale(d.x)-(arrow_size*0.5))+that.extra_left_margin+that.chart_margin_left,
                			y:parseInt(that.yScale(d.y)-(arrow_size)+that.chart_margin_top+that.legendsGroup_height)
                		},
                		{
                			x:parseInt(that.xScale(d.x)+(arrow_size*0.5))+that.extra_left_margin+that.chart_margin_left,
                			y:parseInt(that.yScale(d.y)-(arrow_size)+that.chart_margin_top+that.legendsGroup_height)
                		},
                		{
                			x:parseInt(that.xScale(d.x))+that.extra_left_margin+that.chart_margin_left,
                			y:parseInt(that.yScale(d.y)+that.chart_margin_top+that.legendsGroup_height),
                		}
            		];
	            	return that.line(a);
	            })
				.attr("fill",that.annotation_background_color);
        }
        setTimeout(setTimeoutAnnotation, that.transitions.duration());

        anno.exit().remove();
        that.k.annotation(that.selector + " #"+that.container_id+"-1",annotation,that.xScale,that.yScale)
	};

	that.renderChart =  function () {
		that.optional_feature()
				.svgContainer(1)
				.legendsContainer()
				.legends()
				.createGroups(1)
				.createChart()
	    		.axisContainer();

	    that.k.crossHair(that.svgContainer,that.new_data_length,that.new_data,that.fillColor,that.type);
	};
};
PykCharts.multiD.bar = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});
    var multiDimensionalCharts = theme.multiDimensionalCharts;
    this.execute = function (pykquery_data) {
        that = new PykCharts.validation.processInputs(that, options, 'multiDimensionalCharts');
        PykCharts.scaleFunction(that);
        that.data_sort_enable = options.data_sort_enable ? options.data_sort_enable.toLowerCase() : multiDimensionalCharts.data_sort_enable;
        that.data_sort_type = PykCharts['boolean'](that.data_sort_enable) && options.data_sort_type ? options.data_sort_type.toLowerCase() : multiDimensionalCharts.data_sort_type;
        that.data_sort_order = PykCharts['boolean'](that.data_sort_enable) && options.data_sort_order ? options.data_sort_order.toLowerCase() : multiDimensionalCharts.data_sort_order;
        try{
            if(that.data_sort_order === "ascending" || that.data_sort_order === "descending") {
            } else {
                that.data_sort_order = multiDimensionalCharts.data_sort_order;
                throw "data_sort_order";
            }
        }
        catch(err) {
            that.k.warningHandling(err,"9");
        }

        if(that.stop){
            return;
        }
        that.k.storeInitialDivHeight();
        that.panels_enable = "no";
        if(that.mode === "default") {
           that.k.loading();
        }

        that.multiD = new PykCharts.multiD.configuration(that);
            that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }
            that.data = that.k.__proto__._groupBy("bar",data);
            that.compare_data = that.k.__proto__._groupBy("bar",data);
            that.axis_x_data_format = "number";
            that.axis_y_data_format = that.k.yAxisDataFormatIdentification(that.data);
            if(that.axis_y_data_format === "time") {
                that.axis_y_data_format = "string";
            }
            that.k.remove_loading_bar(id);
            that.render();
        };
        if (PykCharts.boolean(that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };

    this.transformData = function () {
        var group_arr = [], uniq_group_arr = [];

        that.optionalFeatures().sort();
        if (options.chart_color != undefined && options.chart_color.length != 0) {
            that.chart_color[0] = options.chart_color[0];
        }
        else {
            for (var i=0,len=that.data.length ; i<len ; i++) {
                if (that.data[i].color != undefined && that.data[i].color != "") {
                    that.chart_color[0] = that.data[i].color;
                    if (options.axis_y_pointer_color == undefined || options.axis_y_pointer_color == "") {
                        that.axis_y_pointer_color = that.chart_color[0];
                    }
                    break;
                }
            }

        }
        that.data.forEach(function(d) {
            d.x = (that.axis_x_data_format === "number") ? parseFloat(d.x) : d.x;
            d.name = d.y;
            d.color = that.chart_color[0];
        });

        for(var j=0, len=that.data.length ; j<len ; j++) {
            group_arr[j] = that.data[j].group;
        }
        uniq_group_arr = that.k.__proto__._unique(group_arr);
        that.no_of_groups = uniq_group_arr.length;
    }

    this.render = function () {
        var id = that.selector.substring(1,that.selector.length),
            container_id = id + "_svg";

        that.border = new PykCharts.Configuration.border(that);
        that.transitions = new PykCharts.Configuration.transition(that);
        // that.mouseEvent1 = new PykCharts.multiD.mouseEvent(options);
        that.mouseEvent1 = new PykCharts.Configuration.mouseEvent(options);
        that.fillColor = new PykCharts.Configuration.fillChart(that,null,options);
        that.transformData();

        try {
            if(that.no_of_groups > 1) {
                throw "Invalid data in the JSON";
            }
        }
        catch (err) {
            console.error('%c[Error - Pykih Charts] ', 'color: red;font-weight:bold;font-size:14px', " at "+that.selector+". \""+err+"\"  Visit www.pykcharts.com/errors#error_9");
            return;
        }

        that.map_group_data = that.multiD.mapGroup(that.data);

        if(that.mode === "default") {

            that.k.title()
                .backgroundColor(that)
                .export(that,"#"+container_id,"barChart")
                .emptyDiv(that.selector)
                .subtitle()
                .makeMainDiv(that.selector,1);

            that.optionalFeatures()
                .svgContainer(container_id,1)
                .createGroups();

            that.k.liveData(that)
                .tooltip()
                .createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource();

            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);

            that.optionalFeatures()
                .createColumn()
                .axisContainer()
                .ticks();

            that.k.xAxis(that.svgContainer,that.xgroup,that.xScale,that.extra_left_margin,that.x_domain,that.x_tick_values)
                .xAxisTitle(that.xgroup)
                .yAxisTitle(that.ygroup);
            if(that.axis_y_data_format !== "string") {
                that.k.yAxis(that.svgContainer,that.ygroup,that.yScale,that.y_domain,that.y_tick_values,null,"bar",null,that);
                that.optionalFeatures().newYAxis();
            } else {
                that.k.yAxis(that.svgContainer,that.ygroup,that.yScale,that.y_domain,that.y_tick_values,null,null,null,that);
            }
        } else if(that.mode === "infographics") {
            that.k.backgroundColor(that)
                .export(that,"#"+container_id,"barChart")
                .emptyDiv(that.selector)
                .makeMainDiv(that.selector,1);

            that.optionalFeatures()
                .svgContainer(container_id,1)
                .createGroups();

            that.k.liveData(that)
                .tooltip();

            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);

            that.optionalFeatures()
                .createColumn()
                .axisContainer()
                .ticks();

            that.k.xAxis(that.svgContainer,that.xgroup,that.xScale,that.extra_left_margin,that.x_domain,that.x_tick_values)
                .xAxisTitle(that.xgroup)
                .yAxisTitle(that.ygroup);
            if(that.axis_y_data_format !== "string") {
                that.k.yAxis(that.svgContainer,that.ygroup,that.yScale,that.y_domain,that.y_tick_values,null,"bar",null,that);
                that.optionalFeatures().newYAxis();
            } else {
                that.k.yAxis(that.svgContainer,that.ygroup,that.yScale,that.y_domain,that.y_tick_values,null,null,null,that);
            }
        }
        that.k.exportSVG(that,"#"+container_id,"barChart")

        var resize = that.k.resize(that.svgContainer);
        that.k.__proto__._ready(resize);
        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer,"");
        });
    };

    this.refresh = function (pykquery_data) {
       that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("bar",data);
            that.refresh_data = that.k.__proto__._groupBy("bar",data);
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            that.transformData();

            if(that.axis_x_data_format === "time") {
                that.data.forEach(function (d) {
                    d.x =that.k.dateConversion(d.x);
                });
            }

            that.map_group_data = that.multiD.mapGroup(that.data);

            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }

            that.optionalFeatures()
                .createColumn()
                .ticks();

            that.k.xAxis(that.svgContainer,that.xgroup,that.xScale,that.extra_left_margin,that.x_domain,that.x_tick_values);
            if(that.axis_y_data_format !== "string") {
                that.k.yAxis(that.svgContainer,that.ygroup,that.yScale,that.y_domain,that.y_tick_values,null,"bar");
                that.optionalFeatures().newYAxis();
            } else {
                that.k.yAxis(that.svgContainer,that.ygroup,that.yScale,that.y_domain,that.y_tick_values);
            }
        };

        if (PykCharts.boolean(that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
    };

    this.optionalFeatures = function () {
        var id = that.selector.substring(1,that.selector.length);
        var status;
        var optional = {
            svgContainer: function (container_id,i) {
                document.getElementById(id).className += " PykCharts-twoD";
                that.svgContainer = d3.select(that.selector + " #chart-container-" + i)
                    .append("svg:svg")
                    .attr({
                        "width" : that.chart_width,
                        "height" : that.chart_height,
                        "id" : container_id,
                        "class" : "svgcontainer",
                        "preserveAspectRatio" : "xMinYMin",
                        "viewBox" : "0 0 " + that.chart_width + " " + that.chart_height
                    });
                return this;
            },
            createGroups: function (i) {
                that.group = that.svgContainer.append("g")
                    .attr({
                       "id" : "bar-group",
                       "transform" : "translate(" + that.chart_margin_left + "," + (that.chart_margin_top) +")"
                    });

                if(PykCharts.boolean(that.chart_grid_y_enable)) {
                    that.group.append("g")
                        .attr({
                            "id" : "ygrid",
                            "class" : "y grid-line"
                        });
                }
                return this;
            },
            newYAxis : function () {
                if(PykCharts["boolean"](that.axis_y_enable)) {
                    if(that.axis_y_position === "right") {
                        gsvg.attr("transform", "translate(" + (that.chart_width - that.chart_margin_left - that.chart_margin_right) + ",0)");
                    }
                    var yaxis = d3.svg.axis()
                        .scale(that.yScale)
                        .orient(that.axis_y_pointer_position)
                        .tickSize(0)
                        .outerTickSize(that.axis_y_outer_pointer_length);

                    that.new_yAxisgroup.style("stroke",function () { return that.axis_y_line_color; })
                        .call(yaxis);

                    d3.selectAll(that.selector + " .y.new-axis text")
                        .style({
                            "display" : function () { return "none"; },
                            "stroke" : "none"
                        });
                }
                return this;
            },
            axisContainer : function () {
                if(PykCharts.boolean(that.axis_x_enable)  || that.axis_x_title) {
                    that.xgroup = that.group.append("g")
                        .attr({
                            "id" : "xaxis",
                            "class" : "x axis"
                        })
                        .style("stroke","none");
                }

                if(PykCharts.boolean(that.axis_y_enable)  || that.axis_y_title) {
                    that.ygroup = that.group.append("g")
                        .attr({
                            "id" : "yaxis",
                            "class" : "y axis"
                        });

                    that.new_yAxisgroup = that.group.append("g")
                        .attr({
                            "id" : "new-yaxis",
                            "class" : "y new-axis"
                        })
                        .style("stroke","blue");
                }
                return this;
            },
            createColumn: function () {
                that.x_tick_values = that.k.processXAxisTickValues();
                that.y_tick_values = that.k.processYAxisTickValues();
                that.reducedWidth = that.chart_width - that.chart_margin_left - that.chart_margin_right;
                that.reducedHeight = that.chart_height - that.chart_margin_top - that.chart_margin_bottom;
                var height = that.chart_height - that.chart_margin_top - that.chart_margin_bottom;
                var x_domain,x_data = [],y_data = [],y_range,x_range,y_domain, min_x_tick_value,max_x_tick_value, min_y_tick_value,max_y_tick_value;

                if(that.axis_y_data_format === "number") {
                    y_domain = [0,d3.max(that.data,function (d) { return d.y; })];
                    y_data = that.k._domainBandwidth(y_domain,1);
                    y_range = [that.chart_height - that.chart_margin_top - that.chart_margin_bottom, 0];
                    min_y_tick_value = d3.min(that.y_tick_values);
                    max_y_tick_value = d3.max(that.y_tick_values);

                    if(y_data[0] > min_y_tick_value) {
                        y_data[0] = min_y_tick_value;
                    }
                    if(y_data[1] < max_y_tick_value) {
                        y_data[1] = max_y_tick_value;
                    }
                    that.data.sort(function (a,b) {
                        return a.y - b.y;
                    })
                    that.yScale1 = that.k.scaleIdentification("linear",y_data,y_range);
                    y_data1 = that.data.map(function (d) { return d.y; });
                    y_range1 = [0,that.chart_height - that.chart_margin_top - that.chart_margin_bottom];
                    that.yScale = that.k.scaleIdentification("ordinal",y_data1,y_range1,0.3);
                    that.extra_top_margin = (that.yScale.rangeBand() / 2);

                } else if(that.axis_y_data_format === "string") {
                    y_data = that.data.map(function (d) { return d.y; });
                    y_range = [0,that.chart_height - that.chart_margin_top - that.chart_margin_bottom];
                    that.yScale = that.k.scaleIdentification("ordinal",y_data,y_range,0.3);
                    that.extra_top_margin = (that.yScale.rangeBand() / 2);

                }

                if(that.axis_x_data_format === "number") {
                    x_domain = [0,d3.max(that.data,function (d) {  return +d.x; })];
                    x_data = that.k._domainBandwidth(x_domain,1);
                    x_range = [0 ,that.reducedWidth];
                    min_x_tick_value = d3.min(that.x_tick_values);
                    max_x_tick_value = d3.max(that.x_tick_values);

                    if(x_data[0] > min_x_tick_value) {
                        x_data[0] = min_x_tick_value;
                    }
                    if(x_data[1] < max_x_tick_value) {
                        x_data[1] = max_x_tick_value;
                    }

                    that.xScale = that.k.scaleIdentification("linear",x_data,x_range);
                    that.extra_left_margin = 0;
                }

                that.x_domain = that.xScale.domain();
                that.y_domain = that.yScale.domain();

                that.bar = that.group.selectAll(".bar-rect")
                    .data(that.data);

                that.bar.enter()
                    .append("g")
                    .attr("class","bar-rect")
                    .append("svg:rect");

                that.bar.attr("class","bar-rect")
                    .select("rect")
                    .attr({
                        "class" : "hbar",
                        "y" :  function (d) { return that.yScale(d.y); },
                        "x" : 0,
                        "height" : function (d) {return that.yScale.rangeBand(d.y);},
                        "width" : 0,
                        "fill" : function (d) { return that.fillColor.colorPieMS(d); },
                        "stroke" : that.border.color(),
                        "stroke-width" : that.border.width(),
                        "stroke-dasharray": that.border.style(),
                        "data-id":function (d,i) {
                            return d.name;
                        }
                    })
                    .on({
                        'mouseover': function (d) {
                            if(that.mode === "default") {
                                if(PykCharts.boolean(that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent1.highlight(that.selector+" "+".hbar", this);
                                }
                                if (PykCharts['boolean'](that.tooltip_enable)) {
                                    that.mouseEvent.tooltipPosition(d);
                                    that.mouseEvent.tooltipTextShow(d.tooltip ? d.tooltip : d.x);
                                }
                            }
                        },
                        'mouseout': function (d) {
                            if(that.mode === "default") {
                                if(PykCharts.boolean(that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent1.highlightHide(that.selector+" "+".hbar");
                                }
                                if (PykCharts['boolean'](that.tooltip_enable)) {
                                    that.mouseEvent.tooltipHide(d);
                                }
                                that.mouseEvent.axisHighlightHide(that.selector+" "+".y.axis")
                            }
                        },
                        'mousemove': function (d) {
                            if(that.mode === "default") {
                                if (PykCharts['boolean'](that.tooltip_enable)) {
                                    that.mouseEvent.tooltipPosition(d);
                                }
                                that.mouseEvent.axisHighlightShow([d.y],that.selector+" "+".y.axis",that.y_domain);
                            }
                        },
                        'click': function (d,i) {
                            if(PykCharts['boolean'](that.click_enable)){
                               that.addEvents(d.name, d3.select(this).attr("data-id"));
                            }
                        }
                    })
                    .transition()
                    .duration(that.transitions.duration())
                    .attr("width", function (d) { return that.xScale(d.x); });

                that.bar.exit()
                    .remove();

                var t = d3.transform(d3.select(d3.selectAll(that.selector + ' .bar-rect')[0][(that.data.length-1)]).attr("transform")),
                    x = t.translate[0],
                    y = t.translate[1];
                y_range = [(that.reducedHeight - y - (that.yScale.rangeBand()/2)),(y + (that.yScale.rangeBand()/2))];
                that.yScale1 = that.k.scaleIdentification("linear",y_data,y_range);
                return this;
            },
            ticks: function() {
                if(that.pointer_size) {
                    var tick_label = that.group.selectAll(".ticks_label")
                        .data(that.data);

                    tick_label.enter()
                        .append("text")

                    tick_label.attr("class","ticks_label")
                        .attr("fill", that.pointer_color)
                        .style({
                            "font-weight": that.pointer_weight,
                            "font-size": that.pointer_size + "px",
                            "font-family": that.pointer_family
                        })
                        .text("");

                    function setTimeoutTicks () {
                        tick_label
                            .attr({
                                "x" : function (d) { return that.xScale(d.x); },
                                "y" : function (d) { return that.yScale(d.name) + that.yScale.rangeBand(d.y)/2; },
                                "dx" : 4,
                                "dy" : 4,
                            })
                            .text(function (d) {
                                return d.x;
                            });
                    }
                    setTimeout(setTimeoutTicks ,that.transitions.duration());

                }
                return this;
            },
            sort : function () {
                if(that.axis_y_data_format === "string") {
                    try {
                        if(that.data_sort_type === "alphabetically" || that.data_sort_type === "numerically") {
                        } else {
                            that.data_sort_type = multiDimensionalCharts.data_sort_type;
                            throw "data_sort_type";
                        }
                    }
                    catch(err) {
                        that.k.warningHandling(err,"8");
                    }
                    var column_to_be_sorted = "";
                    switch (that.data_sort_type) {
                        case "alphabetically":
                        case "date":
                            column_to_be_sorted = "y";
                            break;
                        case "numerically":
                            column_to_be_sorted = "x";
                            break;
                    }
                    that.data = that.k.__proto__._sortData(that.data, column_to_be_sorted, "group", that,"notApplicable");
                }
            }
        };
        return optional;
    };
};
PykCharts.multiD.groupedBar = function(options){
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});
    var multiDimensionalCharts = theme.multiDimensionalCharts;
    this.execute = function (pykquery_data) {
        that = new PykCharts.validation.processInputs(that, options, 'multiDimensionalCharts');
        PykCharts.scaleFunction(that);
        that.data_sort_enable = options.data_sort_enable ? options.data_sort_enable.toLowerCase() : multiDimensionalCharts.data_sort_enable;
        that.data_sort_type = PykCharts['boolean'](that.data_sort_enable) && options.data_sort_type ? options.data_sort_type.toLowerCase() : multiDimensionalCharts.data_sort_type;
        that.data_sort_order = PykCharts['boolean'](that.data_sort_enable) && options.data_sort_order ? options.data_sort_order.toLowerCase() : multiDimensionalCharts.data_sort_order;

        try {
            if(that.data_sort_order === "ascending" || that.data_sort_order === "descending") {
            } else {
                that.data_sort_order = multiDimensionalCharts.data_sort_order;
                throw "data_sort_order";
            }
        }
        catch(err) {
            that.k.warningHandling(err,"9");
        }

        if(that.stop){
            return;
        }
        that.k.storeInitialDivHeight();
        that.panels_enable = "no";

        if(that.mode === "default") {
           that.k.loading();
        }
        that.multiD = new PykCharts.multiD.configuration(that);

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }
            that.data = that.k.__proto__._groupBy("bar",data);
            that.compare_data = that.k.__proto__._groupBy("bar",data);
            that.axis_x_data_format = "number";
            that.axis_y_data_format = that.k.yAxisDataFormatIdentification(that.data);
            if(that.axis_y_data_format === "time") {
                that.axis_y_data_format = "string";
            }
            that.k.remove_loading_bar(id);
            // PykCharts.multiD.columnFunctions(options,that,"group_bar");
            that.render();
        };
        if (PykCharts.boolean(that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }

    };

    that.dataTransformation = function () {
        if(PykCharts['boolean'](that.data_sort_enable)) {
            that.data = that.optionalFeatures().sort(that.data,"group");
        }
        that.group_arr = [], that.new_data = [];
        that.data_length = that.data.length;
        for(var j = 0;j < that.data_length;j++) {
            that.group_arr[j] = that.data[j].y;
        }
        that.uniq_group_arr = that.k.__proto__._unique(that.group_arr);
        var len = that.uniq_group_arr.length;

        for (var k = 0;k < len;k++) {
            that.new_data[k] = {
                name: that.uniq_group_arr[k],
                data: []
            };
            for (var l = 0;l < that.data_length;l++) {
                if (that.uniq_group_arr[k] === that.data[l].y) {
                    that.new_data[k].data.push({
                        x: that.data[l].x,
                        name: that.data[l].group,
                        tooltip: that.data[l].tooltip,
                        color: that.data[l].color
                    });
                }
            }
        }

        that.new_data_length = that.new_data.length;
        if(!PykCharts['boolean'](that.data_sort_enable)) {
            for(var i = 0;i<that.new_data_length;i++) {
                that.new_data[i].data = that.optionalFeatures().sort(that.new_data[i].data,"name");
            }
        }
    };

    that.refresh = function (pykquery_data) {
        that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("bar",data);
            that.refresh_data = that.k.__proto__._groupBy("bar",data);
            that.dataTransformation();
            that.optionalFeatures().mapColors();

            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }

            that.optionalFeatures()
                .createChart()
                .legends()
                .ticks()
                .highlightRect();

            that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height);
            if(that.axis_y_data_format !== "string") {
                that.k.yAxis(that.svgContainer,that.yGroup,that.yScale1,that.ydomain,that.y_tick_values,that.legendsGroup_width,"groupbar");
                that.optionalFeatures().newYAxis();
            } else {
                that.k.yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width);
            }
        };
        if (PykCharts.boolean(that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
    };

    that.render = function() {
        var that = this,
            id = that.selector.substring(1,that.selector.length),
            container_id = id + "_svg";

        that.dataTransformation();
        that.optionalFeatures().mapColors();
        that.border = new PykCharts.Configuration.border(that);
        that.transitions = new PykCharts.Configuration.transition(that);
        // that.mouseEvent1 = new PykCharts.multiD.mouseEvent(that);
        that.mouseEvent1 = new PykCharts.Configuration.mouseEvent(that);
        that.fillColor = new PykCharts.Configuration.fillChart(that,null,options);

        if(that.mode === "default") {
            that.k.title()
                .backgroundColor(that)
                .export(that,"#"+container_id,"groupbarChart")
                .emptyDiv(that.selector)
                .subtitle()
                .makeMainDiv(that.selector,1);

            that.optionalFeatures()
                .svgContainer(container_id,1)
                .legendsContainer(1);

            that.k.liveData(that)
                .tooltip()
                .createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource();

            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);

            that.optionalFeatures()
                .legends()
                .createGroups(1)
                .createChart()
                .axisContainer()
                .highlightRect()
                .ticks();

            that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
                .xAxisTitle(that.xGroup)
                .yAxisTitle(that.yGroup);
            if(that.axis_y_data_format !== "string") {
                that.k.yAxis(that.svgContainer,that.yGroup,that.yScale1,that.ydomain,that.y_tick_values,that.legendsGroup_width,"groupbar");
                that.optionalFeatures().newYAxis();
            } else {
                that.k.yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width);
            }
        } else if(that.mode === "infographics") {
            that.k.backgroundColor(that)
                .export(that,"#"+container_id,"groupbarChart")
                .emptyDiv(that.selector)
                .makeMainDiv(that.selector,1);

            that.optionalFeatures().svgContainer(container_id,1)
                .legendsContainer(1)
                .createGroups(1)
                .createChart()
                .axisContainer()
                .highlightRect();

            that.k.tooltip();
            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
            that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
                .xAxisTitle(that.xGroup)
                .yAxisTitle(that.yGroup);
            if(that.axis_y_data_format !== "string") {
                that.k.yAxis(that.svgContainer,that.yGroup,that.yScale1,that.ydomain,that.y_tick_values,that.legendsGroup_width,"groupbar");
                that.optionalFeatures().newYAxis();
            } else {
                that.k.yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width);
            }
        }

        that.k.exportSVG(that,"#"+container_id,"groupbarChart")

        var resize = that.k.resize(that.svgContainer);
        that.k.__proto__._ready(resize);
        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer);
        });
    };

    that.optionalFeatures = function() {
        var that = this;
        var id = that.selector.substring(1,that.selector.length);
        var optional = {
            svgContainer: function (container_id,i) {
                document.getElementById(id).className += " PykCharts-twoD";
                that.svgContainer = d3.select(that.selector + " #chart-container-" + i)
                    .append("svg:svg")
                    .attr({
                        "width" : that.chart_width,
                        "height" : that.chart_height,
                        "id" : container_id,
                        "class" : "svgcontainer",
                        "preserveAspectRatio" : "xMinYMin",
                        "viewBox" : "0 0 " + that.chart_width + " " + that.chart_height
                    });
                return this;
            },
            createGroups: function (i) {
                that.group = that.svgContainer.append("g")
                    .attr({
                        "id" : "groupedBar-group",
                        "transform" : "translate(" + that.chart_margin_left + "," + (that.chart_margin_top + that.legendsGroup_height) +")"
                    });

                return this;
            },
            legendsContainer: function (i) {
                if(PykCharts.boolean(that.legends_enable) && that.mode === "default") {
                    that.legendsGroup = that.svgContainer.append("g")
                        .attr({
                            "id" : "groupedBar-legends",
                            "class" : "legends",
                            "transform" : "translate(0,10)"
                        })
                        .style("visibility","hidden");
                } else {
                    that.legendsGroup_height = 0;
                    that.legendsGroup_width = 0;
                }
                return this;
            },
            axisContainer : function () {
                if(PykCharts.boolean(that.axis_x_enable) || that.axis_x_title) {
                    that.xGroup = that.group.append("g")
                        .attr({
                            "class" : "x axis",
                            "id" : "xaxis"
                        })
                        .style("stroke","black");
                }

                if(PykCharts.boolean(that.axis_y_enable) || that.axis_y_title) {
                    that.yGroup = that.group.append("g")
                        .attr({
                            "class" : "y axis",
                            "id" : "yaxis"
                        })
                        .style("stroke","blue");
                    that.new_yAxisgroup = that.group.append("g")
                        .attr({
                            "class" : "y new-axis",
                            "id" : "new-yaxis"
                        })
                        .style("stroke","blue");

                }
                return this;
            },
            createChart: function() {
                that.reduced_width = that.chart_width - that.chart_margin_left - that.chart_margin_right - that.legendsGroup_width;

                that.reduced_height = that.chart_height - that.chart_margin_top - that.chart_margin_bottom - that.legendsGroup_height;

                that.getuniqueGroups = that.data.map(function (d) {
                    return d.group;
                })


                that.getuniqueGroups = that.k.__proto__._unique(that.getuniqueGroups)

                that.getuniqueGroups.sort(function(a,b){
                    if(a > b) {
                        return 1;
                    } else {
                        return -1
                    }
                })

                that.x_tick_values = that.k.processXAxisTickValues();
                that.y_tick_values = that.k.processYAxisTickValues();

                var x_domain,x_data = [],y_data,y_range,x_range,y_domain,min_x_tick_value,max_x_tick_value, min_y_tick_value,max_y_tick_value;

                if(that.axis_y_data_format === "number") {
                    max = d3.max(that.new_data, function(d) { return d.name });
                    min = d3.min(that.new_data, function(d) { return d.name });
                    y_domain = [min,max];
                    // y_data = that.k.__proto__._domainBandwidth(y_domain,2);
                    y_data = y_domain;

                    min_y_tick_value = d3.min(that.y_tick_values);
                    max_y_tick_value = d3.max(that.y_tick_values);

                    if(y_data[0] > min_y_tick_value) {
                        y_data[0] = min_y_tick_value;
                    }
                    if(y_data[1] < max_y_tick_value) {
                        y_data[1] = max_y_tick_value;
                    }

                    that.new_data.sort(function (a,b) {
                        return a.name - b.name;
                    })
                    y_data1 = that.new_data.map(function (d) { return d.name; });
                    y_range1 = [that.reduced_height,0];
                    that.yScale = that.k.scaleIdentification("ordinal",y_data1,y_range1,0.3);
                    that.extra_top_margin = (that.yScale.rangeBand() / 2);
                    that.y1 = d3.scale.ordinal()
                        .domain(that.getuniqueGroups)
                        .rangeRoundBands([that.yScale.rangeBand(),0]) ;
                    that.extra_top_margin = 0;
                } else if(that.axis_y_data_format === "string") {
                    y_data = that.new_data.map(function (d) { return d.name; });
                    y_range = [0,that.reduced_height];
                    that.yScale = that.k.scaleIdentification("ordinal",y_data,y_range,0.3);
                    that.extra_top_margin = (that.yScale.rangeBand() / 2);
                    that.y1 = d3.scale.ordinal()
                        .domain(that.getuniqueGroups)
                        .rangeRoundBands([0, that.yScale.rangeBand()]) ;
                }

                if(that.axis_x_data_format === "number") {
                    that.max_x_value = d3.max(that.new_data, function(d) { return d3.max(d.data, function(d) { return d.x; }); });

                    x_domain = [0,that.max_x_value];
                    x_data = that.k._domainBandwidth(x_domain,1);
                    x_range = [0 ,that.reduced_width];
                    min_x_tick_value = d3.min(that.x_tick_values);
                    max_x_tick_value = d3.max(that.x_tick_values);

                    if(x_data[0] > min_x_tick_value) {
                        x_data[0] = min_x_tick_value;
                    }
                    if(x_data[1] < max_x_tick_value) {
                        x_data[1] = max_x_tick_value;
                    }

                    that.xScale = that.k.scaleIdentification("linear",x_data,x_range);
                    that.extra_left_margin = 0;
                }

                that.xdomain = that.xScale.domain();
                that.ydomain = that.yScale.domain();
                that.highlight_x_positions =  [];
                var chart = that.group.selectAll(".groupedBar-rect")
                    .data(that.new_data);

                chart.enter()
                    .append("g")
                    .attr("class", "groupedBar-rect");

                that.highlight_y_positions = "";

                chart
                    .attr("transform", function (d) {
                        that.optionalFeatures().checkIfHighLightDataExists(d.name);
                        if(that.highlight_group_exits) {
                            that.flag = true;
                            that.highlight_y_positions = that.yScale(d.name);
                        }
                        return "translate(" + 0 + "," + that.yScale(d.name) + ")";
                    })
                    .on({
                        'mouseout': function (d) {
                            if(that.mode === "default") {
                                if(PykCharts.boolean(that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlightGroupHide(that.selector+" .groupedBar-rect","rect");
                                }
                                that.mouseEvent.axisHighlightHide(that.selector+" .y.axis")
                            }
                        },
                        'mousemove': function (d) {
                            if(that.mode === "default") {
                                if(PykCharts.boolean(that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlightGroup(that.selector+" .groupedBar-rect", this, "rect");
                                }
                                that.mouseEvent.axisHighlightShow(d.name,(that.selector+" .y.axis"),that.ydomain,"bar");
                            }
                        }
                    });

                var bar = chart.selectAll("rect")
                    .data(function (d) { return d.data; });

                bar.enter()
                    .append("rect")

                bar.attr({
                    "height" : 0,
                    "y" : function (d) {return that.y1(d.name); },
                    "x" : 0,
                    "width" : 0,
                    "height" : function (d){ return 0.98*that.y1.rangeBand(); },
                    "fill" : function (d,i) {
                        return that.fillColor.colorGroup(d);
                    },
                    "fill-opacity" : function (d,i) {
                        if (that.color_mode === "saturation") {
                            return (i+1)/that.no_of_groups;
                        } else {
                            return 1;
                        }
                    },
                    "stroke" : that.border.color(),
                    "stroke-width" : that.border.width(),
                    "stroke-dasharray": that.border.style(),
                    "data-fill-opacity" : function () {
                        return d3.select(this).attr("fill-opacity");
                    },
                    "data-id":function (d,i) {
                            return d.name;
                    }
                })
                .on({
                    'mouseover': function (d) {
                        if(that.mode === "default" && PykCharts['boolean'](that.tooltip_enable)) {
                            var tooltip = d.tooltip ? d.tooltip : d.x;
                            that.mouseEvent.tooltipPosition(d);
                            that.mouseEvent.tooltipTextShow(tooltip);
                        }
                    },
                    'mouseout': function (d) {
                        if(that.mode === "default" && PykCharts['boolean'](that.tooltip_enable)) {
                            that.mouseEvent.tooltipHide(d);
                        }
                    },
                    'mousemove': function (d) {
                        if(that.mode === "default" && PykCharts['boolean'](that.tooltip_enable)) {
                            that.mouseEvent.tooltipPosition(d);
                        }
                    },
                    'click': function (d,i) {
                        if(PykCharts['boolean'](that.click_enable)){
                           that.addEvents(d.name, d3.select(this).attr("data-id"));
                        }
                    }
                })
                .transition()
                .duration(that.transitions.duration())
                .attr("width", function (d) { return that.xScale(d.x); })

                bar.exit().remove();
                chart.exit().remove();

                var t = d3.transform(d3.select(d3.selectAll('.groupedBar-rect')[0][(that.new_data.length-1)]).attr("transform")),
                    x = t.translate[0],
                    y = t.translate[1];
                y_range = [(that.reduced_height-y - (that.y1.rangeBand()*2)),(y + (that.y1.rangeBand()*2))];
                that.yScale1 = that.k.scaleIdentification("linear",y_data,y_range);

                return this;
            },
            ticks : function(){
                if(that.pointer_size) {
                    var ticks = that.group.selectAll(".groupedBar-ticks")
                        .data(that.new_data);

                        ticks.enter()
                        .append("g")
                        .attr("class","groupedBar-ticks");

                    ticks.attr("transform", function (d) {
                        return "translate(" + 0 + "," + that.yScale(d.name) + ")";
                    })

                    var tick_label = ticks.selectAll(".ticks_label")
                        .data(function (d) { return d.data; });

                    tick_label.enter()
                        .append("text")

                    tick_label.attr("class","ticks_label")
                        .style("font-weight", that.pointer_weight)
                        .style("font-size", that.pointer_size + "px")
                        .attr("fill", that.pointer_color)
                        .style("font-family", that.pointer_family)
                        .text("");

                    function setTimeoutTicks() {
                        tick_label.attr({
                            "x" : function (d) { return that.xScale(d.x); },
                            "y" : function(d) { return (that.y1(d.name))+(that.y1.rangeBand()/2); },
                            "dx" : 4,
                            "dy" : 2
                        })
                        .transition()
                        .text(function (d) {
                            if(d.x) {
                                return (d.x).toFixed();
                            }
                        })
                        .attr({
                            "pointer-events" : "none",
                        })
                        .text(function (d) {
                            if(d.x) {
                                that.txt_width = this.getBBox().width;
                                that.txt_height = this.getBBox().height;
                                if(d.x && (that.txt_width< that.xScale(d.x)) && (that.txt_height < (that.y1.rangeBand() ))) {
                                    return d.x;
                                }
                            }
                        });
                    }
                    setTimeout(setTimeoutTicks,that.transitions.duration());

                    tick_label.exit().remove();
                    ticks.exit().remove();
                }
                return this;
            },
            mapColors : function () {
                that.no_of_groups = d3.max(that.new_data,function (d){
                    return d.data.length;
                });

                for(var i = 0;i<that.new_data_length;i++) {
                    if(that.new_data[i].data.length === that.no_of_groups) {
                        that.group_data = that.new_data[i].data;
                        that.group_data_length = that.group_data.length;
                        break;
                    }
                }

                for(var i = 0;i<that.group_data_length;i++) {
                    if(that.color_mode === "color" && that.chart_color[i]) {
                        that.group_data[i].color = that.chart_color[i];
                    } else {
                        that.group_data[i].color = that.default_color[0];
                    }
                }

                that.new_data.forEach(function(d){
                    d.data.forEach(function(data){
                        for (var i=0 ; i<that.group_data_length ; i++) {
                            if (that.group_data[i].name === data.name) {
                                data.color = that.group_data[i].color;
                                break;
                            }
                        }
                    })
                });
            },
            legends: function () {
                if(PykCharts.boolean(that.legends_enable)) {
                    var params = that.group_data,color;
                    color = params.map(function (d) {
                        return d.color;
                    });
                    params = params.map(function (d) {
                        return d.name;
                    });
                    params = that.k.__proto__._unique(params);
                    that.multiD.legendsPosition(that,"groupBar",params,color);
                }
                return this;
            },
            checkIfHighLightDataExists : function (name) {
                if(that.highlight) {
                    if(that.axis_y_data_format === "number") {
                        that.highlight_group_exits = (that.highlight === name);
                    } else if (that.axis_y_data_format === "string") {
                        that.highlight_group_exits = (that.highlight.toLowerCase() === name.toLowerCase());
                    }
                }
                return this;
            },
            highlightRect : function () {
                if(that.flag) {
                    function setTimeoutHighlight() {
                        y = that.highlight_y_positions - 5;

                        var highlight_rect = that.group.selectAll(".highlight-groupedBar-rect")
                            .data([that.highlight])

                        highlight_rect.enter()
                            .append("rect")

                        highlight_rect.attr("class","highlight-groupedBar-rect")
                            .attr({
                                "x" : 0,
                                "y" : y,
                                "height" : (that.y1.rangeBand()* that.group_data_length)+10,
                                "width" : that.reduced_width + 5,
                                "fill" : "none",
                                "stroke" : that.highlight_color,
                                "stroke-width" : "1.5px",
                                "stroke-dasharray" : "5,5",
                                "stroke-opacity" : 1
                            });
                        highlight_rect.exit()
                            .remove();
                        if(PykCharts["boolean"](that.highlight_y_positions)) {
                            highlight_array = that.highlight;
                        } else {
                            highlight_rect
                                .remove()
                        }
                    }
                    setTimeout(setTimeoutHighlight, that.transitions.duration());
                }
                return this;
            },
            newYAxis : function () {
                if(PykCharts["boolean"](that.axis_y_enable)) {
                    if(that.axis_y_position === "right") {
                        that.new_yAxisgroup.attr("transform", "translate(" + (that.chart_width - that.chart_margin_left - that.chart_margin_right - that.legendsGroup_width) + ",0)");
                    }
                    var yaxis = d3.svg.axis()
                        .scale(that.yScale)
                        .orient(that.axis_y_pointer_position)
                        .tickSize(0)
                        .outerTickSize(that.axis_y_outer_pointer_length);
                    that.new_yAxisgroup.style("stroke",function () { return that.axis_y_line_color; })
                        .call(yaxis);
                    d3.selectAll(that.selector + " .y.new-axis text")
                        .style({
                            "display": function () { return "none"; },
                            "stroke": "none"
                        });
                }
                return this;
            },
            sort : function(data,dimension) {
                if(that.axis_y_data_format === "string") {
                    try {
                        if(that.data_sort_type === "alphabetically") {
                        } else {
                            that.data_sort_type = multiDimensionalCharts.data_sort_type;
                            throw "data_sort_type";
                        }
                    }
                    catch(err) {
                        that.k.warningHandling(err,"8");
                    }
                    data = that.k.__proto__._sortData(data, "y", dimension, that);
                    return data;
                }
                return data;
            }
        }
        return optional;
    };
};
PykCharts.multiD.column = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});

    this.execute = function (pykquery_data) {
        that = new PykCharts.validation.processInputs(that, options, 'multiDimensionalCharts');
        PykCharts.scaleFunction(that);
        PykCharts.grid(that);
        if(that.stop){
            return;
        }
        that.panels_enable = "no";
        that.k.storeInitialDivHeight();

        if(that.mode === "default") {
           that.k.loading();
        }

        that.multiD = new PykCharts.multiD.configuration(that);
        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }
            that.data = that.k.__proto__._groupBy("column",data);
            that.compare_data = that.k.__proto__._groupBy("column",data);
            that.axis_y_data_format = "number";
            that.axis_x_data_format = that.k.xAxisDataFormatIdentification(that.data);
            if(that.axis_x_data_format === "time" && that.axis_x_time_value_datatype === "") {
                console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to have passed Date data so please pass the value for axis_x_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_15");
            }
            that.k.remove_loading_bar(id);
            that.render();
        };
        if (PykCharts.boolean(that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };

    this.transformData = function () {
        var group_arr = [], uniq_group_arr = [];
        if (options.chart_color != 0 && options.chart_color != undefined) {
            that.chart_color[0] = options.chart_color[0];
        }
        else {
            for (var i=0,len=that.data.length ; i<len ; i++) {
                if (that.data[i].color != "" && that.data[i].color != undefined) {
                    that.chart_color[0] = that.data[i].color;
                    if (options.axis_x_pointer_color == undefined || options.axis_x_pointer_color == "") {
                        that.axis_x_pointer_color = that.chart_color[0];
                    }
                    break;
                }
            }
        }
        that.data.forEach(function(d){
            d.name = d.x;
            d.color = that.chart_color[0];
        });

        for(var j=0, len=that.data.length ; j<len ; j++) {
            group_arr[j] = that.data[j].group;
        }
        uniq_group_arr = that.k.__proto__._unique(group_arr);
        that.no_of_groups = uniq_group_arr.length;
    }

    this.render = function () {
        var id = that.selector.substring(1,that.selector.length),
            container_id = id + "_svg";

        that.border = new PykCharts.Configuration.border(that);
        that.transitions = new PykCharts.Configuration.transition(that);
        // that.mouseEvent1 = new PykCharts.multiD.mouseEvent(options);
        that.mouseEvent1 = new PykCharts.Configuration.mouseEvent(options);
        that.fillColor = new PykCharts.Configuration.fillChart(that,null,options);
        that.transformData();

        try {
            if(that.no_of_groups > 1) {
                throw "Invalid data in the JSON";
            }
        }
        catch (err) {
            console.error('%c[Error - Pykih Charts] ', 'color: red;font-weight:bold;font-size:14px', " at "+that.selector+". \""+err+"\"  Visit www.pykcharts.com/errors#error_8");
            return;
        }

        if(that.axis_x_data_format === "time") {
            that.data.forEach(function (d) {
                d.x =that.k.dateConversion(d.x);
            });
        }

      //  that.map_group_data = that.multiD.mapGroup(that.data);
        if(that.mode === "default") {

            that.k.title()
                .backgroundColor(that)
                .export(that,"#"+container_id,"columnChart")
                .emptyDiv(that.selector)
                .subtitle()
                .makeMainDiv(that.selector,1);

            that.optionalFeatures()
                .svgContainer(container_id,1)
                .createGroups();

            that.k.liveData(that)
                .tooltip()
                .createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource();

            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);

            that.optionalFeatures()
                .createColumn()
                .axisContainer();

            that.k.yAxis(that.svgContainer,that.ygroup,that.yScale,that.y_domain,that.y_tick_values)
                .yGrid(that.svgContainer,that.group,that.yScale)
                .xAxisTitle(that.xgroup)
                .yAxisTitle(that.ygroup);
            if(that.axis_x_data_format !== "string") {
                console.log(that.xScale1.domain())
                that.k.xAxis(that.svgContainer,that.xgroup,that.xScale1,that.extra_left_margin,that.x_domain,that.x_tick_values,null,"bar",that);
                that.optionalFeatures().newXAxis();
            } else {
                that.k.xAxis(that.svgContainer,that.xgroup,that.xScale,that.extra_left_margin,that.x_domain,that.x_tick_values,null,null,that);
            }

        } else if(that.mode === "infographics") {
            that.k.backgroundColor(that)
                .export(that,"#"+container_id,"columnChart")
                .emptyDiv(that.selector)
                .makeMainDiv(that.selector,1);

            that.optionalFeatures()
                .svgContainer(container_id,1)
                .createGroups();

            that.k.liveData(that)
                .tooltip();

            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);

            that.optionalFeatures()
                .createColumn()
                .axisContainer();

            that.k.yAxis(that.svgContainer,that.ygroup,that.yScale,that.y_domain,that.y_tick_values)
                .xAxisTitle(that.xgroup)
                .yAxisTitle(that.ygroup);
            if(that.axis_x_data_format !== "string") {
                that.k.xAxis(that.svgContainer,that.xgroup,that.xScale1,that.extra_left_margin,that.x_domain,that.x_tick_values,null,"bar")
                that.optionalFeatures().newXAxis();
            } else {
                that.k.xAxis(that.svgContainer,that.xgroup,that.xScale,that.extra_left_margin,that.x_domain,that.x_tick_values)
            }
        }
        that.k.exportSVG(that,"#"+container_id,"columnChart")

        var resize = that.k.resize(that.svgContainer);
        that.k.__proto__._ready(resize);
        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer);
        });
    };

    this.refresh = function (pykquery_data) {
       that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("column",data);
            that.refresh_data = that.k.__proto__._groupBy("column",data);
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            that.transformData();
            if(that.axis_x_data_format === "time") {
                that.data.forEach(function (d) {
                    d.x =that.k.dateConversion(d.x);
                    d.color = that.chart_color[0];
                });
            }

            try {
                if(that.no_of_groups > 1) {
                    throw "Invalid data in the JSON";
                }
            }
            catch (err) {
                console.error('%c[Error - Pykih Charts] ', 'color: red;font-weight:bold;font-size:14px', " at "+that.selector+". \""+err+"\"  Visit www.pykcharts.com/errors#error_8");
                return;
            }

            // that.map_group_data = that.multiD.mapGroup(that.data);

            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }

            that.optionalFeatures()
                .createColumn();

            that.k.yAxis(that.svgContainer,that.ygroup,that.yScale,that.y_domain,that.y_tick_values)
                .yGrid(that.svgContainer,that.group,that.yScale);
            if(that.axis_x_data_format !== "string") {
                that.k.xAxis(that.svgContainer,that.xgroup,that.xScale,that.extra_left_margin,that.x_domain,that.x_tick_values,null,"bar")
                that.optionalFeatures().newXAxis();
            } else {
                that.k.xAxis(that.svgContainer,that.xgroup,that.xScale,that.extra_left_margin,that.x_domain,that.x_tick_values)
            }
        };

        if (PykCharts.boolean(that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
    };

    this.optionalFeatures = function () {
        var id = that.selector.substring(1,that.selector.length);
        var status;
        var optional = {
            svgContainer: function (container_id,i) {
                document.getElementById(id).className += " PykCharts-twoD";
                that.svgContainer = d3.select(that.selector + " #chart-container-" + i)
                    .append("svg:svg")
                    .attr({
                        "width": that.chart_width,
                        "height": that.chart_height,
                        "id": container_id,
                        "class": "svgcontainer",
                        "preserveAspectRatio": "xMinYMin",
                        "viewBox": "0 0 " + that.chart_width + " " + that.chart_height
                    });
                return this;
            },
            createGroups: function (i) {
                that.group = that.svgContainer.append("g")
                    .attr({
                        "id": "column-group",
                        "transform": "translate(" + that.chart_margin_left + "," + (that.chart_margin_top/* + that.legendsGroup_height*/) +")"
                    });

                if(PykCharts.boolean(that.chart_grid_y_enable)) {
                    that.group.append("g")
                        .attr({
                            "id": "ygrid",
                            "class": "y grid-line"
                        });
                }
                return this;
            },
            axisContainer : function () {
                if(PykCharts.boolean(that.axis_x_enable)  || that.axis_x_title) {
                    that.xgroup = that.group.append("g")
                        .attr({
                            "id": "xaxis",
                            "class": "x axis"
                        })
                        .style("stroke","none");
                }

                if(PykCharts.boolean(that.axis_y_enable)  || that.axis_y_title) {
                    that.ygroup = that.group.append("g")
                        .attr({
                            "id": "yaxis",
                            "class": "y axis"
                        });
                    that.new_xAxisgroup = that.group.append("g")
                        .attr({
                            "class": "x new-axis",
                            "id": "new-xaxis"
                        })
                        .style("stroke","blue");
                }
                return this;
            },
            createColumn: function () {
                that.x_tick_values = that.k.processXAxisTickValues();
                that.y_tick_values = that.k.processYAxisTickValues();
                that.reducedWidth = that.chart_width - that.chart_margin_left - that.chart_margin_right;

                var height = that.chart_height - that.chart_margin_top - that.chart_margin_bottom;
                var x_domain,x_data = [],y_data = [],y_range,x_range,y_domain, min_x_tick_value,max_x_tick_value, min_y_tick_value,max_y_tick_value;

                if(that.axis_y_data_format === "number") {
                    y_domain = [0,d3.max(that.data,function (d) { return d.y; })];
                    y_data = that.k._domainBandwidth(y_domain,1);
                    y_range = [that.chart_height - that.chart_margin_top - that.chart_margin_bottom, 0];
                    min_y_tick_value = d3.min(that.y_tick_values);
                    max_y_tick_value = d3.max(that.y_tick_values);

                    if(y_data[0] > min_y_tick_value) {
                        y_data[0] = min_y_tick_value;
                    }
                    if(y_data[1] < max_y_tick_value) {
                        y_data[1] = max_y_tick_value;
                    }

                    that.yScale = that.k.scaleIdentification("linear",y_data,y_range);
                    that.extra_top_margin = 0;


                } else if(that.axis_y_data_format === "string") {
                    y_data = that.data.map(function (d) { return d.y; });
                    y_range = [0,that.chart_height - that.chart_margin_top - that.chart_margin_bottom];
                    that.yScale = that.k.scaleIdentification("ordinal",y_data,y_range,0.3);
                    that.extra_top_margin = (that.yScale.rangeBand() / 2);

                } else if (that.axis_y_data_format === "time") {
                    y_data = d3.extent(that.data, function (d) {
                        return parseDate(d.y);
                    });

                    min_y_tick_value = d3.min(that.y_tick_values, function (d) {
                        return new Date(d);
                    });

                    max_y_tick_value = d3.max(that.y_tick_values, function (d) {
                        return new Date(d);
                    });

                    if(new Date(y_data[0]) > new Date(min_y_tick_value)) {
                        y_data[0] = min_y_tick_value;
                    }
                    if(new Date(y_data[1]) < new Date(max_y_tick_value)) {
                        y_data[1] = max__tick_value;
                    }

                    y_range = [that.chart_height - that.chart_margin_top - that.chart_margin_bottom, 0];
                    that.yScale = that.k.scaleIdentification("time",y_data,y_range);
                    that.extra_top_margin = 0;
                }
                if(that.axis_x_data_format === "number") {
                    x_domain = [d3.min(that.data,function (d) { return +d.x; }),d3.max(that.data,function (d) { return +d.x; })];
                    console.log(x_domain)
                    x_data = that.k._domainBandwidth(x_domain);
                    x_range = [0 ,that.reducedWidth];
                    min_x_tick_value = d3.min(that.x_tick_values);
                    max_x_tick_value = d3.max(that.x_tick_values);

                    if(x_data[0] > min_x_tick_value) {
                        x_data[0] = min_x_tick_value;
                    }
                    if(x_data[1] < max_x_tick_value) {
                        x_data[1] = max_x_tick_value;
                    }
                    that.data.sort(function (a,b) {
                        return a.x - b.x;
                    })
                    console.log(x_data)
                    that.xScale1 = that.k.scaleIdentification("linear",x_data,x_range);
                    x_data1 = that.data.map(function (d) { return d.x; });
                    x_range1 = [0 ,that.reducedWidth];
                    that.xScale = that.k.scaleIdentification("ordinal",x_data1,x_range1,0.3);
                    that.extra_left_margin = (that.xScale.rangeBand()/2);

                } else if(that.axis_x_data_format === "string") {
                    x_data = that.data.map(function (d) { return d.x; });
                    x_range = [0 ,that.reducedWidth];
                    that.xScale = that.k.scaleIdentification("ordinal",x_data,x_range,0.3);
                    that.extra_left_margin = (that.xScale.rangeBand()/2);
                } else if (that.axis_x_data_format === "time") {
                    max = d3.max(that.data, function(k) { return (k.x); });
                    min = d3.min(that.data, function(k) { return (k.x); });
                    x_domain = [min.getTime(),max.getTime()];

                    min_x_tick_value = d3.min(that.x_tick_values, function (d) {
                        return that.k.dateConversion(d);
                    });

                    max_x_tick_value = d3.max(that.x_tick_values, function (d) {
                        return that.k.dateConversion(d);
                    });

                    if(x_data[0] > min_x_tick_value) {
                        x_data[0] = min_x_tick_value;
                    }
                    if(x_data[1] < max_x_tick_value) {
                        x_data[1] = max_x_tick_value;
                    }

                    x_range = [0 ,that.reducedWidth];
                    that.xScale = that.k.scaleIdentification("time",x_domain,x_range);
                    that.data.sort(function (a,b) {
                        if ((a.x) < (b.x)) {
                            return -1 ;
                        }
                        else if ((a.x) > (b.x)) {
                            return 1;
                        }
                    })
                    console.log(data)
                    that.xScale1 = that.k.scaleIdentification("linear",x_data,x_range);
                    x_data1 = that.data.map(function (d) { return d.x; });
                    x_range1 = [0 ,that.reducedWidth];
                    that.xScale = that.k.scaleIdentification("ordinal",x_data1,x_range1,0.3);
                    that.extra_left_margin = (that.xScale.rangeBand()/2);

                }

                that.x_domain = that.xScale.domain();
                that.y_domain = that.yScale.domain();

                that.bar = that.group.selectAll(".column-rect")
                    .data(that.data)

                that.bar.enter()
                    .append("g")
                    .attr("class","column-rect")
                    .append("svg:rect");

                that.bar.attr("class","column-rect")
                    .select("rect")
                    .attr({
                        "class": "vcolumn",
                        "x": function (d) { return that.xScale(d.x); },
                        "y": height,
                        "height": 0,
                        "width": function (d) { return that.xScale.rangeBand(d.x); },
                        "fill": function (d) { return that.fillColor.colorPieMS(d); },
                        "stroke": that.border.color(),
                        "stroke-width": that.border.width(),
                        "stroke-dasharray": that.border.style(),
                        "data-id":function (d,i) {
                            return d.name;
                        }
                    })
                    .on({
                        'mouseover': function (d) {
                            if(that.mode === "default") {
                                if(PykCharts.boolean(that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent1.highlight(that.selector+" "+".vcolumn", this);
                                }
                                if (PykCharts['boolean'](that.tooltip_enable)) {
                                    that.mouseEvent.tooltipPosition(d);
                                    that.mouseEvent.tooltipTextShow(d.tooltip ? d.tooltip : d.y);
                                }
                            }
                        },
                        'mouseout': function (d) {
                            if(that.mode === "default") {
                                if(PykCharts.boolean(that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent1.highlightHide(that.selector+" "+".vcolumn");
                                }
                                if (PykCharts['boolean'](that.tooltip_enable)) {
                                    that.mouseEvent.tooltipHide(d);
                                }
                                that.mouseEvent.axisHighlightHide(that.selector+" "+".x.axis")
                            }
                        },
                        'mousemove': function (d) {
                            if(that.mode === "default") {
                                if (PykCharts['boolean'](that.tooltip_enable)) {
                                    that.mouseEvent.tooltipPosition(d);
                                }
                                that.mouseEvent.axisHighlightShow(d.x,that.selector+" "+".x.axis",that.x_domain);
                            }
                        },
                        'click': function (d,i) {
                            if(PykCharts['boolean'](that.click_enable)){
                               that.addEvents(d.name, d3.select(this).attr("data-id"));
                            }
                        }
                    })
                    .transition()
                    .duration(that.transitions.duration())
                    .attr({
                        "y": function (d) { return that.yScale(d.y); },
                        "height": function (d) { return height - that.yScale(d.y); }
                    });

                that.bar.exit()
                    .remove();
                var t = d3.transform(d3.select(d3.selectAll(that.selector + ' .column-rect')[0][(that.data.length-1)]).attr("transform")),
                    x = t.translate[0],
                    y = t.translate[1];
                x_range = [(x + (that.xScale.rangeBand())),(that.reducedWidth - x - (that.xScale.rangeBand()))];
                that.xScale1 = that.k.scaleIdentification("linear",x_data,x_range);
                return this;
            },
            newXAxis : function () {
                if(PykCharts["boolean"](that.axis_x_enable)) {
                    if(that.axis_x_position === "bottom") {
                        that.new_xAxisgroup.attr("transform", "translate(0," + (that.chart_height - that.chart_margin_top - that.chart_margin_bottom) + ")");
                    }
                    var xaxis = d3.svg.axis()
                        .scale(that.xScale)
                        .orient(that.axis_x_pointer_position)
                        .tickSize(0)
                        .ticks(that.axis_x_no_of_axis_value)
                        .outerTickSize(that.axis_x_outer_pointer_length);
                    that.new_xAxisgroup.style("stroke",function () { return that.axis_x_line_color; })
                        .call(xaxis);
                    d3.selectAll(that.selector + " .x.new-axis text").style({
                        "display": function () { return "none"; },
                        "stroke": "none"
                    });
                }
                return this;
            },
        };
        return optional;
    };
};
PykCharts.multiD.groupedColumn = function(options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});

    this.execute = function (pykquery_data) {
        that = new PykCharts.validation.processInputs(that, options, 'multiDimensionalCharts');
        PykCharts.scaleFunction(that);
        PykCharts.grid(that);
        if(that.stop){
            return;
        }
        that.panels_enable = "no";
        that.k.storeInitialDivHeight();
        if(that.mode === "default") {
           that.k.loading();
        }
        that.multiD = new PykCharts.multiD.configuration(that);

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }
            that.data = that.k.__proto__._groupBy("column",data);
            that.compare_data = that.k.__proto__._groupBy("column",data);
            that.axis_y_data_format = "number";
            that.axis_x_data_format = that.k.xAxisDataFormatIdentification(that.data);
            if(that.axis_x_data_format === "time" && that.axis_x_time_value_datatype === "") {
                console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to have passed Date data so please pass the value for axis_x_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_15");
            }

            that.k.remove_loading_bar(id);
            // PykCharts.multiD.columnFunctions(options,that,"group_column");
            that.render();
        };
        if (PykCharts.boolean(that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };

    that.dataTransformation = function () {
        that.group_arr = [], that.new_data = [];
        that.data_length = that.data.length;
        for(var j = 0;j < that.data_length;j++) {
            that.group_arr[j] = that.data[j].x;
        }
        that.uniq_group_arr = that.k.__proto__._unique(that.group_arr);
        var len = that.uniq_group_arr.length;

        for (var k = 0;k < len;k++) {
            that.new_data[k] = {
                    name: that.uniq_group_arr[k],
                    data: []
            };
            for (var l = 0;l < that.data_length;l++) {
                if (that.uniq_group_arr[k] === that.data[l].x) {
                    that.new_data[k].data.push({
                        y: that.data[l].y,
                        name: that.data[l].group,
                        tooltip: that.data[l].tooltip,
                        color: that.data[l].color
                    });
                }
            }
        }
        that.new_data_length = that.new_data.length;
    };

    that.refresh = function (pykquery_data) {
        that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("column",data);
            that.refresh_data = that.k.__proto__._groupBy("column",data);
            that.map_group_data = that.multiD.mapGroup(that.data);
            that.dataTransformation();
            that.optionalFeatures().mapColors();

            if(that.axis_x_data_format === "time") {
                    that.new_data.forEach(function (d) {
                        d.name = that.k.dateConversion(d.name);
                        // that.xdomain.push(d.x);
                    });
                    that.data.forEach(function (d) {
                        d.x =that.k.dateConversion(d.x);
                    });
            }
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }

            that.optionalFeatures()
                    .createChart()
                    .legends()
                    .highlightRect();

            that.k.yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width)
            .yGrid(that.svgContainer,that.group,that.yScale,that.legendsGroup_width);
            if(that.axis_y_data_format !== "string") {
                that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height,"groupcolumn")
                that.optionalFeatures().newXAxis();
            } else {
                that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
            }
        };
        if (PykCharts.boolean(that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
    };

    that.render = function() {
        var that = this,
            id = that.selector.substring(1,that.selector.length),
            container_id = id + "_svg";

        that.map_group_data = that.multiD.mapGroup(that.data);
        that.dataTransformation();
        that.optionalFeatures().mapColors();

        if(that.axis_x_data_format === "time") {
                that.new_data.forEach(function (d) {
                    d.name = that.k.dateConversion(d.name);
                    // that.xdomain.push(d.x);
                });
                that.data.forEach(function (d) {
                    d.x =that.k.dateConversion(d.x);
                });
        }


        that.border = new PykCharts.Configuration.border(that);
        that.transitions = new PykCharts.Configuration.transition(that);
        // that.mouseEvent1 = new PykCharts.multiD.mouseEvent(that);
        that.mouseEvent1 = new PykCharts.Configuration.mouseEvent(that);
        that.fillColor = new PykCharts.Configuration.fillChart(that,null,options);

        if(that.mode === "default") {
            that.k.title()
                .backgroundColor(that)
                .export(that,"#"+container_id,"groupColumnChart")
                .emptyDiv(that.selector)
                .subtitle()
                .makeMainDiv(that.selector,1);

            that.optionalFeatures()
                .svgContainer(container_id,1)
                .legendsContainer(1);

            that.k.liveData(that)
                .tooltip()
                .createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource();

            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);

            that.optionalFeatures()
                .legends()
                .createGroups(1)
                .createChart()
                .axisContainer()
               .highlightRect();

            that.k.yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width)
            .yGrid(that.svgContainer,that.group,that.yScale,that.legendsGroup_width)
            .xAxisTitle(that.xGroup)
            .yAxisTitle(that.yGroup);
            if(that.axis_y_data_format !== "string") {
                that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height,"groupcolumn")
                that.optionalFeatures().newXAxis();
            } else {
                that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
            }

        } else if(that.mode === "infographics") {
            that.k.backgroundColor(that)
                .export(that,"#"+container_id,"groupColumnChart")
                .emptyDiv(that.selector)
                .makeMainDiv(that.selector,1);

            that.optionalFeatures().svgContainer(container_id,1)
                .legendsContainer(1)
                .createGroups(1)
                .createChart()
                .axisContainer()
                .highlightRect();

            that.k.tooltip();
            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
            that.k
            .yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width)
            .xAxisTitle(that.xGroup)
            .yAxisTitle(that.yGroup);
            if(that.axis_y_data_format !== "string") {
                that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height,"groupcolumn")
                that.optionalFeatures().newXAxis();
            } else {
                that.k.xAxis(that.svgContainer,that.xGroup,that.xScale,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
            }
        }

        that.k.exportSVG(that,"#"+container_id,"groupColumnChart");
            var resize = that.k.resize(that.svgContainer);
            that.k.__proto__._ready(resize);
            window.addEventListener('resize', function(event){
                return that.k.resize(that.svgContainer);
            });
    };

    that.optionalFeatures = function() {
        var that = this;
        var id = that.selector.substring(1,that.selector.length);
        var optional = {
            svgContainer: function (container_id,i) {
                document.getElementById(id).className += " PykCharts-twoD";
                that.svgContainer = d3.select(that.selector + " #chart-container-" + i)
                    .append("svg:svg")
                    .attr({
                        "width": that.chart_width,
                        "height": that.chart_height,
                        "id": container_id,
                        "class": "svgcontainer",
                        "preserveAspectRatio": "xMinYMin",
                        "viewBox": "0 0 " + that.chart_width + " " + that.chart_height
                    });
                return this;
            },
            createGroups: function (i) {
                that.group = that.svgContainer.append("g")
                    .attr({
                        "id": "groupedColumn-group",
                        "transform": "translate(" + that.chart_margin_left + "," + (that.chart_margin_top + that.legendsGroup_height) +")"
                    });
                if(PykCharts.boolean(that.chart_grid_y_enable)) {
                    that.group.append("g")
                        .attr({
                            "id": "ygrid",
                            "class": "y grid-line"
                        });
                }
                return this;
            },
            legendsContainer: function (i) {
                if(PykCharts.boolean(that.legends_enable) && that.mode === "default") {

                    that.legendsGroup = that.svgContainer.append("g")
                        .attr({
                            "id": "groupedColumn-legends",
                            "class": "legends",
                            "transform": "translate(0,10)"
                        })
                        .style("visibility","hidden");

                } else {
                    that.legendsGroup_height = 0;
                    that.legendsGroup_width = 0;
                }
                return this;
            },
            axisContainer : function () {
                if(PykCharts.boolean(that.axis_x_enable) || that.axis_x_title) {
                    that.xGroup = that.group.append("g")
                        .attr({
                            "class": "x axis",
                            "id": "xaxis"
                        })
                        .style("stroke","black");
                    that.new_xAxisgroup = that.group.append("g")
                        .attr({
                            "class": "x new-axis",
                            "id": "new-xaxis"
                        })
                        .style("stroke","blue");
                }

                if(PykCharts.boolean(that.axis_y_enable) || that.axis_y_title) {
                    that.yGroup = that.group.append("g")
                        .attr({
                            "class": "y axis",
                            "id": "yaxis"
                        })
                        .style("stroke","blue");
                }
                return this;
            },
            createChart: function() {

                that.reduced_width = that.chart_width - that.chart_margin_left - that.chart_margin_right - that.legendsGroup_width;

                that.reduced_height = that.chart_height - that.chart_margin_top - that.chart_margin_bottom - that.legendsGroup_height;

                that.getuniqueGroups = that.data.map(function (d) {
                    return d.group;
                })

                that.getuniqueGroups = that.k.__proto__._unique(that.getuniqueGroups)

                that.x_tick_values = that.k.processXAxisTickValues();
                that.y_tick_values = that.k.processYAxisTickValues();

                var x_domain,x_data = [],y_data,y_range,x_range,y_domain,min_x_tick_value,max_x_tick_value, min_y_tick_value,max_y_tick_value;

                if(that.axis_y_data_format === "number") {
                    that.max_y_value = d3.max(that.new_data, function(d) { return d3.max(d.data, function(d) { return d.y; }); });

                    y_domain = [0,that.max_y_value];
                    y_data = that.k.__proto__._domainBandwidth(y_domain,1);
                    min_y_tick_value = d3.min(that.y_tick_values);
                    max_y_tick_value = d3.max(that.y_tick_values);

                    if(y_data[0] > min_y_tick_value) {
                        y_data[0] = min_y_tick_value;
                    }
                    if(y_data[1] < max_y_tick_value) {
                        y_data[1] = max_y_tick_value;
                    }
                    y_range = [that.reduced_height, 0];
                    that.yScale = that.k.scaleIdentification("linear",y_data,y_range);

                }

                if(that.axis_x_data_format === "number") {
                    max = d3.max(that.new_data, function(d) { return d.name });
                    min = d3.min(that.new_data, function(d) { return d.name });
                    x_domain = [min,max];
                    x_data = [min,max];

                    min_x_tick_value = d3.min(that.x_tick_values);
                    max_x_tick_value = d3.max(that.x_tick_values);

                    if(x_data[0] > min_x_tick_value) {
                        x_data[0] = min_x_tick_value;
                    }
                    if(x_data[1] < max_x_tick_value) {
                        x_data[1] = max_x_tick_value;
                    }
                    that.new_data.sort(function (a,b) {
                        return a.name - b.name;
                    })
                    x_range = [0 ,that.reduced_width];
                    that.xScale1 = that.k.scaleIdentification("linear",x_data,x_range);
                    x_data1 = that.new_data.map(function (d) { return d.name; });
                    x_range1 = [0 ,that.reduced_width];
                    that.xScale = that.k.scaleIdentification("ordinal",x_data1,x_range1,0.2);
                    that.extra_left_margin = (that.xScale.rangeBand() / 2);
                    that.xdomain = that.xScale.domain();
                    that.x1 = d3.scale.ordinal()
                        .domain(that.getuniqueGroups)
                        .rangeRoundBands([0, that.xScale.rangeBand()]) ;


                } else if(that.axis_x_data_format === "string") {
                    x_data = that.new_data.map(function (d) { return d.name; });

                    x_range = [0 ,that.reduced_width];
                    that.xScale = that.k.scaleIdentification("ordinal",x_data,x_range,0.2);
                    that.extra_left_margin = (that.xScale.rangeBand() / 2);
                    that.xdomain = that.xScale.domain();
                    that.x1 = d3.scale.ordinal()
                        .domain(that.getuniqueGroups)
                        .rangeRoundBands([0, that.xScale.rangeBand()]) ;


                } else if (that.axis_x_data_format === "time") {
                    max = d3.max(that.new_data,function(d) {
                        return d.name;
                    })

                    min = d3.min(that.new_data,function(d) {
                        return d.name;
                    })

                    x_domain = [min.getTime(),max.getTime()];
                    x_data = [min,max];
                    x_range = [0 ,that.reduced_width];


                    min_x_tick_value = d3.min(that.x_tick_values, function (d) {
                        d = that.k.dateConversion(d);
                        return d;
                    });

                    max_x_tick_value = d3.max(that.x_tick_values, function (d) {
                        d = that.k.dateConversion(d);
                        return d;
                    });

                    if((x_data[0]) > (min_x_tick_value)) {
                        x_data[0] = min_x_tick_value;
                    }
                    if((x_data[1]) < (max_x_tick_value)) {
                        x_data[1] = max_x_tick_value;
                    }

                    that.xScale = that.k.scaleIdentification("time",x_data,x_range);
                    that.new_data.sort(function (a,b) {
                        if (new Date(a.name) < new Date(b.name)) {
                            return -1 ;
                        }
                        else if (new Date(a.name) > new Date(b.name)) {
                            return 1;
                        }
                    });
                    x_data1 = that.new_data.map(function (d) { return d.name; });

                    x_range1 = [0 ,that.reduced_width];
                    that.xScale1 = that.k.scaleIdentification("ordinal",x_data1,x_range1,0.2);
                    x_data1 = that.new_data.map(function (d) { return d.name; });
                    x_range1 = [0 ,that.reduced_width];
                    that.xScale = that.k.scaleIdentification("ordinal",x_data1,x_range1,0.2);
                    that.extra_left_margin = (that.xScale.rangeBand() / 2);
                    that.xdomain = that.xScale.domain();
                    that.x1 = d3.scale.ordinal()
                        .domain(that.getuniqueGroups)
                        .rangeRoundBands([0, that.xScale.rangeBand()]) ;
                }
                that.xdomain = that.xScale.domain();
                that.ydomain = that.yScale.domain();
                that.highlight_y_positions =  [];

                var chart = that.group.selectAll(".groupedColumn-rect")
                    .data(that.new_data);

                chart.enter()
                    .append("g")
                    .attr("class", "groupedColumn-rect");

                chart.attr("transform", function (d) {
                        that.optionalFeatures().checkIfHighLightDataExists(d.name);
                        if(that.highlight_group_exits) {
                            that.flag = true;
                            that.highlight_x_positions = that.xScale(d.name);
                        }
                        return "translate(" + that.xScale(d.name) + ",0)";
                    })
                    .on({
                        'mouseout': function (d) {
                            if(that.mode === "default") {
                                if(PykCharts.boolean(that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlightGroupHide(that.selector+" "+".groupedColumn-rect","rect");
                                }
                                that.mouseEvent.axisHighlightHide(that.selector+" "+".x.axis")
                            }
                        },
                        'mousemove': function (d) {
                            if(that.mode === "default") {
                                if(PykCharts.boolean(that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlightGroup(that.selector+" "+".groupedColumn-rect", this, "rect");
                                }
                                that.mouseEvent.axisHighlightShow(d.name,that.selector+" "+".x.axis",that.xdomain);
                            }
                        }
                    });

                var bar = chart.selectAll("rect")
                            .data(function (d) { return d.data; });

                bar.enter()
                    .append("rect")

                bar.attr("height", 0)
                    .attr({
                        "x": function (d) {return that.x1(d.name); },
                        "y": that.reduced_height,
                        "width": function (d){ return 0.98*that.x1.rangeBand(); },
                        "fill": function (d,i) {
                            return that.fillColor.colorGroup(d);
                        },
                        "fill-opacity": function (d,i) {
                            if (that.color_mode === "saturation") {
                                return (i+1)/that.no_of_groups;
                            } else {
                                return 1;
                            }
                        },
                        "stroke": that.border.color(),
                        "srtoke-width": that.border.width(),
                        "stroke-dasharray": that.border.style(),
                        "data-fill-opacity": function () {
                            return d3.select(this).attr("fill-opacity");
                        },
                        "data-id":function (d,i) {
                            return d.name;
                        }
                    })
                    .on({
                        'mouseover': function (d) {
                            if(that.mode === "default" && PykCharts['boolean'](that.tooltip_enable)) {
                                var tooltip = d.tooltip ? d.tooltip : d.y
                                that.mouseEvent.tooltipPosition(d);
                                that.mouseEvent.tooltipTextShow(tooltip);
                            }
                        },
                        'mouseout': function (d) {
                            if(that.mode === "default" && PykCharts['boolean'](that.tooltip_enable)) {
                                that.mouseEvent.tooltipHide(d);
                            }
                        },
                        'mousemove': function (d) {
                            if(that.mode === "default" && PykCharts['boolean'](that.tooltip_enable)) {
                                that.mouseEvent.tooltipPosition(d);
                            }
                        },
                        'click': function (d,i) {
                            if(PykCharts['boolean'](that.click_enable)){
                               that.addEvents(d.name, d3.select(this).attr("data-id"));
                            }
                        }
                    })
                    .transition()
                    .duration(that.transitions.duration())
                    .attr({
                        "height": function (d) { return that.reduced_height - that.yScale(d.y); },
                        "y": function (d) {
                            if(that.flag) {
                                that.highlight_y_positions.push(that.yScale(d.y));
                            }
                            return that.yScale(d.y);
                        }
                    });

                chart.exit().remove();
                bar.exit().remove();
                var t = d3.transform(d3.select(d3.selectAll('.groupedColumn-rect')[0][(that.new_data.length-1)]).attr("transform")),
                    x = t.translate[0],
                    y = t.translate[1];
                x_range = [(that.reduced_height-x - (that.x1.rangeBand()*2)),(x + (that.x1.rangeBand()*2))];
                that.xScale1 = that.k.scaleIdentification("linear",x_data,x_range);

                return this;
            },
            mapColors : function () {
                that.no_of_groups = d3.max(that.new_data,function (d){
                    return d.data.length;
                });

                for(var i = 0;i<that.new_data_length;i++) {
                    if(that.new_data[i].data.length === that.no_of_groups) {
                        that.group_data = that.new_data[i].data;
                        that.group_data_length = that.group_data.length;
                        break;
                    }
                }

                that.new_data.forEach(function(d){
                    d.data.forEach(function(data){
                        for (var i=0 ; i<that.group_data_length ; i++) {
                            if (that.group_data[i].name === data.name) {
                                data.color = that.group_data[i].color;
                                break;
                            }
                        }
                    })
                });
            },
            legends: function () {
                if(PykCharts.boolean(that.legends_enable)) {
                    var params = that.group_data,color;
                    color = params.map(function (d) {
                        return d.color;
                    });
                    params = params.map(function (d) {
                        return d.name;
                    });
                    params = that.k.__proto__._unique(params);
                    that.multiD.legendsPosition(that,"groupColumn",params,color);
                }
                return this;
            },
            checkIfHighLightDataExists : function (name) {
                if(that.highlight) {
                    if(that.axis_x_data_format === "number") {
                        that.highlight_group_exits = (that.highlight === name);
                    } else if (that.axis_x_data_format === "string") {
                        that.highlight_group_exits = (that.highlight.toLowerCase() === name.toLowerCase());
                    }
                }
                return this;
            },
            newXAxis : function () {
                if(PykCharts["boolean"](that.axis_x_enable)) {
                    if(that.axis_x_position === "bottom") {
                        that.new_xAxisgroup.attr("transform", "translate(0," + (that.chart_height - that.chart_margin_top - that.chart_margin_bottom - that.legendsGroup_height) + ")");
                    }
                    var xaxis = d3.svg.axis()
                        .scale(that.xScale)
                        .orient(that.axis_x_pointer_position)
                        .tickSize(0)
                        .outerTickSize(that.axis_x_outer_pointer_length);
                    that.new_xAxisgroup.style("stroke",function () { return that.axis_x_line_color; })
                        .call(xaxis);
                    d3.selectAll(that.selector + " .x.new-axis text").style({
                        "display": function () { return "none"; },
                        "stroke": "none"
                    });
                }

                return this;
            },
            highlightRect : function () {
                if(that.flag) {

                    function setTimeoutHighlight() {
                        x = that.highlight_x_positions - 5;

                        var highlight_rect = that.group.selectAll(".highlight-groupedColumn-rect")
                            .data([that.highlight])

                        highlight_rect.enter()
                            .append("rect")

                        highlight_rect.attr({
                            "class": "highlight-groupedColumn-rect",
                            "x": x,
                            "y": 0,
                            "width": (that.x1.rangeBand()* that.group_data.length)+10,
                            "height": that.reduced_height+ 5,
                            "fill": "none",
                            "stroke": that.highlight_color,
                            "stroke-width": "1.5px",
                            "stroke-dasharray": "5,5",
                            "stroke-opacity": 1
                        });
                        highlight_rect.exit()
                            .remove();
                        if(PykCharts["boolean"](that.highlight_x_positions)) {
                            highlight_array = that.highlight;
                        } else {
                            highlight_rect.remove()
                        }
                    }
                    setTimeout(setTimeoutHighlight, that.transitions.duration());
                }
                return this;
            },
        }
        return optional;
    };
};

PykCharts.multiD.scatter = function (options) {
  var that = this;
  that.interval = "";
  var theme = new PykCharts.Configuration.Theme({});

  this.execute = function(pykquery_data) {
    that = new PykCharts.validation.processInputs(that, options, 'multiDimensionalCharts');
    that.bubbleRadius = options.scatterplot_radius ? options.scatterplot_radius : theme.multiDimensionalCharts.scatterplot_radius;
    that.panels_enable = "no";
    PykCharts.scaleFunction(that);

    try {
      if(!that.k.__proto__._isNumber(that.bubbleRadius)) {
        that.bubbleRadius = theme.multiDimensionalCharts.scatterplot_radius;
        throw "bubbleRadius";
      }
    }

    catch (err) {
      that.k.warningHandling(err,"1");
    }

    if(that.stop){
      return;
    }
    that.k.storeInitialDivHeight();
    if(that.mode === "default") {
      that.k.loading();
    }

    var multiDimensionalCharts = theme.multiDimensionalCharts,
    stylesheet = theme.stylesheet;

    that.multiD = new PykCharts.multiD.configuration(that);
    that.scatterplot_pointer_enable =  options.scatterplot_pointer_enable ? options.scatterplot_pointer_enable.toLowerCase() : multiDimensionalCharts.scatterplot_pointer_enable;
    that.zoomed_out = true;

    if(PykCharts['boolean'](that.panels_enable)) {
      that.radius_range = [that.k.__proto__._radiusCalculation(1.1)*2,that.k.__proto__._radiusCalculation(2.6)*2];
    } else {
      that.radius_range = [that.k.__proto__._radiusCalculation(4.5)*2,that.k.__proto__._radiusCalculation(11)*2];
    }

    that.executeData = function (data) {
      var validate = that.k.validator().validatingJSON(data),
      id = that.selector.substring(1,that.selector.length);
      if(that.stop || validate === false) {
        that.k.remove_loading_bar(id);
        return;
      }

      that.data = that.k.__proto__._groupBy("scatterplot",data);
      that.axis_y_data_format = that.k.yAxisDataFormatIdentification(that.data);
      that.axis_x_data_format = that.k.xAxisDataFormatIdentification(that.data);
      if(that.axis_x_data_format === "time" && that.axis_x_time_value_datatype === "") {
        console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to have passed Date data so please pass the value for axis_x_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_15");
      }
      if(that.axis_y_data_format === "time" && that.axis_y_time_value_datatype === "") {
        console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to have passed Date data so please pass the value for axis_x_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_15");
      }
      that.compare_data = that.k.__proto__._groupBy("scatterplot",data);
      that.k.remove_loading_bar(id);
      var a = new PykCharts.multiD.scatterplotFunctions(options,that,"scatterplot");
      a.render();
    };
    if (PykCharts['boolean'](that.interactive_enable)) {
        that.k.dataFromPykQuery(pykquery_data);
        that.k.dataSourceFormatIdentification(that.data,that,"executeData");
    } else {
        that.k.dataSourceFormatIdentification(options.data,that,"executeData");
    }

  };
};
PykCharts.multiD.panelsOfScatter = function (options) {
  var that = this;
  that.interval = "";
  var theme = new PykCharts.Configuration.Theme({});

  this.execute = function(pykquery_data) {
    that = new PykCharts.validation.processInputs(that, options, 'multiDimensionalCharts');
    PykCharts.scaleFunction(that);
    that.bubbleRadius = options.scatterplot_radius ? options.scatterplot_radius : theme.multiDimensionalCharts.scatterplot_radius;
    that.panels_enable = "yes";
    that.legends_display = "horizontal";
    try {
      if(!that.k.__proto__._isNumber(that.bubbleRadius)) {
        that.bubbleRadius = theme.multiDimensionalCharts.scatterplot_radius;
        throw "bubbleRadius"
      }
    }

    catch (err) {
      that.k.warningHandling(err,"1");
    }

    if(that.stop){
      return;
    }
    that.k.storeInitialDivHeight();
    if(that.mode === "default") {
      that.k.loading();
    }

    var multiDimensionalCharts = theme.multiDimensionalCharts,
    stylesheet = theme.stylesheet;

    that.multiD = new PykCharts.multiD.configuration(that);
    that.scatterplot_pointer_enable =  options.scatterplot_pointer_enable ? options.scatterplot_pointer_enable.toLowerCase() : multiDimensionalCharts.scatterplot_pointer_enable;
    that.zoomed_out = true;

    if(PykCharts['boolean'](that.panels_enable)) {
      that.radius_range = [that.k.__proto__._radiusCalculation(3.5)*2,that.k.__proto__._radiusCalculation(8)*2];
    } else {
      that.radius_range = [that.k.__proto__._radiusCalculation(4.5)*2,that.k.__proto__._radiusCalculation(11)*2];
    }

    that.executeData = function (data) {
      var validate = that.k.validator().validatingJSON(data),
      id = that.selector.substring(1,that.selector.length);
      if(that.stop || validate === false) {
        that.k.remove_loading_bar(id);
        return;
      }

      that.data = that.k.__proto__._groupBy("scatterplot",data);
      that.axis_y_data_format = that.k.yAxisDataFormatIdentification(that.data);
      that.axis_x_data_format = that.k.xAxisDataFormatIdentification(that.data);
      if(that.axis_x_data_format === "time" && that.axis_x_time_value_datatype === "") {
        console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to have passed Date data so please pass the value for axis_x_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_15");
      }
      if(that.axis_y_data_format === "time" && that.axis_y_time_value_datatype === "") {
        console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to have passed Date data so please pass the value for axis_x_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_15");
      }
      that.compare_data = that.k.__proto__._groupBy("scatterplot",data);
      that.k.remove_loading_bar(id);
      var a = new PykCharts.multiD.scatterplotFunctions(options,that,"scatterplot");
      a.render();
    };
    if (PykCharts['boolean'](that.interactive_enable)) {
        that.k.dataFromPykQuery(pykquery_data);
        that.k.dataSourceFormatIdentification(that.data,that,"executeData");
    } else {
        that.k.dataSourceFormatIdentification(options.data,that,"executeData");
    }
  };
};
PykCharts.multiD.pulse = function (options) {
  var that = this;
  that.interval = "";
  var theme = new PykCharts.Configuration.Theme({});

  this.execute = function(pykquery_data) {
    that = new PykCharts.validation.processInputs(that, options, 'multiDimensionalCharts');
    PykCharts.scaleFunction(that);
    var multiDimensionalCharts = theme.multiDimensionalCharts,
    stylesheet = theme.stylesheet;

    that.multiD = new PykCharts.multiD.configuration(that);
    that.bubbleRadius = options.scatterplot_radius ? options.scatterplot_radius : (0.6 * multiDimensionalCharts.scatterplot_radius);
    that.panels_enable = "no";

    try {
      if(!that.k.__proto__._isNumber(that.bubbleRadius)) {
        that.bubbleRadius = (0.6 * multiDimensionalCharts.scatterplot_radius);
        throw "bubbleRadius"
      }
    }

    catch (err) {
      that.k.warningHandling(err,"1");
    }

    if(that.stop) {
      return;
    }
    that.k.storeInitialDivHeight();
    that.zoomed_out = true;
    that.radius_range = [that.k.__proto__._radiusCalculation(1.1)*2,that.k.__proto__._radiusCalculation(3.5)*2];

    if(that.mode === "default") {
      that.k.loading();
    }

    that.executeData = function (data) {
      var validate = that.k.validator().validatingJSON(data),
      id = that.selector.substring(1,that.selector.length);
      if(that.stop || validate === false) {
        that.k.remove_loading_bar(id);
        return;
      }
      that.data = that.k.__proto__._groupBy("pulse",data);
      that.axis_y_data_format = that.k.yAxisDataFormatIdentification(that.data);
      that.axis_x_data_format = that.k.xAxisDataFormatIdentification(that.data);
      if(that.axis_x_data_format === "date" && that.axis_x_time_value_datatype === "") {
        console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to pass Date data so please pass axis_x_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_15");
      }
      if(that.axis_y_data_format === "date" && that.axis_y_time_value_datatype === "") {
        console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to pass Date data so please pass axis_y_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_15");
      }
      that.compare_data = that.k.__proto__._groupBy("pulse",data);
      that.k.remove_loading_bar(id);
      var a = new PykCharts.multiD.scatterplotFunctions(options,that,"pulse");
      a.render();
    };
    if (PykCharts['boolean'](that.interactive_enable)) {
        that.k.dataFromPykQuery(pykquery_data);
        that.k.dataSourceFormatIdentification(that.data,that,"executeData");
    } else {
        that.k.dataSourceFormatIdentification(options.data,that,"executeData");
    }
  };
};
PykCharts.multiD.scatterplotFunctions = function (options,chartObject,type) {
  var that = chartObject;
  that.refresh = function (pykquery_data) {
    that.executeRefresh = function (data) {
      that.data = that.k.__proto__._groupBy("scatterplot",data);
      that.refresh_data = that.k.__proto__._groupBy("scatterplot",data);
      var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
      that.compare_data = compare[0];
      var data_changed = compare[1];

      that.uniq_group_arr = that.k.__proto__._unique(that.data.map(function (d) {
        return d.group;
      }));

      if(compare[1]) {
        that.k.lastUpdatedAt("liveData");
      }
      that.map_group_data = that.multiD.mapGroup(that.data);
      if(that.axis_x_data_format === "time") {
        that.data.forEach(function (d) {
          d.x = that.k.dateConversion(d.x);
        });
      }
      if(!PykCharts['boolean'](that.panels_enable)) {
        that.new_data = that.data;
        that.optionalFeatures()
        .createChart()
        .legends()
        .plotCircle()
        .ticks();
        if(type === "scatterplot") {
          that.optionalFeatures().label(0)
            .labelPosition();
        }
      } else if(PykCharts['boolean'](that.panels_enable) && type === "scatterplot") {
        document.querySelector(that.selector + " #panels_of_scatter_main_div").innerHTML = null;
        that.renderChart();
      }
      that.k.xAxis(that.svgContainer,that.xGroup,that.x,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
      .yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width)
    };
    if (PykCharts['boolean'](that.interactive_enable)) {
        that.k.dataFromPykQuery(pykquery_data);
        that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
    } else {
        that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
    }
  };

  that.calculatePanelInRow = function () {
      var width= parseInt(that.k._getHighestParentsAttribute(that.selector,"width")),total_width;
      if(width) {
          total_width = width;
      } else {
          total_width = d3.select("body").style("width");
      }

      that.no_of_containers_in_row = Math.floor(parseInt(total_width)/that.chart_width);

      if(that.no_of_containers_in_row > that.uniq_group_arr.length) {
          that.no_of_containers_in_row = that.uniq_group_arr.length;
      }

      if(total_width < that.chart_width) {
          that.no_of_containers_in_row = 1;
      }
  }

  this.render = function () {
    var id = that.selector.substring(1,that.selector.length);
    that.container_id = id + "_svg";
    that.map_group_data = that.multiD.mapGroup(that.data);
    that.fillChart = new PykCharts.Configuration.fillChart(that);
    that.transitions = new PykCharts.Configuration.transition(that);

    that.border = new PykCharts.Configuration.border(that);
    that.uniq_group_arr = that.k.__proto__._unique(that.data.map(function (d) {
      return d.group;
    }));


    that.no_of_groups = 1;

    if(PykCharts["boolean"](that.panels_enable)) {
      that.calculatePanelInRow();
    }

    if(that.axis_x_data_format === "time") {
      that.data.forEach(function (d) {
        d.x = that.k.dateConversion(d.x);
      });
    }
    if(that.mode === "default") {
      if(PykCharts['boolean'](that.panels_enable) && type === "scatterplot") {
        that.w = that.chart_width;
        that.chart_height = that.chart_height;
        that.chart_margin_left = that.chart_margin_left;
        that.chart_margin_right = that.chart_margin_right;

        that.k.title(that.new_width)
        .backgroundColor(that)
        .export(that,that.container_id,type,that.panels_enable,that.uniq_group_arr,that.new_width)
        .emptyDiv(that.selector)
        .subtitle(that.new_width);

        d3.select(that.selector).append("div")
        .attr("id","panels_of_scatter_main_div");
        that.renderChart();
        that.k.xAxis(that.svgContainer,that.xGroup,that.x,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
        .yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width)
        .xAxisTitle(that.xGroup,that.legendsGroup_height,that.legendsGroup_width)
        .yAxisTitle(that.yGroup);

      } else {
        that.k.title()
        .backgroundColor(that)
        .export(that,"#"+that.container_id+"0",type)
        .emptyDiv(that.selector)
        .subtitle();

        that.w = that.chart_width;
        that.chart_height = that.chart_height;
        that.new_data = that.data;
        that.k.makeMainDiv(that.selector,0);

        that.optionalFeatures()
        .svgContainer(0)
        .legendsContainer(0);

        that.k.liveData(that)
        .tooltip();

        that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
        that.sizes = new PykCharts.multiD.bubbleSizeCalculation(that,that.data,that.radius_range);

        that.optionalFeatures()
        .legends()
        .createGroups(0)
        .createChart()
        .ticks();

        if(type === "scatterplot") {
          that.optionalFeatures().label(0)
            .labelPosition();
        }
        that.k.xAxis(that.svgContainer,that.xGroup,that.x,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
        .yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width)
        .xAxisTitle(that.xGroup,that.legendsGroup_height,that.legendsGroup_width)
        .yAxisTitle(that.yGroup);
        that.k.exportSVG(that,"#"+that.container_id+"0",type)
      }

      that.k.createFooter(that.new_width)
      .lastUpdatedAt()
      .credits()
      .dataSource();

    } else if (that.mode === "infographics") {
      if(PykCharts['boolean'](that.panels_enable) && type === "scatterplot") {
        that.k.backgroundColor(that)
          .export(that,that.container_id,type,that.panels_enable,that.uniq_group_arr,that.new_width)
          .emptyDiv(that.selector);

        that.no_of_groups = that.uniq_group_arr.length;
        that.data_length = that.data.length;
        that.w = that.chart_width;
        that.chart_height = that.chart_height;
        that.chart_margin_left = that.chart_margin_left;
        that.chart_margin_right = that.chart_margin_right;

        for(var i=0;i<that.no_of_groups;i++){
          that.new_data = [];
          for(var j=0;j<that.data_length;j++) {
            if(that.data[j].group === that.uniq_group_arr[i]) {
              that.new_data.push(that.data[j]);
            }
          }
          that.k.makeMainDiv(that.selector,i);

          that.optionalFeatures()
          .svgContainer(i)
          .legendsContainer(i);

          that.k.tooltip();

          that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
          that.sizes = new PykCharts.multiD.bubbleSizeCalculation(that,that.data,that.radius_range);
          that.optionalFeatures()
          .legends(i)
          .createGroups(i)
          .createChart()
          .label(i)
          .ticks();

          that.k.xAxis(that.svgContainer,that.xGroup,that.x,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
          .yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width)
          .xAxisTitle(that.xGroup,that.legendsGroup_height,that.legendsGroup_width)
          .yAxisTitle(that.yGroup);

          // if((i+1)%4 === 0 && i !== 0) {
          //   that.k.emptyDiv(that.selector);
          // }
        }
        that.optionalFeatures().labelPosition();
        that.k.exportSVG(that,that.container_id,type,that.panels_enable,that.uniq_group_arr)
        that.k.emptyDiv(that.selector);
      } else {

        that.k.backgroundColor(that)
        .export(that,"#"+that.container_id+"0",type)
        .emptyDiv(that.selector);

        that.w = that.chart_width;
        that.new_data = that.data;
        that.k.makeMainDiv(that.selector,0);

        that.optionalFeatures()
        .svgContainer(0)
        .legendsContainer(0);

        that.k.liveData(that)
        .tooltip();

        that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
        that.sizes = new PykCharts.multiD.bubbleSizeCalculation(that,that.data,that.radius_range);

        that.optionalFeatures()
        .legends()
        .createGroups(0)
        .createChart()
        .ticks();

        if(type === "scatterplot") {
          that.optionalFeatures().label(0)
            .labelPosition()
        }

        that.k.xAxis(that.svgContainer,that.xGroup,that.x,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
        .yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width)
        .xAxisTitle(that.xGroup,that.legendsGroup_height,that.legendsGroup_width)
        .yAxisTitle(that.yGroup);

        that.k.exportSVG(that,"#"+that.container_id+"0",type);
      }
    }

    if(!PykCharts['boolean'](that.panels_enable)) {
      var resize = that.k.resize(that.svgContainer);
      that.k.__proto__._ready(resize);
      window.addEventListener('resize', function(event){
        return that.k.resize(that.svgContainer);
      });
    } else {
      var resize = that.k.resize(undefined,that.new_width);
      that.k.__proto__._ready(resize);
      window.addEventListener('resize', function(event){
        that.calculatePanelInRow();
        return that.k.resize(undefined,that.new_width);
      });
    }
  };

  that.optionalFeatures = function () {
    var id = that.selector.substring(1,that.selector.length);
    var optional = {
      svgContainer :function (i) {
        document.querySelector(that.selector + " #chart-container-" + i).style.width = that.w;
        var element = document.getElementById(id);
        if(!element.classList.contains('PykCharts-weighted')) {
          element.className += " PykCharts-weighted";
        }
        that.svgContainer = d3.select(that.selector + " #chart-container-" + i)
        .append('svg')
        .attr({
          "width": that.w,
          "height": that.chart_height,
          "preserveAspectRatio": "xMinYMin",
          "viewBox": "0 0 " + that.w + " " + that.chart_height,
          "id": that.container_id+ "" + i,
          "class": "svgcontainer"
        });

        return this;
      },
      createGroups : function (i) {
        that.group = that.svgContainer.append("g")
        .attr({
          "transform": "translate("+(that.chart_margin_left)+","+(that.chart_margin_top+that.legendsGroup_height)+")",
          "id": "main"
        });

        that.ticksElement = that.svgContainer.append("g")
        .attr({
          "transform": "translate("+(that.chart_margin_left)+","+(that.chart_margin_top + that.legendsGroup_height)+")",
          "id": "main2"
        });

        if(PykCharts['boolean'](that.axis_x_enable) || that.axis_x_title) {
          that.xGroup = that.group.append("g")
          .attr({
            "class": "x axis",
            "id": "xaxis"
          })
          .style("stroke","black");
        }

        if(PykCharts['boolean'](that.axis_y_enable) || that.axis_y_title){
          that.yGroup = that.group.append("g")
          .attr({
            "class": "y axis",
            "id": "yaxis"
          })
          .style("stroke","blue");
        }

        that.clip = that.group.append("svg:clipPath")
        .attr("id", "clip" + i + that.selector)
        .append("svg:rect")
        .attr({
          "width": (that.w-that.chart_margin_left-that.chart_margin_right-that.legendsGroup_width),
          "height": that.chart_height-that.chart_margin_top-that.chart_margin_bottom - that.legendsGroup_height
        });

        that.chartBody = that.group.append("g")
        .attr({
          "id": "clip"+i,
          "clip-path": "url(#clip" + i + that.selector +")"
        });

        return this;
      },
      legendsContainer : function (i) {

        if (PykCharts['boolean'](that.legends_enable) && that.map_group_data[1] && that.mode === "default") {
          that.legendsGroup = that.svgContainer.append("g")
          .attr('id',"scatterplot-legends")
          .style("visibility","visible");
        } else {
          that.legendsGroup_width = 0;
          that.legendsGroup_height = 0;
        }

        return this;
      },
      createChart : function (index) {
        if (type == "scatterplot") {
          that.new_data.sort(function (a,b) {
            return (b.weight - a.weight);
          });
          that.weight = that.new_data.map(function (d) {
            return d.weight;
          });
          var weight_length = that.weight.length,
          rejected_result = [];
          for(var i=0 ; i<weight_length ; i++) {
            if(that.weight[i] !== 0) {
              rejected_result.push(that.weight[i]);
            }
          }
          that.weight = rejected_result;
          that.sorted_weight = that.weight.slice(0).reverse();

        } else {
          that.weight = that.new_data.map(function (d) {
            return d.weight;
          });
          var weight_length = that.weight.length,
          rejected_result = [];
          for(var i=0 ; i<weight_length ; i++) {
            if(that.weight[i] !== 0) {
              rejected_result.push(that.weight[i]);
            }
          }
          that.weight = rejected_result;
          that.sorted_weight = that.weight.slice(0);

        }
        that.sorted_weight.sort(function(a,b) { return a-b; });

        that.x_tick_values = that.k.processXAxisTickValues();
        that.y_tick_values = that.k.processYAxisTickValues();

        that.group.append("text")
        .attr({
          "fill": "black",
          "text-anchor": "end",
          "x": that.w - 70,
          "y": that.chart_height + 40
        });

        if(that.zoomed_out === true) {

          var x_domain,x_data = [],y_data = [],y_range,x_range,y_domain, min_x_tick_value,max_x_tick_value, min_y_tick_value,max_y_tick_value;

          if(that.axis_y_data_format === "number") {
            y_domain = d3.extent(that.data, function(d) { return parseFloat(d.y) });
            y_data = that.k.__proto__._domainBandwidth(y_domain,2,"number");
            y_range = [that.chart_height - that.chart_margin_top - that.chart_margin_bottom - that.legendsGroup_height, 0];

            min_y_tick_value = d3.min(that.y_tick_values);
            max_y_tick_value = d3.max(that.y_tick_values);

            if(y_data[0] > min_y_tick_value) {
              y_data[0] = min_y_tick_value;
            }
            if(y_data[1] < max_y_tick_value) {
              y_data[1] = max_y_tick_value;
            }

            that.yScale = that.k.scaleIdentification("linear",y_data,y_range);
            that.extra_top_margin = 0;

          } else if(that.axis_y_data_format === "string") {
            that.data.forEach(function(d) { y_data.push(d.y); });
            y_range = [0,that.chart_height - that.chart_margin_top - that.chart_margin_bottom - that.legendsGroup_height];
            that.yScale = that.k.scaleIdentification("ordinal",y_data,y_range,0);
            that.extra_top_margin = (that.yScale.rangeBand() / 2);
          } else if (that.axis_y_data_format === "time") {
            y_data = d3.extent(that.data, function (d) { return new Date(d.x); });

            min_y_tick_value = d3.min(that.y_tick_values, function (d) {
              return new Date(d);
            });

            max_y_tick_value = d3.max(that.y_tick_values, function (d) {
              return new Date(d);
            });

            if(new Date(y_data[0]) > new Date(min_y_tick_value)) {
              y_data[0] = min_y_tick_value;
            }
            if(new Date(y_data[1]) < new Date(max_y_tick_value)) {
              y_data[1] = max__tick_value;
            }

            y_range = [that.chart_height - that.chart_margin_top - that.chart_margin_bottom - that.legendsGroup_height, 0];
            that.yScale = that.k.scaleIdentification("time",y_data,y_range);
            that.extra_top_margin = 0;
          }
          if(that.axis_x_data_format === "number") {
            x_domain = d3.extent(that.data, function(d) { return parseFloat(d.x); });
            x_data = that.k.__proto__._domainBandwidth(x_domain,2);

            min_x_tick_value = d3.min(that.x_tick_values);
            max_x_tick_value = d3.max(that.x_tick_values);

            if(x_data[0] > min_x_tick_value) {
              x_data[0] = min_x_tick_value;
            }
            if(x_data[1] < max_x_tick_value) {
              x_data[1] = max_x_tick_value;
            }

            x_range = [0 ,that.w - that.chart_margin_left - that.chart_margin_right - that.legendsGroup_width];
            that.x = that.k.scaleIdentification("linear",x_data,x_range);
            that.extra_left_margin = 0;

          } else if(that.axis_x_data_format === "string") {
            that.data.forEach(function(d) { x_data.push(d.x); });
            x_range = [0 ,that.w - that.chart_margin_left - that.chart_margin_right - that.legendsGroup_width];
            that.x = that.k.scaleIdentification("ordinal",x_data,x_range,0);
            that.extra_left_margin = (that.x.rangeBand()/2);

          } else if (that.axis_x_data_format === "time") {

            max = d3.max(that.data, function(k) { return k.x; });
            min = d3.min(that.data, function(k) { return k.x; });
            x_domain = [min.getTime(),max.getTime()];
            x_data = that.k.__proto__._domainBandwidth(x_domain,2,"time");

            min_x_tick_value = d3.min(that.x_tick_values, function (d) {
              return that.k.dateConversion(d);
            });

            max_x_tick_value = d3.max(that.x_tick_values, function (d) {
              return that.k.dateConversion(d);
            });

            if(x_data[0] > min_x_tick_value) {
              x_data[0] = min_x_tick_value;
            }
            if(x_data[1] < max_x_tick_value) {
              x_data[1] = max_x_tick_value;
            }

            x_range = [0 ,that.w - that.chart_margin_left - that.chart_margin_right];
            that.x = that.k.scaleIdentification("time",x_data,x_range);

            that.extra_left_margin = 0;
          }

          that.xdomain = that.x.domain();
          that.ydomain = that.yScale.domain();
          that.x1 = 1;
          that.y1 = 12;
          that.count = 1;
          if(type!== "pulse") {
            var zoom = d3.behavior.zoom()
            .scale(that.count)
            .x(that.x)
            .y(that.yScale)
            .on("zoom",zoomed);
          }


          if(PykCharts['boolean'](that.zoom_enable) && !(that.axis_y_data_format==="string" || that.axis_x_data_format==="string") && (that.mode === "default") ) {
            var n;
            if(PykCharts['boolean'](that.panels_enable)) {
              n = that.no_of_groups;
            } else {
              n = 1;
            }

            for(var i = 0; i < that.no_of_groups; i++) {
              d3.select(that.selector+ " #"+that.container_id+""+i)
              .call(zoom)

              d3.select(that.selector+ " #"+that.container_id+""+i)
              .on({
                "wheel.zoom": null,
                "mousewheel.zoom": null
              });
            }
          }
          that.optionalFeatures().plotCircle(index);
        }
        return this ;
      },
      legends : function (index) {
        if (PykCharts['boolean'](that.legends_enable) && that.map_group_data[1] && that.mode==="default") {
          that.multiD.legendsPosition(that,"scatter",that.map_group_data[0],undefined,index);
        }
        return this;
      },
      ticks : function () {
        if(PykCharts['boolean'](that.scatterplot_pointer_enable)) {
          var tick_label = that.ticksElement.selectAll(".ticks_label")
          .data(that.new_data);

          tick_label.enter()
          .append("text")

          tick_label.attr({
            "class": "ticks_label",
            "x": function (d) {
              return that.x(d.x);
            },
            "y": function (d) {
              return that.yScale(d.y) ;
            },
            "pointer-events": "none",
            "dx": -1,
            "dy": function (d) { return -that.sizes(d.weight)-4; }
          })
          .style({
            "text-anchor": "middle",
            "font-family": that.label_family,
            "font-size": that.label_size + "px"
          })
          .text("");
          function setTimeoutTicks() {
            tick_label.text(function (d) {return d.name; });
          }
          setTimeout(setTimeoutTicks,that.transitions.duration());

          tick_label.exit().remove();
        }
        return this;
      },
      plotCircle : function () {
        that.circlePlot = that.chartBody.selectAll(".scatterplot-dot")
        .data(that.new_data)

        that.circlePlot.enter()
        .append("circle")
        .attr("class", "scatterplot-dot");

        that.circlePlot
        .attr({
          "r": 0,
          "cx": function (d) { return (that.x(d.x)+that.extra_left_margin); },
          "cy": function (d) { return (that.yScale(d.y)+that.extra_top_margin); },
          "fill": function (d) { return that.fillChart.colorPieW(d); },
          "fill-opacity": function (d) { return ((type == "pulse" && PykCharts['boolean'](that.variable_circle_size_enable)) ? 1 : that.multiD.opacity(d.weight,that.weight,that.data)); },
          "data-fill-opacity": function (d) {
            return d3.select(this).attr("fill-opacity");
          },
          "data-id":function(d){
            return d.x;
          },
          "stroke": that.border.color(),
          "stroke-width": that.border.width(),
          "stroke-dasharray": that.border.style(),
          "stroke-opacity": 1
        })
        .on({
          'mouseover': function (d,i) {
            if(that.mode === "default") {
              if (PykCharts['boolean'](that.tooltip_enable)) {
                tooltipText = d.tooltip ? d.tooltip : "<table><thead><th colspan='2'><b>"+d.name+"</b></th></thead><tr><td>X</td><td><b>"+d.x+"</b></td></tr><tr><td>Y</td><td><b>"+d.y+"<b></td></tr><tr><td>Weight</td><td><b>"+d.weight+"</b></td></tr></table>";
                that.mouseEvent.tooltipPosition(d);
                that.mouseEvent.tooltipTextShow(tooltipText);
              }
              if (PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                if (PykCharts['boolean'](that.panels_enable)) {
                  that.mouseEvent.highlight(that.selector + " #" + this.parentElement.parentElement.parentElement.parentElement.id + " .scatterplot-dot", this);
                }
                else {
                  that.mouseEvent.highlight(that.selector + " .scatterplot-dot", this);
                }
              }
            }
          },
          'mouseout': function (d,i) {
            if (that.mode === "default") {
              if (PykCharts['boolean'](that.tooltip_enable)) {
                that.mouseEvent.tooltipHide(d);
              }
              if (PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                if (PykCharts['boolean'](that.panels_enable)) {
                  that.mouseEvent.highlightHide(that.selector + " #" + this.parentElement.parentElement.parentElement.parentElement.id + " .scatterplot-dot");
                }
                else {
                  that.mouseEvent.highlightHide(that.selector + " .scatterplot-dot");
                }
              }
            }
          },
          'mousemove': function (d) {
            if (that.mode === "default" && PykCharts['boolean'](that.tooltip_enable)) {
              that.mouseEvent.tooltipPosition(d);
            }
          },
          "dblclick": function() {
            PykCharts.getEvent().stopPropagation();
          },
          "mousedown": function() {
            PykCharts.getEvent().stopPropagation();
          },
          'click': function (d,i) {
              if(PykCharts['boolean'](that.click_enable)){
                 that.addEvents(d.x, d3.select(this).attr("data-id"));
              }
          }
        })
        .transition()
        .duration(that.transitions.duration())
        .attr("r", function (d) { return that.sizes(d.weight); });

        that.circlePlot.exit().remove();
        return this;
      },
      label : function (i) {
        if(PykCharts['boolean'](that.label_size)) {
          var id = that.selector.substring(1,that.selector.length);
          that.circleLabel = that.chartBody.selectAll(".scatterplot-label")
          .data(that.new_data);

          that.circleLabel.enter()
          .append("text")

          that.circleLabel.attr("class","scatterplot-label")
            .attr("id", id + "-bubble-label-" + i)
            .text("");

          that.circleLabel.exit()
          .remove();
        }
        return this;
      },
      labelPosition : function () {
        function setTimeOut() {
          for(var i=0; i<that.no_of_groups;i++) {
            d3.selectAll(that.selector + "-bubble-label-"+i).attr({
              "x": function (d) { return (that.x(d.x)+that.extra_left_margin); },
              "y": function (d) { return (that.yScale(d.y)+that.extra_top_margin + 5); },
              "text-anchor": "middle",
              "pointer-events": "none",
              "fill": that.label_color
            })
            .style({
              "font-weight": that.label_weight,
              "font-size": that.label_size + "px",
              "font-family": that.label_family
            })
            .text(function (d) {
              return d.weight;
            })
            .text(function (d) {
              if((this.getBBox().width < (that.sizes(d.weight) * 2)) && (this.getBBox().height < (that.sizes(d.weight) * 2))) {
                return d.weight;
              } else {
                return "";
              }
            });
          }
        }
        setTimeout(setTimeOut,that.transitions.duration());
        return this;
      }
    };
    return optional;
  };

  function zoomed () {
    that.zoomed_out = false;

    var radius;

    var n = (PykCharts['boolean'](that.panels_enable)) ? that.no_of_groups : 1;
    for(var i = 0; i < n; i++) {
      var current_container = d3.select(that.selector+" #"+that.container_id+""+ i);
      that.k.isOrdinal(current_container,".x.axis",that.x);
      that.k.isOrdinal(current_container,".y.axis",that.yScale);

      that.optionalFeatures().plotCircle()
      .label()
      .ticks();
      d3.select(that.selector+" #"+that.container_id+""+ i)
      .selectAll(".scatterplot-dot")
      .attr({
        "r": function (d) {
          radius = that.sizes(d.weight)*PykCharts.getEvent().scale;
          return radius;
        },
        "cx": function (d) { return (that.x(d.x)+that.extra_left_margin); },
        "cy": function (d) { return (that.yScale(d.y)+that.extra_top_margin); }
      });

      d3.select(that.selector+" #"+that.container_id+""+ i)
      .selectAll(".scatterplot-label")
      .attr({
        "x": function (d) { return (that.x(d.x)+that.extra_left_margin); },
        "y": function (d) { return (that.yScale(d.y)+that.extra_top_margin + 5); }
      })
      .style("font-size", that.label_size +"px");
      d3.select(that.selector+" #"+that.container_id+""+ i)
      .selectAll(".tick_label")
      .attr({
        "x": function (d) {
          return that.x(d.x);
        },
        "y": function (d) {
          return that.yScale(d.y) - radius;
        }
      });
    }
    if(PykCharts.getEvent().sourceEvent.type === "dblclick") {
      that.count++;
    }
    if(that.count === that.zoom_level+1) {
      for(var i = 0; i < n; i++) {
        if(that.panels_enable==="yes"){
          that.new_data = [];
          for(var j=0;j<that.data_length;j++) {
            if(that.data[j].group === that.uniq_group_arr[i]) {
              that.new_data.push(that.data[j]);
            }
          }
        } else {
          that.new_data = that.data;
        }
        d3.select(that.selector+" #"+that.container_id+""+ i)
        .call(function () {
          return that.zoomOut(i);
        });
        that.count = 1;
      }
    }
  };

  that.zoomOut=function (i) {
    that.zoomed_out = true;
    that.x1 = 1;
    that.y1 = 12;

    that.optionalFeatures().createChart(i)
    .label()
    .ticks();
    var currentSvg = d3.select(that.selector + " #"+that.container_id+""+ i),
    current_x_axis = currentSvg.select("#xaxis"),
    current_y_axis = currentSvg.select("#yaxis");
    that.k.xAxis(currentSvg,current_x_axis,that.x,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
    .yAxis(currentSvg,current_y_axis,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width);

    d3.select(that.selector+" #"+that.container_id+""+i)
    .selectAll(".scatterplot-dot")
    .attr({
      "r": function (d) {
        return that.sizes(d.weight);
      },
      "cx": function (d) { return (that.x(d.x)+that.extra_left_margin); },
      "cy": function (d) { return (that.yScale(d.y)+that.extra_top_margin); }
    });

    d3.select(that.selector+" #"+that.container_id+""+ i)
    .selectAll(".scatterplot-label")
    .style("font-size", that.label_size + "px")
    .attr({
      "x": function (d) { return (that.x(d.x)+that.extra_left_margin); },
      "y": function (d) { return (that.yScale(d.y)+that.extra_top_margin + 5); }
    });
  }

  that.renderChart =  function () {
    that.no_of_groups = that.uniq_group_arr.length;
    that.data_length = that.data.length;
    for(var i=0;i<that.no_of_groups;i++){
      that.new_data = [];
      for(var j=0;j<that.data_length;j++) {
        if(that.data[j].group === that.uniq_group_arr[i]) {
          that.new_data.push(that.data[j]);
        }
      }
      that.k.makeMainDiv((that.selector + " #panels_of_scatter_main_div"),i);
      that.optionalFeatures()
      .svgContainer(i)
      .legendsContainer(i);
      // console.log(d3.selectAll("#tooltip-svg-container-" + i + "-pyk-tooltip"+that.selector),);
      var selector = that.selector.substr(1,that.selector.length);
      d3.selectAll("#tooltip-svg-container-" + i + "-pyk-tooltip"+selector)
        .remove();
      that.k.liveData(that)
      .tooltip(true,that.selector,i);

      that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
      that.sizes = new PykCharts.multiD.bubbleSizeCalculation(that,that.data,that.radius_range);
      that.optionalFeatures()
      .legends(i)
      .createGroups(i)
      .createChart()
      .label(i)
      .ticks();

      // if((i+1)%4 === 0 && i !== 0) {
      //   that.k.emptyDiv("#panels_of_scatter_main_div");
      // }
      that.k.xAxis(that.svgContainer,that.xGroup,that.x,that.extra_left_margin,that.xdomain,that.x_tick_values,that.legendsGroup_height)
      .yAxis(that.svgContainer,that.yGroup,that.yScale,that.ydomain,that.y_tick_values,that.legendsGroup_width)
      .xAxisTitle(that.xGroup,that.legendsGroup_height,that.legendsGroup_width)
      .yAxisTitle(that.yGroup);

    }
    that.optionalFeatures().labelPosition();
    that.k.exportSVG(that,that.container_id,type,that.panels_enable,that.uniq_group_arr);
    that.k.emptyDiv(that.selector);
  };
};

PykCharts.multiD.spiderWeb = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});

    this.execute = function (pykquery_data) {
        var multiDimensionalCharts = theme.multiDimensionalCharts;
        that = new PykCharts.validation.processInputs(that, options, 'multiDimensionalCharts');

        that.bubbleRadius = options.spiderweb_radius ? options.spiderweb_radius : (0.6 * multiDimensionalCharts.scatterplot_radius);
        that.spiderweb_outer_radius_percent = options.spiderweb_outer_radius_percent ? options.spiderweb_outer_radius_percent : multiDimensionalCharts.spiderweb_outer_radius_percent;
        that.panels_enable = "no";
        that.data_sort_enable = "yes";
        that.data_sort_type = "alphabetically";
        that.data_sort_order = "ascending";
        try {
            if(!that.k.__proto__._isNumber(that.bubbleRadius)) {
                that.bubbleRadius = (0.6 * multiDimensionalCharts.scatterplot_radius);
                throw "spiderweb_radius";
            }
        }
        catch (err) {
            that.k.warningHandling(err,"1");
        }

        try {
            if(!that.k.__proto__._isNumber(that.spiderweb_outer_radius_percent)) {
                that.bubbleRadius = multiDimensionalCharts.spiderweb_outer_radius_percent;
                throw "spiderweb_outer_radius_percent";
            }
        }

        catch (err) {
            that.k.warningHandling(err,"1");
        }

        if(that.stop) {
            return;
        }
        that.k.storeInitialDivHeight();

        if(that.mode === "default") {
            that.k.loading();
        }

        if(that.spiderweb_outer_radius_percent > 100) {
            that.spiderweb_outer_radius_percent = 100;
        }

        that.multiD = new PykCharts.multiD.configuration(that);

        that.inner_radius = 0;

        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }
            that.data = that.k.__proto__._groupBy("spiderweb",data);
            that.compare_data = that.k.__proto__._groupBy("spiderweb",data);
            that.k.remove_loading_bar(id);
            that.render();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };

    that.dataTransformation = function () {
        that.group_arr = [];
        that.uniq_group_arr = [];
        that.x_arr = [];
        that.uniq_x_arr = [];
        that.data = that.k.__proto__._sortData(that.data, "x", "group", that);
        that.data_length = that.data.length;
        for(var j=0; j<that.data_length; j++) {
            that.group_arr[j] = that.data[j].group;
        }
        that.uniq_group_arr = that.k.__proto__._unique(that.group_arr);
        var len = that.uniq_group_arr.length;

        for(var k=0; k<that.data_length; k++) {
            that.x_arr[k] = that.data[k].x;
        }
        var uniq_x_arr = that.k.__proto__._unique(that.x_arr);

        that.new_data = [];
        for (var k=0; k<len; k++) {
            that.new_data[k] = {
                name: that.uniq_group_arr[k],
                data: []
            };
            for (var l=0; l<that.data_length; l++) {
                if (that.uniq_group_arr[k] === that.data[l].group) {
                    that.new_data[k].data.push({
                        x: that.data[l].x,
                        y: that.data[l].y,
                        weight: that.data[l].weight,
                        color: that.data[l].color,
                        tooltip: that.data[l].tooltip
                    });
                }
            }
        }
        that.new_data_length = that.new_data.length;
    }

    that.refresh = function (pykquery_data) {
        that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("spiderweb",data);
            that.refresh_data = that.k.__proto__._groupBy("spiderweb",data);
            that.map_group_data = that.multiD.mapGroup(that.data);
            that.dataTransformation();
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }
            that.optionalFeatures()
                .createChart()
                .legends()
                .xAxis()
                .yAxis();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
    };

    this.render = function () {
        that.fillChart = new PykCharts.Configuration.fillChart(that);
        var id = that.selector.substring(1,that.selector.length),
            container_id = id + "_svg";
        that.border = new PykCharts.Configuration.border(that);
        that.map_group_data = that.multiD.mapGroup(that.data);
        that.dataTransformation();

        if(that.mode === "default") {
            that.k.title()
                .backgroundColor(that)
                .export(that,"#"+container_id,"spiderweb")
                .emptyDiv(that.selector)
                .subtitle()
                .makeMainDiv(that.selector,1);
            that.h = that.chart_height;
            that.optionalFeatures()
                .svgContainer(container_id,1)
                .legendsContainer(1);

            that.k
                .liveData(that)
                .tooltip();

            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);

            that.optionalFeatures()
                .legends()
                .createGroups();
            that.spiderweb_outer_radius_percent = that.k.__proto__._radiusCalculation(that.spiderweb_outer_radius_percent,"spiderweb");
            that.radius_range = [(3*that.spiderweb_outer_radius_percent)/100,(0.09*that.spiderweb_outer_radius_percent)];
            that.sizes = new PykCharts.multiD.bubbleSizeCalculation(that,that.data,that.radius_range);

            that.optionalFeatures()
                .createChart()
                .xAxis()
                .yAxis();
            that.k.createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource();

        } else if (that.mode==="infographics") {
            that.k.backgroundColor(that)
                .export(that,"#"+container_id,"spiderweb")
                .emptyDiv(that.selector);
            that.k.makeMainDiv(that.selector,1);
            that.h = that.chart_height;
            that.optionalFeatures().svgContainer(container_id,1)
                .legendsContainer()
                .createGroups();
            that.spiderweb_outer_radius_percent = that.k.__proto__._radiusCalculation(that.spiderweb_outer_radius_percent,"spiderweb");
            that.radius_range = [(3*that.spiderweb_outer_radius_percent)/100,(0.09*that.spiderweb_outer_radius_percent)];
            that.sizes = new PykCharts.multiD.bubbleSizeCalculation(that,that.data,that.radius_range);
            that.optionalFeatures()
                .createChart()
                .xAxis()
                .yAxis();

            that.k.tooltip();

            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
        }
        that.k.exportSVG(that,"#"+container_id,"spiderweb")
        var resize = that.k.resize(that.svgContainer);
        that.k.__proto__._ready(resize);
        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer);
        });
    };

    this.degrees = function (radians) {
      return (radians / Math.PI * 180 - 90);
    };

    this.optionalFeatures = function () {
        var that =this,
            id = that.selector.substring(1,that.selector.length),
            status;
        var optional = {
            svgContainer: function (container_id,i) {
                document.getElementById(id).className += " PykCharts-spider-web";
                that.svgContainer = d3.select(that.selector + " #chart-container-" + i)
                    .append("svg")
                    .attr({
                        "class": "svgcontainer",
                        "id": container_id,
                        "width": that.chart_width,
                        "height": that.chart_height,
                        "preserveAspectRatio": "xMinYMin",
                        "viewBox": "0 0 " + that.chart_width + " " + that.chart_height
                    });
                return this;
            },
            createGroups: function () {
                that.group = that.svgContainer.append("g")
                    .attr({
                        "id": "spider-group",
                        "transform": "translate(" + (that.chart_width - that.legendsGroup_width) / 2 + "," + ((that.h+that.legendsGroup_height+20)/2) + ")"
                    });

                that.ticksElement = that.svgContainer.append("g")
                    .attr("transform", "translate(" + (that.chart_width - that.legendsGroup_width)/ 2 + "," + ((that.h+that.legendsGroup_height+20)/2) + ")");
                return this;
            },
            legendsContainer : function (i) {
                if (PykCharts['boolean'](that.legends_enable) && that.map_group_data[1] && that.mode === "default") {
                    that.legendsGroup = that.svgContainer.append("g")
                        .attr({
                            "class": "spiderweb-legends",
                            "id": "legends"
                        });
                } else {
                    that.legendsGroup_width = 0;
                    that.legendsGroup_height = 0;
                }
                return this;
            },
            createChart: function () {
                var i, min, max,
                    uniq = that.new_data[0].data,
                    uniq_length = uniq.length;
                max = d3.max(that.new_data, function (d,i) { return d3.max(d.data, function (k) { return k.y; })});
                min = d3.min(that.new_data, function (d,i) { return d3.min(d.data, function (k) { return k.y; })});

                that.yScale = d3.scale.linear()
                    .domain([min,max])
                    .range([that.inner_radius, that.spiderweb_outer_radius_percent]);
                that.y_domain = [], that.nodes = [];
                var t = [];
                for (var i=0;i<that.new_data_length;i++){
                    var new_y_values = [];
                    for (var j=0;j<that.new_data[i].data.length;j++) {
                        t.push(that.yScale(that.new_data[i].data[j].y));
                        new_y_values[j] = that.yScale(that.new_data[i].data[j].y)
                    }
                    that.y_domain[i] = new_y_values;
                }
                that.y = d3.scale.linear()
                        .domain(d3.extent(t, function(d) { return parseFloat(d); }))
                        .range([0.1,0.9]);
                for (var i=0;i<that.new_data_length;i++){
                    var xyz = [];
                    for (var j=0;j<uniq_length;j++) {
                        xyz[j] = {
                            x: j,
                            y: that.y(that.y_domain[i][j]),
                            tooltip: that.new_data[i].data[j].tooltip || that.new_data[i].data[j].weight
                        }
                    }
                    that.nodes[i] = xyz;
                }
                that.radius = d3.scale.linear().range([that.inner_radius, that.spiderweb_outer_radius_percent]);
                for (var m =0; m<that.new_data_length; m++) {
                    // console.log(that.new_data,"new_data")
                    var toolTip = [];
                    for (j=0; j<that.new_data[m].data.length;j++) {
                        toolTip[j] = that.new_data[m].data[j].tooltip;
                    }

                    that.angle = d3.scale.ordinal().domain(d3.range(that.new_data[m].data.length+1)).rangePoints([0, 2 * Math.PI]);


                    that.yAxis = [];
                    for (var i=0;i<that.new_data[m].data.length;i++){
                        that.yAxis.push(
                            {x: i, y: 0.25},
                            {x: i, y: 0.5},
                            {x: i, y: 0.75},
                            {x: i, y: 1}
                        );
                    }
                    // console.log(that.yAxis)
                    var target;
                    var grids = [];
                        that.yAxis_length =  that.yAxis.length;
                    for (var i=0;i<that.yAxis_length;i++) {
                        if (i<(that.yAxis_length-4)) {
                            target = that.yAxis[i+4];
                        } else {
                            target = that.yAxis[i - that.yAxis_length + 4];
                        }
                        grids.push({source: that.yAxis[i], target: target});
                    }

                    var links = [], color;
                    for (var i=0;i<that.nodes[m].length;i++) {
                        if (i<(that.nodes[m].length-1)) {
                            target = that.nodes[m][i+1];
                            color = that.fillChart.colorPieW(that.new_data[m].data[i]);
                        } else {
                            target = that.nodes[m][0];
                            color = that.fillChart.colorPieW(that.new_data[m].data[i]);
                        }
                        links.push({source: that.nodes[m][i], target: target, color : color});
                    }

                    var spider =  that.group.selectAll("#link"+m)
                        .data(links);

                    spider.enter().append("path")
                        .attr("class", "link")

                    spider.attr({
                        "class": "link",
                        "stroke": function (d) {
                            return d.color;
                        },
                        "stroke-opacity": 1,
                        "id": "link"+m,
                        "d": d3.customHive.link()
                                .angle(function(d) { return that.angle(d.x); })
                                .radius(function(d) { return that.radius(d.y); })
                    });
                    spider.exit().remove();

                    that.weight = that.new_data[m].data.map(function (d) {
                        return d.weight;
                    });

                    var weight_length = that.weight.length,
                        rejected_result = [];
                    for(var i=0 ; i<weight_length ; i++) {
                        if(that.weight[i] !== 0) {
                            rejected_result.push(that.weight[i]);
                        }
                    }
                    that.weight = rejected_result;

                    that.sorted_weight = that.weight.slice(0);
                    that.sorted_weight.sort(function(a,b) { return a-b; });
                    var spiderNode = that.group.selectAll(".node"+m)
                        .data(that.nodes[m])

                    spiderNode.enter().append("circle")
                        .attr({
                            "class": "dot node"+m,
                            "transform": function(d) { return "rotate(" + that.degrees(that.angle(d.x)) + ")"; }
                        });

                    spiderNode.attr({
                        "class": "dot node"+m,
                        "cx": function (d) { return that.radius(d.y); },
                        "r": function (d,i) { return that.sizes(that.new_data[m].data[i].weight); },
                        "fill-opacity": function (d,i) {
                            return that.multiD.opacity(that.new_data[m].data[i].weight,that.weight,that.data);
                        },
                        "data-fill-opacity": function () {
                            return d3.select(this).attr("fill-opacity");
                        },
                        "stroke": that.border.color(),
                        "stroke-width": that.border.width(),
                        "stroke-dasharray": that.border.style(),
                        "data-id":function (d,i) {
                            return that.new_data[0].data[i].x;
                        }
                    })
                    .style("fill", function (d,i) {
                        return that.fillChart.colorPieW(that.new_data[m].data[i]);
                    })
                    .on({
                        'mouseover': function (d,i) {
                            if(that.mode === "default") {
                                that.mouseEvent.tooltipPosition(d);
                                that.mouseEvent.tooltipTextShow(d.tooltip);
                                if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlight(that.selector + " .dot", this);
                                }
                            }
                        },
                        'mouseout': function (d) {
                            if(that.mode === "default") {
                                that.mouseEvent.tooltipHide(d);
                                if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlightHide(that.selector + " .dot");
                                }
                            }
                        },
                        'mousemove': function (d) {
                            if(that.mode === "default") {
                                that.mouseEvent.tooltipPosition(d);
                            }
                        },
                        'click': function (d,i) {
                            if(PykCharts['boolean'](that.click_enable)) {
                               that.addEvents(that.new_data[0].data[i].x, d3.select(this).attr("data-id"));
                            }
                        }
                    });
                    spiderNode.exit().remove();
                }

                that.group.selectAll(".axis")
                    .data(d3.range(that.new_data[0].data.length))
                    .enter().append("line")
                    .attr({
                        "class": "axis",
                        "transform": function(d) { return "rotate(" + that.degrees(that.angle(d)) + ")"; },
                        "x1": that.radius.range()[0],
                        "x2": that.radius.range()[1]
                    });

                that.group.selectAll(".grid")
                    .data(grids)
                    .enter().append("path")
                    .attr({
                        "class": "grid",
                        "d": d3.customHive.link()
                                .angle(function(d) { return that.angle(d.x); })
                                .radius(function(d) { return that.radius(d.y); })
                    });

                return this;
            },
            legends : function () {
                if (PykCharts['boolean'](that.legends_enable) && that.map_group_data[1] && that.mode==="default") {
                    that.multiD.legendsPosition(that,"spiderWeb",that.map_group_data[0]);
                }
                return this;
            },
            xAxis : function () {
                that.length = that.new_data[0].data.length;

                var spiderAxisTitle = that.group.selectAll("text.x-axis-title")
                    .data(that.nodes[0]);

                spiderAxisTitle.enter()
                    .append("text")
                    .attr("class","x-axis-title");

                spiderAxisTitle.attr({
                    "transform": function(d, i){
                        return "translate(" + (-that.spiderweb_outer_radius_percent) + "," + (-that.spiderweb_outer_radius_percent) + ")";
                    },
                    "x": function (d, i){ return that.spiderweb_outer_radius_percent*(1-0.2*Math.sin(i*2*Math.PI/that.length))+(that.spiderweb_outer_radius_percent * 1.25)*Math.sin(i*2*Math.PI/that.length); },
                    "y": function (d, i){
                        return that.spiderweb_outer_radius_percent*(1-0.60*Math.cos(i*2*Math.PI/that.length))-(that.spiderweb_outer_radius_percent * 0.47)*Math.cos(i*2*Math.PI/that.length);
                    }
                })
                .style({
                    "text-anchor": "middle",
                    "font-size": that.axis_x_pointer_size + "px",
                    "font-family": that.axis_x_pointer_family,
                    "font-weight": that.axis_x_pointer_weight,
                    "fill": that.axis_x_pointer_color
                });

                spiderAxisTitle
                    .text(function (d,i) { return that.new_data[0].data[i].x; });

                spiderAxisTitle.exit().remove();
                return this;
            },
            yAxis: function () {
                var a = that.yScale.domain(),
                    t = a[1]/4,
                    b = [];
                for(var i=4,j=0; i>=0 ;i--,j++){
                    b[j]=i*t;
                }
                var tick_label = that.ticksElement.selectAll("text.y-axis-ticks")
                    .data(b);

                tick_label.enter()
                    .append("text")
                    .attr("class","y-axis-ticks");
                tick_label
                    .style("text-anchor","start")
                    .attr({
                        "transform": "translate(5,"+(-that.spiderweb_outer_radius_percent)+")",
                        "x": 0,
                        "y": function (d,i) { return (i*(that.spiderweb_outer_radius_percent/4)); },
                        "dy": -2
                    });

                tick_label
                    .text(function (d,i) { return d; })
                    .style({
                        "font-size": that.axis_y_pointer_size + "px",
                        "font-family": that.axis_y_pointer_family,
                        "font-weight": that.axis_y_pointer_weight,
                        "fill": that.axis_y_pointer_color
                    });

                tick_label.exit().remove();
                return this;
            },
            sort : function() {
                if(that.axis_y_data_format === "string") {
                    try {
                        if(that.data_sort_type === "alphabetically") {
                            that.data = that.k.__proto__._sortData(that.data, "y", "group", that);
                        } else {
                            that.data_sort_type = multiDimensionalCharts.data_sort_type;
                            throw "data_sort_type";
                        }
                    }
                    catch(err) {
                        that.k.warningHandling(err,"8");
                    }
                }
                return this;
            }
        }
        return optional;
    };
};
PykCharts.multiD.waterfall = function(options){
	var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});
    var multiDimensionalCharts = theme.multiDimensionalCharts;

	this.execute = function (pykquery_data) {
        that = new PykCharts.validation.processInputs(that, options, "multiDimensionalCharts");
        that.calculate_total = options.calculate_total ? options.calculate_total : multiDimensionalCharts.calculate_total;
        that.calculate_total_of = options.calculate_total_of ? options.calculate_total_of : [];
        that.axis_y_background_color = options.axis_y_background_color ? options.axis_y_background_color : theme.multiDimensionalCharts.axis_y_background_color;

        PykCharts.scaleFunction(that);
		that.color_mode = "color";
		that.grid_y_enable = "no";
        that.grid_color = "#fff";
        that.panels_enable = "no";
        that.longest_tick_width = 0;
        that.ticks_formatter = d3.format("s");
        try {
        	if (that.chart_color.length == 0) {
	        	that.chart_color = ["rgb(255, 60, 131)", "rgb(0, 185, 250)", "grey"];
	        	throw "chart_color";
	        }
	        else if (that.chart_color.length == 1) {
	        	that.chart_color.push("rgb(0, 185, 250)", "grey");
	        	throw "chart_color";
	        }
	        else if (that.chart_color.length == 2) {
	        	that.chart_color.push("grey");
	        	throw "chart_color";
	        }
        }
        catch(err) {
        	console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to have passed less than three colors for '"+err+"', in a waterfall chart."+"\")  Visit www.pykcharts.com/errors#warning_18");
        }

        if(that.stop) {
            return;
        }
        that.k.storeInitialDivHeight();

        if(that.mode === "default") {
           that.k.loading();
        }
        that.multiD = new PykCharts.multiD.configuration(that);

        that.executeData = function (data) {
			var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);

            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }

            that.data = that.k.__proto__._groupBy("waterfall",data);
            that.compare_data = that.k.__proto__._groupBy("waterfall",data);

            that.axis_y_data_format = that.k.yAxisDataFormatIdentification(that.data);
            that.axis_x_data_format = "number";

            that.k.remove_loading_bar(id);
            PykCharts.multiD.waterfallFunctions(options,that,"waterfall");
            that.render();
		};
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
	};
};

PykCharts.multiD.waterfallFunctions = function (options,chartObject,type) {
    var that = chartObject;

    that.refresh = function (pykquery_data) {
        var element = document.querySelectorAll(".custom-axis");
        for(var i = 0;i<element.length;i++) {
            element[i].parentNode.removeChild(element[i]);
        }

        that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("waterfall",data);
            that.refresh_data = that.k.__proto__._groupBy("waterfall",data);
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }

            that.groupData();
            that.sortData();
            that.calculateRiverData();

            that.optionalFeatures()
                .createScales()
                .ticks()
                .createChart();

            that.k.yAxis(that.svgContainer,that.yGroup,that.yScale,that.yDomain,that.y_tick_values,undefined,undefined,that.tick_format_function)
            that.xaxis();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }
    };

    that.render = function() {
    	var that = this;
        var id = that.selector.substring(1,that.selector.length);
        that.container_id = id + "_svg";
        that.groupData();
        that.sortData();
        that.calculateRiverData();
        that.transitions = new PykCharts.Configuration.transition(that);
        that.mouseEvent1 = new PykCharts.Configuration.mouseEvent(that);
        that.border = new PykCharts.Configuration.border(that);

        that.reducedWidth = that.chart_width - that.chart_margin_left - that.chart_margin_right;
		that.reducedHeight = that.chart_height - that.chart_margin_top - that.chart_margin_bottom;
        // console.log(that.data,that.new_data)
        if (that.mode === "default") {

    		that.k.title()
    			.backgroundColor(that)
    			.export(that, "#"+that.container_id,"waterfallChart")
    			.subtitle()
    			.makeMainDiv(that.selector,1);

    		that.optionalFeatures(id)
                .svgContainer(1,that.container_id)
                .createGroups();

            that.k.liveData(that)
                .tooltip()
                .createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource();

            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);

           	that.optionalFeatures(id)
                .axisContainer()
                .createScales()
               	.ticks()
                .createChart();

        } else if(that.mode === "infographics") {
            that.k.backgroundColor(that)
                .export(that,"#"+that.container_id,"waterfallChart")
                .emptyDiv()
                .makeMainDiv(that.selector,1);

            that.optionalFeatures(id)
                .svgContainer(1,that.container_id)
                .createGroups()
            	.axisContainer()
                .createScales()
                .ticks()
                .createChart();

            that.k.tooltip();

            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
        }

        that.k.yAxis(that.svgContainer,that.yGroup,that.yScale,that.yDomain,that.y_tick_values,undefined,undefined,that.tick_format_function)
                  .yAxisTitle(that.yGroup,undefined);

        that.xaxis();
        that.optionalFeatures().axis_background(that.container_id);
        that.k.exportSVG(that,"#"+that.container_id,"waterfallChart");
        var resize = that.k.resize(that.svgContainer);
        that.k.__proto__._ready(resize);
        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer);
        });
    };

    that.optionalFeatures = function (id) {
    	var that = this;
    	var optional = {
    		svgContainer: function (i,container_id) {
                document.getElementById(id).className += " PykCharts-twoD";
                that.svgContainer = d3.select(that.selector + " #chart-container-" + i)
                    .append("svg:svg")
                    .attr("width",that.chart_width)
                    .attr("height",that.chart_height)
                    .attr("id",container_id)
                    .attr("class","svgcontainer")
                    .attr("preserveAspectRatio", "xMinYMin")
                    .attr("viewBox", "0 0 " + that.chart_width + " " + that.chart_height);

                    that.background_rect =  that.svgContainer.selectAll(".background-rect")
                        .data(["rect"])

                    that.background_rect.enter()
                        .append("rect")
                        .attr("class","background-rect")

                    that.background_rect
                        .attr("y",that.chart_margin_top)
                        .attr("width",that.longest_tick_width)
                        .attr("height",that.reducedHeight)
                        .attr("fill",that.axis_y_background_color);

                return this;
            },
            createGroups: function () {
            	that.group = that.svgContainer.append("g")
                    .attr("id","chartsvg")
                    .attr("transform","translate("+ that.chart_margin_left +","+ that.chart_margin_top +")");

                return this;
            },
            createScales: function () {
                that.y_values = [];
                that.x_values = [];
                var river_data_length = that.river_data.length;
                var domain = [];
                for(var i = 0;i<river_data_length;i++) {
                        domain.push(that.river_data[i].y);
                        that.y_values.push(that.river_data[i].unique_name);
                        that.x_values.push(that.river_data[i].end);
                }

                that.y_values.reverse();
                domain.reverse();
                that.tick_format_function = function (d) {
                    var index = d.lastIndexOf('-');
                    if(index!=-1) {
                        return d.substring(0,index);
                    } else {
                        return d;
                    }
                }

            	that.yScale = d3.scale.ordinal()
		        	.domain(that.y_values)
		        	.rangeRoundBands([that.reducedHeight, 0],0.1);

		        that.yDomain = domain;
		        that.data_length = that.data.length;

		        that.bars = that.group.selectAll(".bar")
		        		.data(that.river_data);

		        that.bars.attr("transform", function(d) { return "translate(5, " + that.yScale(d.unique_name) + ")"; });

		        that.bars.enter()
		        	.append("g")
	        		.attr("class", function(d) { return "bar "+d.group; })
	        		.attr("transform", function(d) { return "translate(5, " + that.yScale(d.unique_name) + ")"; });

            	return this;
            },
            axisContainer : function () {
                if(PykCharts.boolean(that.axis_y_enable) || that.axis_y_title) {
                	that.yGroup = that.group.append("g")
                        .attr("id","yaxis")
                        .attr("class","y axis");
                }
                return this;
            },
            createChart: function () {
            	that.y_tick_values = that.k.processYAxisTickValues();
            	that.xScale = d3.scale.linear()
		        	.domain([0, d3.max(that.x_values, function(d) { return d; })])
		        	.range([0, (that.reducedWidth - that.longest_tick_width - 15)]);

		    	var rect = that.bars.selectAll(".rect")
	    				.data(function(d){
	    					return [d];
	    				});

	    		rect.enter().append("rect")
    				.attr("class","rect")
		       		.attr("stroke",that.border.color())
                    .attr("stroke-width",that.border.width())
                    .attr("stroke-dasharray", that.border.style())
                    .attr("stroke-opacity",1);

                var count_rect = 0;

		        rect.attr("x", function(d) { return that.xScale(d.start) + that.longest_tick_width + 15; })
		       		.attr("height", that.yScale.rangeBand())
		       		.attr("width", 0)
		       		.attr("fill", function(d,i) {
                        return d.color;
		       		})
                    .attr("fill-opacity",1)
                    .attr("data-id",function (d,i) {
                        return d.unique_name;
                    })
		       		.on('mouseover',function (d) {
                        if(that.mode === "default") {
                            if(PykCharts["boolean"](that.tooltip_enable)) {
                            	var tooltipText = d.tooltip ? d.tooltip : "<table><thead><th colspan='2'><b>"+d.y+"</b></th></thead><tr><td>Start</td><td><b>"+that.ticks_formatter(d.start)+"</b></td></tr><tr><td>Weight</td><td><b>"+that.ticks_formatter(d.x)+"</b></td></tr></table>";
                                that.mouseEvent.tooltipPosition(d);
                                that.mouseEvent.tooltipTextShow(tooltipText);
                            }
                            that.mouseEvent.axisHighlightShow(d.unique_name,that.selector + " .y.axis",that.y_values,"waterfall");
                            if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                that.mouseEvent.highlight(that.selector + " .rect", this);
                            }
                        }
                    })
                    .on('mouseout',function (d) {
                        if(that.mode === "default") {
                            if(PykCharts["boolean"](that.tooltip_enable)) {
                                that.mouseEvent.tooltipHide(d);
                            }
                            that.mouseEvent.axisHighlightHide(that.selector + " .y.axis");
                            if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                that.mouseEvent.highlightHide(that.selector + " .rect")
                            }
                        }
                    })
                    .on('mousemove', function (d) {
                        if(that.mode === "default" && PykCharts["boolean"](that.tooltip_enable)) {
                            that.mouseEvent.tooltipPosition(d);
                        }
                    })
                    .on('click', function (d,i) {
                        if(PykCharts['boolean'](that.click_enable)){
                           that.addEvents(d.unique_name, d3.select(this).attr("data-id"));
                        }
                    })
                    .transition()
               		.duration(that.transitions.duration())
               		.delay(function(d) { count_rect++; return (count_rect / that.data_length) * that.transitions.duration(); })
               		.attr("x", function(d) { return (that.xScale((d.group == "negative") ? d.end : d.start)) + that.longest_tick_width + 15; })
		       		.attr("width", function(d) {
                            return Math.abs(that.xScale(d.x));
                        });

                rect.exit()
                	.remove();

                that.bars.exit()
                	.remove();

		       	return this;
            },
            ticks: function() {
            	if(that.pointer_size) {
                    // that.background_rect.remove()
                    //     .exit();

            		var ticks = that.bars.selectAll(".ticks-text")
		    				.data(function(d){
		    					return [d];
		    				});

		    		ticks.enter().append("text")
	    				.attr("class","ticks-text")
	                    .style("font-weight", that.pointer_weight)
	                    .style("font-size", that.pointer_size + "px")
	                    .style("font-family", that.pointer_family)
	                    .text("");

	            	ticks.text(function(d) {
			       			return that.ticks_formatter(d.x);
			       		})
			       		.style("visibility","hidden")
			       		.attr("y", function(d) { return (that.yScale.rangeBand()/2 + this.getBBox().height/3); })
			       		.attr("dx", ".25em")
			       		.attr("fill", function(d) {
	                    	that.longest_tick_width = (that.longest_tick_width < this.getBBox().width) ? this.getBBox().width : that.longest_tick_width;

	                    	if (d.group == "negative") {
			       				return that.chart_color[0];
			       			}
			       			else if (d.group == "positive") {
			       				return that.chart_color[1];
			       			}
	                    })
			       		.style("visibility","visible");

			       	ticks.exit()
			       		.remove();

			    }

            	return this;
            },
            axis_background: function (container_id) {
                if(PykCharts.boolean(that.axis_y_enable) && that.axis_y_pointer_size) {
                    var y_axis_text = document.querySelectorAll("#"+container_id+" #yaxis .tick text");
                    var y_axis_text_length = y_axis_text.length,text = [];
                    for(var i=0;i<y_axis_text_length;i++) {
                        text.push(y_axis_text[i].getBBox().width)
                    }
                    var max_width = d3.max(text,function(d){
                        return d;
                    })

                    that.background_rect
                        .attr("x",that.chart_margin_left - max_width - 10)
                        .attr("width",max_width+10);


                    that.background_rect.exit()
                        .remove();
                }
                return this;
            }
    	};
    	return optional;
    };
    that.groupData = function() {
        that.group_arr = [], that.new_data = [];
        that.ticks = [], that.x_arr = [];

        for(j = 0;j < that.data.length;j++) {

            that.group_arr[j] = that.data[j].group;
        }
        that.uniq_group_arr = that.k.__proto__._unique(that.group_arr);
        var uniq_group_arr_length = that.uniq_group_arr.length;

        for(var k = 0;k < that.data.length;k++) {
            that.x_arr[k] = +that.data[k].x;
        }
        var uniq_x_arr = that.k.__proto__._unique(that.x_arr);

        that.flag = 0;

        for (var k = 0;k < uniq_group_arr_length;k++) {
            that.new_data[k] = {
                    name: that.uniq_group_arr[k],
                    data: []
            };
            for (var l = 0;l < that.data.length;l++) {
                if (that.uniq_group_arr[k] === that.data[l].group) {
                    that.new_data[k].data.push({
                        x: +that.data[l].x,
                        y: that.data[l].y,
                        tooltip: that.data[l].tooltip,
                        name: that.data[l].group,
                        unique_name: that.data[l].group ? (that.data[l].y + "-" + that.data[l].group) : that.data[l].y
                    });
                }
            }
        }
        that.new_data_length = that.new_data.length;
    }

    that.dataTransformation = function (new_data) {
    	var cumulative = 0,
    		temp_cumulative = 0,
    		total_start = 0,
    		total_end = 0,
    		total_weight = 0,
    		totol_group = 'positive',
            data = new_data.data,
            name = 'Total';

    	var data_length = data.length
    	   ,rect_data = [];

    	for(var i = 0; i<that.data.length;i++) {
            temp_cumulative += that.data[i].x;
            if (temp_cumulative < cumulative) {
                cumulative = temp_cumulative;
            }
        }

        if(new_data.name) {
            name =  name + " " + new_data.name;
        }

    	if (cumulative<0) { cumulative = Math.abs(cumulative); }
    	else { cumulative = 0; }
        data = that.rivergroup(cumulative,data,name,cumulative,new_data.name);

        return data;
    };

    that.check_total_is_present = function (data) {
        var present = false;
        for(var l = 0;l<that.calculate_total_of.length;l++) {
            if(data === that.calculate_total_of[l]) {
                present = true;
                break;
            }
        }
        return present;
    }

    that.rivergroup = function (start,data,name,cumulative,group_name) {
        var store_cumulative = cumulative;
        for (var i=0 ; i<data.length ; i++) {
            data[i].start = cumulative;
            cumulative += data[i].x;
            data[i].end = cumulative;
            data[i].group = (data[i].x > 0) ? "positive" : "negative"
            data[i].color = (data[i].x > 0) ? that.chart_color[1] : that.chart_color[0];
            data[i].name = data[i].name;
            that.river_data.push(data[i]);
        }
        total_start = start;
        total_end = data[data.length-1].end;
        total_weight = total_end - total_start;
        totol_group = (total_weight < 0) ? 'negative' : 'positive';

        that.river_data.push({
            y: name,
            x: total_weight,
            end: total_end,
            start: total_start,
            group: totol_group,
            color: that.chart_color[2],
            name: data[data.length-1].name,
            unique_name: group_name ? (name+"-"+group_name) : name
        });
        return data;
    }
    that.calculateRiverData = function () {
        that.river_data = [];
        var prev_total;
        for(var i = 0;i<that.new_data_length;i++) {
            if(i===0) {
                that.dataTransformation(that.new_data[i]);
            } else {
                var previous_data_length = that.river_data.length;
                prev_total = that.river_data[previous_data_length-1];
                var present = that.check_total_is_present(prev_total.name);
                if(!PykCharts["boolean"](that.calculate_total)) {
                    that.river_data.pop();
                } else if (!present && that.calculate_total_of.length) {
                    that.river_data.pop();
                }
                name =  'Total' + " " + that.new_data[i].name;
                that.rivergroup(that.river_data[0].start,that.new_data[i].data,name,prev_total.end,that.new_data[i].name);
            }
        }
        present = that.check_total_is_present(that.river_data[that.river_data.length-1].name);
        if(!PykCharts["boolean"](that.calculate_total)) {
            that.river_data.pop();
        } else if (!present && that.calculate_total_of.length) {
            that.river_data.pop();
        }
    }
    that.xaxis = function () {
        var xScale_domain = that.xScale.domain();
        var start_point = that.xScale(xScale_domain[0]) + that.longest_tick_width + 15;
        var end_point = that.xScale(xScale_domain[1]) + that.longest_tick_width + 15,
            extrapadding = 5;
        var middle_point = that.xScale(that.new_data[0].data[0].start) + that.longest_tick_width + 15;
        if(PykCharts['boolean'](that.axis_x_enable)) {
            drawline(start_point+extrapadding,end_point+extrapadding+1,that.reducedHeight,that.reducedHeight);
            drawline(start_point+extrapadding,start_point+extrapadding,that.reducedHeight,that.reducedHeight+that.axis_x_outer_pointer_length)
            drawline(end_point+extrapadding,end_point+extrapadding,that.reducedHeight,that.reducedHeight+that.axis_x_pointer_length)
            drawline(middle_point+extrapadding,middle_point+extrapadding,that.reducedHeight,that.reducedHeight+that.axis_x_pointer_length);

            var text = that.group.selectAll(".custom-axis-text")
                .data([0]);

            text.enter()
                .append("text");

            text.attr("class","custom-axis-text")
                .attr("x",middle_point+extrapadding)
                .attr("y",that.reducedHeight+that.axis_x_pointer_length)
                .attr("dy",12)
                .attr("text-anchor","middle")
                .attr("fill",that.axis_x_pointer_color)
                .style("font-family",that.axis_x_pointer_family)
                .style("font-size",that.axis_x_pointer_size)
                .style("font-weight",that.axis_x_pointer_weight)
                .text("0");

            text.exit().remove();
        }

        function drawline(x1,x2,y1,y2) {
            that.group.append("line")
                .attr("x1",x1)
                .attr("y1",y1)
                .attr("x2",x2)
                .attr("y2",y2)
                .attr("class","custom-axis")
                .attr("stroke",that.axis_x_line_color)
                .attr("stroke-width",1)
                .style("shape-rendering","crispEdges");
        }
    }

    that.sortData = function () {
        if(that.axis_y_data_format === "number" || that.axis_y_data_format === "time") {
            for(var i=0;i<that.new_data_length;i++) {
                that.new_data[i].data = that.k.__proto__._sortData(that.new_data[i].data, undefined, "y", that)
            }
        }
    }
};
PykCharts.maps = {};

PykCharts.maps.processInputs = function (chartObject, options) {
    var theme = new PykCharts.Configuration.Theme({})
        , stylesheet = theme.stylesheet
        , functionality = theme.functionality
        , mapsTheme = theme.mapsTheme
        , optional = options.optional;

    chartObject.timeline_duration = "timeline_duration" in options ? options.timeline_duration : mapsTheme.timeline_duration;

    chartObject.margin_left = options.timeline_margin_left ? options.timeline_margin_left : mapsTheme.timeline_margin_left;
    chartObject.margin_right = options.timeline_margin_right ? options.timeline_margin_right : mapsTheme.timeline_margin_right;
    chartObject.margin_top = options.timeline_margin_top ? options.timeline_margin_top : mapsTheme.timeline_margin_top;
    chartObject.margin_bottom = options.timeline_margin_bottom ? options.timeline_margin_bottom : mapsTheme.timeline_margin_bottom;

    chartObject.tooltip_position_top = options.tooltip_position_top ? options.tooltip_position_top : mapsTheme.tooltip_position_top;
    chartObject.tooltip_position_left = options.tooltip_position_left ? options.tooltip_position_left : mapsTheme.tooltip_position_left;
    chartObject.tooltipTopCorrection = d3.select(chartObject.selector).style("top");
    chartObject.tooltipLeftCorrection = d3.select(chartObject.selector).style("left");

    chartObject.chart_color = options.chart_color ? options.chart_color : [];
    chartObject.saturation_color = options.saturation_color ? options.saturation_color : "";
    chartObject.palette_color = options.palette_color ? options.palette_color : mapsTheme.palette_color;

    chartObject.label_enable = options.label_enable ? options.label_enable.toLowerCase() : mapsTheme.label_enable;
    chartObject.chart_onhover_effect = options.chart_onhover_effect ? options.chart_onhover_effect.toLowerCase() : mapsTheme.chart_onhover_effect;
    chartObject.default_zoom_level = options.default_zoom_level ? options.default_zoom_level : 80;
    chartObject.k = new PykCharts.Configuration(chartObject);
    chartObject.total_no_of_colors = options.total_no_of_colors && chartObject.k.__proto__._isNumber(parseInt(options.total_no_of_colors,10))? parseInt(options.total_no_of_colors,10) : mapsTheme.total_no_of_colors;

    chartObject.k.validator().validatingSelector(chartObject.selector.substring(1,chartObject.selector.length))
        .isArray(chartObject.chart_color,"chart_color")
        .validatingDataType(chartObject.margin_left,"timeline_margin_left",mapsTheme.timeline_margin_left,"margin_left")
        .validatingDataType(chartObject.margin_right,"timeline_margin_right",mapsTheme.timeline_margin_right,"margin_right")
        .validatingDataType(chartObject.margin_top,"timeline_margin_top",mapsTheme.timeline_margin_top,"margin_top")
        .validatingDataType(chartObject.margin_bottom,"timeline_margin_bottom",mapsTheme.timeline_margin_bottom,"margin_bottom")
        .validatingDataType(chartObject.tooltip_position_top,"tooltip_position_top",mapsTheme.tooltip_position_top)
        .validatingDataType(chartObject.tooltip_position_left,"tooltip_position_left",mapsTheme.tooltip_position_left)
        .validatingColor(chartObject.highlight_color,"highlight_color",stylesheet.highlight_color)
        .validatingColor(chartObject.saturation_color,"saturation_color",stylesheet.saturation_color);

        if(chartObject.chart_color.constructor === Array) {
            if(chartObject.chart_color[0]) {
                chartObject.k.validator()
                    .validatingColor(chartObject.chart_color[0],"chart_color",stylesheet.chart_color);
            }
        }

    if (chartObject.color_mode === "saturation") {
        try {
            if(chartObject.total_no_of_colors < 3 || chartObject.total_no_of_colors > 9) {
                chartObject.total_no_of_colors = mapsTheme.total_no_of_colors;
                throw "total_no_of_colors";
            }
        }
        catch (err) {
            chartObject.k.warningHandling(err,"10");
        }
    }

    try {
        if(chartObject.chart_onhover_effect.toLowerCase() === "shadow" || chartObject.chart_onhover_effect.toLowerCase() === "none" || chartObject.chart_onhover_effect.toLowerCase() === "highlight_border" || chartObject.chart_onhover_effect.toLowerCase() === "color_saturation") {
        } else {
            chartObject.chart_onhover_effect = mapsTheme.chart_onhover_effect;
            throw "chart_onhover_effect";
        }
    }
    catch (err) {
        chartObject.k.warningHandling(err,"12");
    }

    try {
        if(!chartObject.k.__proto__._isNumber(chartObject.default_zoom_level)) {
            chartObject.default_zoom_level = 80;
            throw "default_zoom_level"
        }
    }

    catch (err) {
        chartObject.k.warningHandling(err,"1");
    }

    chartObject.timeline_duration = (chartObject.timeline_duration * 1000);

    return chartObject;
};
PykCharts.maps.oneLayer = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});
    this.execute = function (pykquery_data) {
        that = new PykCharts.validation.processInputs(that, options, 'maps');
        that = PykCharts.maps.processInputs(that, options);
        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }
            that.k.storeInitialDivHeight();
            that.data = data;
            that.data_length = that.data.length;
            that.compare_data = data;
            that.k
                .totalColors(that.total_no_of_colors)
                .colorType(that.color_mode)
                .loading(that.loading)
                .tooltip();

                d3.json(PykCharts.assets+"ref/" + that.map_code + "-topo.json", function (e,data) {
                        if(e && e.status === 404) {
                            that.k.errorHandling("map_code","3");
                            that.k.remove_loading_bar(id);
                            return;
                        }

                    that.map_data = data;
                    var map_data_objects_geometries_length = that.map_data.objects.geometries.length;
                    for (var i=0 ; i<map_data_objects_geometries_length ; i++) {
                        var a = that.map_data.objects.geometries[i].properties.NAME_1.replace("'","&#39;");
                        that.map_data.objects.geometries[i].properties.NAME_1 = a;
                    }

                    d3.json(PykCharts.assets+"ref/colorPalette.json", function (data) {
                        that.color_palette_data = data;
                        var validate = that.k.__proto__._where(that.color_palette_data,{name:that.palette_color});

                        try {
                            if (!validate.length) {
                                that.palette_color = theme.mapsTheme.palette_color;
                                throw "palette_color";
                            }
                        }
                        catch (e) {
                            that.k.warningHandling(e,"11");
                        }

                        d3.select(that.selector).html("");
                        d3.select(that.selector).style("height","auto");
                        var oneLayer = new PykCharts.maps.mapFunctions(options,that,"oneLayer");
                        oneLayer.render();
                    });
                });
            that.extent_size = d3.extent(that.data, function (d) { return parseInt(d.size, 10); });
            that.difference = that.extent_size[1] - that.extent_size[0];
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };
};

PykCharts.maps.timelineMap = function (options) {
    var that = this;
    var theme = new PykCharts.Configuration.Theme({});
    this.execute = function (pykquery_data) {
        that = new PykCharts.validation.processInputs(that, options, 'maps');
        that = PykCharts.maps.processInputs(that, options);

        PykCharts.scaleFunction(that);
        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);

            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }
            that.k.storeInitialDivHeight();
            that.timeline_data = data;
            that.compare_data = data;
            var x_extent = d3.extent(data, function (d) { return d.timestamp; }),
                data_length = data.length;

            that.data = that.k.__proto__._where(data, {timestamp: x_extent[0]});
            that.data_length = that.data.length;

            that.redeced_width = that.chart_width - (that.margin_left * 2) - that.margin_left;

            that.k
                .totalColors(that.total_no_of_colors)
                .colorType(that.color_mode)
                .loading(that.loading)
                .tooltip(that.tooltip_enable);

            d3.json(PykCharts.assets+"ref/" + that.map_code + "-topo.json", function (data) {
                that.map_data = data;
                var map_data_objects_geometries_length = that.map_data.objects.geometries.length;
                for (var i=0 ; i<map_data_objects_geometries_length ; i++) {
                    var a = that.map_data.objects.geometries[i].properties.NAME_1.replace("'","&#39;");
                    that.map_data.objects.geometries[i].properties.NAME_1 = a;
                }
                d3.json(PykCharts.assets+"ref/colorPalette.json", function (data) {
                    that.color_palette_data = data;
                    var validate = that.k.__proto__._where(that.color_palette_data, {name:that.palette_color});

                    try {
                        if (!validate.length) {
                            that.palette_color = theme.mapsTheme.palette_color;
                            throw "palette_color";
                        }
                    }
                    catch (err) {
                        that.k.warningHandling(err,"11");
                    }

                    var x_extent = d3.extent(that.timeline_data, function (d) { return d.timestamp; })
                    that.data = that.k.__proto__._where(that.timeline_data, {timestamp: x_extent[0]});
                    that.data_length = that.data.length;

                    that.data.sort(function (a,b) {
                        return a.timestamp - b.timestamp;
                    });
                    d3.select(that.selector).html("");
                    var timeline = new PykCharts.maps.mapFunctions(options,that,"timeline");
                    timeline.render();
                });
            });

            that.extent_size = d3.extent(that.data, function (d) { return parseInt(d.size, 10); });
            that.difference = that.extent_size[1] - that.extent_size[0];
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }
    };
};

PykCharts.maps.mapFunctions = function (options,chartObject,type) {
    var that = chartObject,
        id = that.selector.substring(1,that.selector.length),
        container_id = id + "_svg";

    this.render = function () {
        that.border = new PykCharts.Configuration.border(that);
        that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
        that.k.title()
            .backgroundColor(that)

        if(type === "oneLayer") {
            that.k
            .export(that,"#"+container_id,type)
            .emptyDiv()
            .subtitle()
            .exportSVG(that,"#"+container_id,type)
        }
        that.current_palette = that.k.__proto__._where(that.color_palette_data, {name:that.palette_color, number:that.total_no_of_colors})[0];
        if (type === "timeline"){
             that.k.subtitle();
        }

        that.optionalFeatures()
            .svgContainer(container_id)
            .legendsContainer(that.legends_enable)
            .legends(that.legends_enable)
            .createMap()
            .label(that.label_enable)
            // .enableClick(that.click_enable);

        that.redeced_height = that.chart_height - that.margin_top - that.margin_bottom;

        that.k
            .createFooter()
            .lastUpdatedAt()
            .credits()
            .dataSource();

        if(type === "timeline") {
            that.optionalFeatures()
                .axisContainer(true);
            that.renderDataForTimescale();
            that.backgroundColor();
            that.renderButtons();
            that.renderTimeline();
        }
        var resize = that.k.resize(that.svgContainer);
        that.k.__proto__._ready(resize);
        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer);
        });
    };

    that.refresh = function (pykquery_data) {
        that.executeRefresh = function (data) {
            that.data = data;
            that.data_length = that.data.length;
            that.refresh_data = data;
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }
            that.extent_size = d3.extent(that.data, function (d) { return parseInt(d.size, 10); });
            that.difference = that.extent_size[1] - that.extent_size[0];
            that.optionalFeatures()
                .legends(that.legends_enable)
                .createMap();
        }
        if(type === "oneLayer") {
            if (PykCharts['boolean'](that.interactive_enable)) {
                that.k.dataFromPykQuery(pykquery_data);
                that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
            } else {
                that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
            }
        }
    };

    that.optionalFeatures = function () {
        var id = that.selector.substring(1,that.selector.length);
        var config = {
            legends: function (el) {
                if (PykCharts['boolean'](el)) {
                    that.renderLegend();
                };
                return this;
            },
            legendsContainer : function (el) {
                if (PykCharts['boolean'](el) && that.color_mode === "saturation") {
                    that.legendsContainer = that.svgContainer
                        .append("g")
                        .attr("id", "legend-container");
                } else {
                    that.legendsGroup_height = 0;
                    that.legendsGroup_width = 0;
                }
                return this;
            },
            label: function (el) {
                if (PykCharts['boolean'](el)) {
                    that.renderLabel();
                };
                return this;
            },
            svgContainer : function (container_id) {
                document.getElementById(id).style.width = "100%";

                that.svgContainer = d3.select(that.selector)
                    .append("svg")
                    .attr({
                        "width": that.chart_width,
                        "height": that.chart_height,
                        "id": container_id,
                        "class": 'PykCharts-map',
                        "preserveAspectRatio": "xMinYMin",
                        "viewBox": "0 0 " + that.chart_width + " " + that.chart_height
                    });

                that.map_cont = that.svgContainer.append("g")
                    .attr("id", "map_group")

                var defs = that.map_cont.append('defs');
                var filter = defs.append('filter')
                    .attr('id', 'dropshadow');

                filter.append('feGaussianBlur')
                    .attr({
                        'in': 'SourceAlpha',
                        'stdDeviation': 1,
                        'result': 'blur'
                    });

                filter.append('feOffset')
                    .attr({
                        'in': 'blur',
                        'dx': 1,
                        'dy': 1,
                        'result': 'offsetBlur'
                    });

                var feMerge = filter.append('feMerge');

                feMerge.append('feMergeNode')
                    .attr('in", "offsetBlur');

                feMerge.append('feMergeNode')
                    .attr('in', 'SourceGraphic');
                return this;
            },
            createMap : function () {

                var new_width =  that.chart_width - that.legendsGroup_width;
                var new_height = that.chart_height - that.legendsGroup_height - that.margin_bottom -that.margin_top - 10;
                var scale = 150
                , offset = [new_width / 2, new_height / 2]
                , i;

                document.getElementById(id).style.backgroundColor = that.background_color;

                that.group = that.map_cont.selectAll(".map_group")
                    .data(topojson.feature(that.map_data, that.map_data.objects).features)

                that.group.enter()
                    .append("g")
                    .attr("class","map_group")
                    .append("path");

                if (that.map_code==="world" || that.map_code==="world_with_antarctica") {
                    var center = [0,0];
                } else {
                    var center = d3.geo.centroid(topojson.feature(that.map_data, that.map_data.objects));
                }
                var projection = d3.geo.mercator().center(center).scale(scale).translate(offset);

                that.path = d3.geo.path().projection(projection);

                var bounds = that.path.bounds(topojson.feature(that.map_data, that.map_data.objects)),
                    hscale = scale * (new_width) / (bounds[1][0] - bounds[0][0]),
                    vscale = scale * (new_height) / (bounds[1][1] - bounds[0][1]),
                    scale = (hscale < vscale) ? hscale : vscale,
                    offset = [new_width - (bounds[0][0] + bounds[1][0]) / 2, new_height - (bounds[0][1] + bounds[1][1]) / 2];
                projection = d3.geo.mercator().center(center)
                   .scale((that.default_zoom_level / 100) * scale).translate(offset);

                that.path = that.path.projection(projection);
                var ttp = d3.select("#pyk-tooltip");

                that.chart_data = that.group.select("path")
                    .attr({
                        "d": that.path,
                        "class": "area",
                        "iso2": function (d) {
                            return d.properties.iso_a2;
                        },
                        "area_name": function (d) {
                            return d.properties.NAME_1;
                        },
                        "fill": that.renderColor,
                        "prev_fill": function (d) {
                            return d3.select(this).attr("fill");
                        },
                        "fill-opacity": that.renderOpacity,
                        "data-fill-opacity": function () {
                            return d3.select(this).attr("fill-opacity");
                        },
                        "data-id" : function (d,i) {
                            return d.properties.iso_a2;
                        }
                    })
                    .style({
                        "stroke": that.border.color(),
                        "stroke-width": that.border.width(),
                        "stroke-dasharray": that.border.style()
                    })
                    .on({
                        "mouseover": function (d) {
                            var tooltip_data_found = that.k.__proto__._where(that.data, {iso2: d.properties.iso_a2})[0];
                            if (tooltip_data_found) {
                                if (PykCharts['boolean'](that.tooltip_enable)) {
                                    var tooltip_text = ((that.k.__proto__._where(that.data, {iso2: d.properties.iso_a2})[0]).tooltip) ? ((that.k.__proto__._where(that.data, {iso2: d.properties.iso_a2})[0]).tooltip) : ("<table><thead><th colspan='2'><b>"+d.properties.NAME_1+"</b></th></thead><tr><td>Size</td><td><b>"+((that.k.__proto__._where(that.data, {iso2: d.properties.iso_a2})[0]).size)+"</b></td></tr></table>");

                                    ttp.style("display", "block");
                                    ttp.html(tooltip_text);
                                    if (that.tooltip_mode === "moving") {
                                        ttp.style("top", function () {
                                                return (PykCharts.getEvent().pageY - 20 ) + "px";
                                            })
                                            .style("left", function () {
                                                return (PykCharts.getEvent().pageX + 20 ) + "px";
                                            });
                                    } else if (that.tooltip_mode === "fixed") {
                                        ttp.style("top", (that.tooltip_position_top) + "px")
                                            .style("left", (that.tooltip_position_left) + "px");
                                    }
                                }
                                if(that.onhover1 === "color_saturation" && PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                    that.mouseEvent.highlight(that.selector + " .area", this);
                                }else {
                                    that.bodColor(d);
                                }
                            }
                        },
                        "mouseout": function (d) {
                            if (PykCharts['boolean'](that.tooltip_enable)) {
                                ttp.style("display", "none");
                            }
                            that.bodUncolor(d);
                            that.mouseEvent.highlightHide(that.selector + " .area");
                        },
                        "click" : function (d) {
                            if (PykCharts['boolean'](that.click_enable)) {
                                that.addEvents(d.properties.iso_a2,d3.select(this).attr("data-id"));
                            }
                        }
                    });
                that.group.exit()
                    .remove();
                return this;
            },
            enableClick: function (ec) {
                if (PykCharts['boolean'](ec)) {
                    that.chart_data.on("click", that.clicked);
                    that.onhover1 = that.chart_onhover_effect;
                } else {
                    that.onhover1 = that.chart_onhover_effect;
                }
                return this;
            },
            axisContainer : function (ae) {
                if(PykCharts['boolean'](ae)){
                    that.gxaxis = that.svgContainer.append("g")
                        .attr({
                            "id": "xaxis",
                            "class": "x axis",
                            "transform": "translate("+(that.margin_left*2)+"," + that.redeced_height + ")"
                        });
                }
                return this;
            }
        }
        return config;
    };


    that.renderColor = function (d, i) {
        if (!PykCharts['boolean'](d)) {
            return false;
        }
        var col_shade,
            obj = that.k.__proto__._where(that.data, {iso2: d.properties.iso_a2});
        if (obj.length > 0) {
            if (that.color_mode === "color") {
                if(that.chart_color[0]) {
                    return that.chart_color[0];
                } else if (obj.length > 0 && PykCharts['boolean'](obj[0].color)) {
                    return obj[0].color;
                }
                return that.default_color[0];
            }
            if (that.color_mode === "saturation") {
                if (that.highlight === that.map_data.objects.geometries[i].properties.iso_a2/*obj[0].highlight === true*/) {
                    return that.highlight_color;
                } else {
                    if(that.saturation_color !== "") {
                        return that.saturation_color;
                    } else if (that.palette_color !== "") {
                        col_shade = obj[0].size;
                        for (i = 0; i < that.current_palette.colors.length; i++) {
                            if (col_shade >= that.extent_size[0] + i * (that.difference / that.current_palette.colors.length) && col_shade <= that.extent_size[0] + (i + 1) * (that.difference / that.current_palette.colors.length)) {
                                if (that.data.length===1) {
                                    return that.current_palette.colors[that.current_palette.colors.length-1];
                                }
                                else{
                                    return that.current_palette.colors[i];
                                }
                            }
                        }

                    }
                }
            }
            return that.default_color[0];
        }
        return that.default_color[0];
    };

    that.renderOpacity = function (d) {

        if (that.saturation_color !=="" && that.color_mode === "saturation") {
            that.oneninth = +(d3.format(".2f")(that.difference / that.total_no_of_colors));
            that.opacity = (that.extent_size[0] + (that.k.__proto__._where(that.data, {iso2: d.properties.iso_a2})[0]).size + that.oneninth) / that.difference;
            return that.opacity;
        }
        return 1;
    };

    that.renderLegend = function () {
            var k,
            onetenth;
        if (that.color_mode === "saturation") {
            if(that.legends_display === "vertical" ) {
                var m = 0, n = 0;
                if(that.palette_color === "") {
                    that.legendsContainer.attr("height", (9 * 30)+20);
                    that.legendsGroup_height = 0;
                }
                else {
                    that.legendsContainer.attr("height", (that.current_palette.number * 30)+20);
                    that.legendsGroup_height = 0;
                }
                text_parameter1 = "x";
                text_parameter2 = "y";
                rect_parameter1 = "width";
                rect_parameter2 = "height";
                rect_parameter3 = "x";
                rect_parameter4 = "y";
                rect_parameter1value = 13;
                rect_parameter2value = 13;
                text_parameter1value = function (d,k) { return 38; };
                rect_parameter3value = function (d,k) { return 20; };
                var rect_parameter4value = function (d) {n++; return n * 24 + 12;};
                var text_parameter2value = function (d) {m++; return m * 24 + 23;};

            } else if(that.legends_display === "horizontal") {
                var j = 0, i = 0;
                if(that.palette_color === "") {
                    j = 9, i = 9;
                }
                else {
                    j = that.current_palette.number, i = that.current_palette.number;
                    that.legendsContainer.attr("height", (that.current_palette.number * 30)+20);
                    that.legendsGroup_height = (that.current_palette.number * 30)+20;
                }
                that.legendsContainer.attr("height", 50);
                that.legendsGroup_height = 50;
                final_rect_x = 0;
                final_text_x = 0;
                legend_text_widths = [];
                temp_text = temp_rect = 0;
                text_parameter1 = "x";
                text_parameter2 = "y";
                rect_parameter1 = "width";
                rect_parameter2 = "height";
                rect_parameter3 = "x";
                rect_parameter4 = "y";
                var text_parameter1value = function (d,i) {
                    legend_text_widths[i] = this.getBBox().width;
                    legend_start_x = 16;
                    final_text_x = (i === 0) ? legend_start_x : (legend_start_x + temp_text);
                    temp_text = temp_text + legend_text_widths[i] + 30;
                    return final_text_x;
                };
                text_parameter2value = 30;
                rect_parameter1value = 13;
                rect_parameter2value = 13;
                var rect_parameter3value = function (d,i) {
                    final_rect_x = (i === 0) ? 0 : temp_rect;
                    temp_rect = temp_rect + legend_text_widths[i] + 30;
                    return final_rect_x;
                };
                rect_parameter4value = 18;

            }
            if (that.saturation_color !== "") {
                var leg_data = [], onetenth;
                for(var i=1 ; i<=that.total_no_of_colors ; i++) { leg_data.push(i); }
                onetenth = d3.format(".1f")(that.extent_size[1] / that.total_no_of_colors);
                that.leg = function (d,i) { return "<" + d3.round(onetenth * (i+1)); };

                var legend = that.legendsContainer.selectAll(".rect")
                    .data(leg_data);

                that.legends_text = that.legendsContainer.selectAll(".text")
                    .data(leg_data);

                that.legends_text.enter()
                    .append("text");
                that.legends_text.attr("class","text")
                    .attr("pointer-events","none")
                    .text(that.leg)
                    .attr({
                        "fill": that.legends_text_color,
                        "font-family": that.legends_text_family,
                        "font-size": that.legends_text_size,
                        "font-weight": that.legends_text_weight,
                        "x": text_parameter1value,
                        "y": text_parameter2value
                    });

                legend.enter()
                    .append("rect")

                legend.attr("class","rect")
                    .attr({
                        "x": rect_parameter3value,
                        "y": rect_parameter4value,
                        "width": rect_parameter1value,
                        "height": rect_parameter2value,
                        "fill": that.saturation_color,
                        "fill-opacity": function(d,i) { return (i+1)/that.total_no_of_colors; }
                    });

                var legend_container_width = that.legendsContainer.node().getBBox().width, translate_x;

                    if(that.legends_display === "vertical") {
                        that.legendsGroup_width = legend_container_width + 20;
                    } else  {
                        that.legendsGroup_width = 0;
                    }
                    translate_x = (that.legends_display === "vertical") ? (that.chart_width - that.legendsGroup_width) : (that.chart_width - legend_container_width - 20);
                if (legend_container_width < that.chart_width) {
                    that.legendsContainer.attr("transform","translate("+(translate_x-20)+",10)");
                }
                that.legendsContainer.style("visibility","visible");

                that.legends_text.exit()
                    .remove();
                legend.exit()
                    .remove();

            } else {
                that.leg = function (d,i) { return  "<" + d3.round(that.extent_size[0] + (i+1) * (that.difference / that.current_palette.number)); };
                var legend = that.legendsContainer.selectAll(".rect")
                    .data(that.current_palette.colors);

                that.legends_text = that.legendsContainer.selectAll(".text")
                    .data(that.current_palette.colors);

                that.legends_text.enter()
                    .append("text");
                that.legends_text.attr("class","text")
                    .attr("pointer-events","none")
                    .text(that.leg)
                    .attr({
                        "fill": that.legends_text_color,
                        "font-family": that.legends_text_family,
                        "font-size": that.legends_text_size,
                        "font-weight": that.legends_text_weight,
                        "x": text_parameter1value,
                        "y":text_parameter2value
                    });

                legend.enter()
                    .append("rect");
                legend.attr({
                    "class": "rect",
                    "width": rect_parameter1value,
                    "height": rect_parameter2value,
                    "fill": function (d) { return d; },
                    "x": rect_parameter3value,
                    "y": rect_parameter4value
                });

                var legend_container_width = that.legendsContainer.node().getBBox().width,translate_x;

                    if(that.legends_display === "vertical") {
                        that.legendsGroup_width = legend_container_width + 20;
                    } else  {
                        that.legendsGroup_width = 0;
                    }
                    translate_x = (that.legends_display === "vertical") ? (that.chart_width - that.legendsGroup_width) : (that.chart_width - legend_container_width - 20);
                if (legend_container_width < that.chart_width) { that.legendsContainer.attr("transform","translate("+translate_x+",10)"); }
                that.legendsContainer.style("visibility","visible");

                that.legends_text.exit()
                    .remove();
                legend.exit()
                    .remove();
            }
        } else {
            var c = document.getElementById("legend-container");
            if(c) {
                c.parentNode.removeChild(c);
            }
        }
    };

    that.renderLabel = function () {
        that.group.append("text")
            .attr({
                "x": function (d) { return that.path.centroid(d)[0]; },
                "y": function (d) { return that.path.centroid(d)[1]; },
                "text-anchor": "middle",
                "font-size": "10px",
                "fill": that.label_color,
                "pointer-events": "none"
            })
            .text(function (d) { return d.properties.NAME_1.replace("&#39;","'"); });
    };

    that.bodColor = function (d) {
        var obj = that.k.__proto__._where(that.data, {iso2: d.properties.iso_a2});
        if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
            if (that.onhover1 === "highlight_border") {
                d3.select("path[area_name='" + d.properties.NAME_1 + "']")
                    .style({
                        "stroke": that.border.color(),
                        "stroke-width": parseFloat(that.border.width()) + 1.5 + "px",
                        "stroke-dasharray": that.border.style()
                    });
            } else if (that.onhover1 === "shadow") {
                d3.select("path[area_name='" + d.properties.NAME_1 + "']")
                    .attr({
                        'filter': 'url(#dropshadow)',
                        "fill-opacity": function () {
                            if (that.palette_color === "" && that.color_mode === "saturation") {
                                that.oneninth_dim = +(d3.format(".2f")(that.difference / that.total_no_of_colors));
                                that.opacity_dim = (that.extent_size[0] + (obj[0]).size + that.oneninth_dim) / that.difference;
                                return that.opacity_dim/2;
                            }
                            return 0.5;
                        }
                    });
            }
        } else {
            that.bodUncolor(d);
        }
    };
    that.bodUncolor = function (d) {
        d3.select("path[area_name='" + d.properties.NAME_1 + "']")
            .style({
                "stroke": that.border.color(),
                "stroke-width": that.border.width(),
                "stroke-dasharray": that.border.style()
            })
            .attr({
                'filter': null,
                "fill-opacity": function () {
                    if (that.saturation_color !== "" && that.color_mode === "saturation") {
                        that.oneninth_high = +(d3.format(".2f")(that.difference / that.total_no_of_colors));
                        that.opacity_high = (that.extent_size[0] + (that.k.__proto__._where(that.data, {iso2: d.properties.iso_a2})[0]).size + that.oneninth_high) / that.difference;
                        return that.opacity_high;
                    }
                    return 1;
                }
            });
    };

    this.clicked = function (d) {
        var obj = {};
        obj.container = PykCharts.getEvent().target.ownerSVGElement.parentNode.id;
        obj.area = d.properties;
        obj.data = that.k.__proto__._where(that.data, {iso2: d.properties.iso_a2})[0];
        try {
            customFunction(obj);
        } catch (ignore) {
            /**/
        }
    };

    that.backgroundColor =function () {
        var bg,child1;
        bgColor(that.selector);

        function bgColor(child) {
            child1 = child;
            bg  = d3.select(child).style("background-color");
            if (bg === "transparent" || bg === "rgba(0, 0, 0, 0)") {
                if(d3.select(child)[0][0].parentNode.tagName === undefined || d3.select(child)[0][0].parentNode.tagName.toLowerCase() === "body") {
                    that.k.__proto__._colourBrightness("rgb(255,255,255)",d3.select(child)[0]);
                } else {
                    return bgColor(d3.select(child)[0][0].parentNode);
                }
            } else {
                return that.k.__proto__._colourBrightness(bg,d3.selectAll(child)[0]);
            }
        }

        if (d3.select(child1)[0][0].classList.contains("light") || window.location.pathname === "/overview") {
            that.play_image_url = PykCharts.assets+"img/play.png";
            that.pause_image_url = PykCharts.assets+"img/pause.png";
            that.marker_image_url = PykCharts.assets+"img/marker.png";
        } else {
            that.play_image_url = PykCharts.assets+"img/play-light.png";
            that.pause_image_url = PykCharts.assets+"img/pause-light.png";
            that.marker_image_url = PykCharts.assets+"img/marker-light.png";
        }

    }

    that.renderDataForTimescale = function () {
        that.unique = [];
        x_extent = d3.extent(that.timeline_data, function(d) {return d.timestamp; });
        x_range = [0 ,that.redeced_width];
        that.xScale = that.k.scaleIdentification("linear",x_extent,x_range);
        var timeline_data_length = that.timeline_data.length;
        for (var i=0 ; i<timeline_data_length ; i++) {
            if (that.unique.indexOf(that.timeline_data[i].timestamp) === -1) {
                that.unique.push(that.timeline_data[i].timestamp);
            }
        }
        that.unique.sort(function (a,b) {
          return a - b;
        });
        that.k.xAxis(that.svgContainer,that.gxaxis,that.xScale);
        if(that.gxaxis) {
            that.gxaxis.attr("transform", "translate("+(that.margin_left*2)+"," + that.redeced_height + ")");
        }

    }
    that.renderTimeline = function () {
        var x_extent
        , x_range
        , duration
        , interval = interval1 = that.interval_index = 1;

        that.play.on("click", function () {
            startTimeline();
        });

        that.timeline_status = "";

        var startTimeline = function () {
            if (that.timeline_status==="playing") {
                that.play.attr("xlink:href",that.play_image_url);
                that.timeline_status = "paused";
                that.interval_index = interval;
                clearInterval(that.play_interval);
            } else {
                that.timeline_status = "playing";
                that.play.attr("xlink:href",that.pause_image_url);
                interval = that.interval_index;
                var startInterval = function () {
                    if (interval===that.unique.length) {
                        interval = 0;
                    }

                    that.marker
                        .attr("x",  (that.margin_left*2) + that.xScale(that.unique[interval]) - 7);

                    that.data = that.k.__proto__._where(that.timeline_data, {timestamp:that.unique[interval]});
                    that.data_length = that.data.length;
                    that.data.sort(function (a,b) {
                        return a.timestamp - b.timestamp;
                    });
                    that.extent_size = d3.extent(that.data, function (d) { return parseInt(d.size, 10); });
                    that.difference = that.extent_size[1] - that.extent_size[0];
                    for (var i=0 ; i<that.data_length ; i++) {
                        d3.select(that.selector+" path[iso2='"+that.data[i].iso2+"']")
                            .attr({
                                "fill": that.renderColor,
                                "fill-opacity": that.renderOpacity,
                                "data-fill-opacity": function () {
                                    return d3.select(this).attr("fill-opacity");
                                }
                            });
                    }
                    interval++;
                }
                that.play_interval = setInterval(function () {
                    startInterval();
                    if (interval===1) {
                        that.play.attr("xlink:href",that.play_image_url);
                        that.interval_index = 1;
                        that.timeline_status = "";
                        clearInterval(that.play_interval);
                    };
                }, that.timeline_duration);
                startInterval();
            }
        }
    };

    that.renderButtons = function () {
        var bbox = d3.select(that.selector+" .axis").node().getBBox();
            drag = d3.behavior.drag()
                    .origin(Object)
                    .on("drag",dragmove)
                    .on("dragend", function () {
                        document.getElementsByTagName('body')[0].style.cursor = "default";
                    });
        function dragmove (d) {
            document.getElementsByTagName('body')[0].style.cursor = "pointer";
            if (that.timeline_status !== "playing") {
                var x = PykCharts.getEvent().sourceEvent.pageX - (that.margin_left),
                    x_range = [],
                    temp = that.xScale.range(),
                    len = that.unique.length,
                    pad = (temp[1]-temp[0])/len,
                    strt = 0, left_tick, right_tick, left_diff, right_diff;

                for(var j=0 ; j<len ; j++){
                    strt = strt + pad;
                    x_range[j] = parseInt(strt);
                }

                for(var i=0 ; i<len ; i++) {
                    if (x >= x_range[i] && x <= x_range[i+1]) {
                        left_tick = x_range[i], right_tick = x_range[i+1],
                        left_diff = (x - left_tick), right_diff = (right_tick - x);

                        if ((left_diff >= right_diff) && (i <= (len-2))) {
                            that.marker.attr("x", (that.margin_left*2) + that.xScale(that.unique[i]) - 7);
                            that.data = that.k.__proto__._where(that.timeline_data, {timestamp:that.unique[i]});
                            that.data_length = that.data.length;
                            that.data.sort(function (a,b) {
                                return a.timestamp - b.timestamp;
                            });
                            that.extent_size = d3.extent(that.data, function (d) { return parseInt(d.size, 10); });
                            that.difference = that.extent_size[1] - that.extent_size[0];
                            for (var k=0 ; k<that.data_length ; k++) {
                                d3.select(that.selector+" path[iso2='"+that.data[k].iso2+"']")
                                    .attr({
                                        "fill": that.renderColor,
                                        "fill-opacity": that.renderOpacity,
                                        "data-fill-opacity": function () {
                                            return d3.select(this).attr("fill-opacity");
                                        }
                                    });
                            }
                            that.interval_index = i;
                        }
                    }
                    else if ((x > x_range[i]) && (i > (len-2))) {
                            that.marker.attr("x", (that.margin_left*2) + that.xScale(that.unique[i]) - 7);
                            that.data = that.k.__proto__._where(that.timeline_data, {timestamp:that.unique[i]});
                            that.data_length = that.data.length;
                            that.data.sort(function (a,b) {
                                return a.timestamp - b.timestamp;
                            });
                            that.extent_size = d3.extent(that.data, function (d) { return parseInt(d.size, 10); });
                            that.difference = that.extent_size[1] - that.extent_size[0];
                            for (var k=0 ; k<that.data_length ; k++) {
                                d3.select(that.selector+" path[iso2='"+that.data[k].iso2+"']")
                                    .attr({
                                        "fill": that.renderColor,
                                        "fill-opacity": that.renderOpacity,
                                        "data-fill-opacity": function () {
                                            return d3.select(this).attr("fill-opacity");
                                        }
                                    });
                            }
                            that.interval_index = i;
                    }
                }
            }
        }

        that.play = that.svgContainer.append("image")
            .attr({
                "xlink:href": that.play_image_url,
                "x": that.margin_left / 2,
                "y": that.redeced_height - that.margin_top - (bbox.height/2),
                "width": "24px",
                "height": "21px"
            })
            .style("cursor","pointer");

        that.marker = that.svgContainer.append("image")
            .attr({
                "xlink:href": that.marker_image_url,
                "x": (that.margin_left*2) + that.xScale(that.unique[0]) - 7,
                "y": that.redeced_height,
                "width": "14px",
                "height": "12px"
            })
            .style("cursor","pointer")
            .call(drag);
    }
};

var anonymousFunc = function () {

    var urls = [
      PykCharts.assets+'lib/d3.min.js'
    , PykCharts.assets+'lib/topojson.min.js'
    , PykCharts.assets+'lib/custom-hive.min.js'
    , PykCharts.assets+'lib/colors.min.js'
    , PykCharts.assets+'lib/paper-full.min.js'
    ];

    function importFiles (url) {
        var include = document.createElement('script');
        include.type = 'text/javascript';
        include.async = false;
        include.onload = function () {
            try {
                PykCharts.numberFormat = d3.format(",");
                if (d3 && d3.customHive && topojson && $c && paper) {
                    window.PykChartsInit();
                    document.querySelector("body").onclick = function () {
                        if (PykCharts.export_menu_status === 0) {
                            d3.selectAll(".dropdown-multipleConatiner-export").style("visibility","hidden");
                        }
                        PykCharts.export_menu_status = 0;
                    };
                };
            }
            catch (e) {

            }
        }
        include.src = url;
        var s = document.getElementsByTagName('link')[0];
        s.parentNode.insertBefore(include, s);
    };

    try {
        if(!d3) {
            importFiles(urls[0]);
        }
    } catch (e) {
        importFiles(urls[0])
    }
    try {
        if(!d3.customHive) {
            importFiles(urls[1]);
        }
    } catch (e) {
        importFiles(urls[1]);
    }
    try {
        if(!topojson) {
            importFiles(urls[2]);
        }
    } catch (e) {
        importFiles(urls[2]);
    }
    try {
        if(!$c) {
            importFiles(urls[3]);
        }
    } catch (e) {
        importFiles(urls[3]);
    }
    try {
        if(!paper) {
            importFiles(urls[4]);
        }
    } catch (e) {
        importFiles(urls[4]);
    }
};

window.onload = anonymousFunc;
