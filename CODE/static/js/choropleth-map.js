var margin = { top: 100, right: 180, bottom: 60, left: 40 },
    width = 1600 - margin.left - margin.right,
    height = 980 - margin.top - margin.bottom;

const timeConv = d3.timeParse("%Y");
const numFormat = d3.format(',');
var months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];


var nonSalesValueStrings = ["Concentration"]

function isNoneSalesValueString(column){
    for (var i=0;i<nonSalesValueStrings.length;i++){
        if (column.search(nonSalesValueStrings[i]) > -1){
            return true;
        }
    }
    return false;
}

function getWorldGeoMapping(country){
    if(worldGeoMapper[country] == undefined){
        return country
    }
    return worldGeoMapper[country]
}

function getModalTitle(country,year){
    let title = `Economic Indicators of ${country} for the Year ${year}`

    return title
}

function getIndicatorColumn(indicator){

    var indicatorName = indicatorMapObject[indicator['IndicatorName']]['col']
    var format = indicatorMapObject[indicator['IndicatorName']]['format']
    var value = indicator['Value']
    // console.log(format)
    if (format == "p"){
        console.log(value)
        value = d3.format(".2f")(value)+"%"
    }
    else if(format == "c"){
        value = d3.format(".2s")(value)
    }
    else{
        value = d3.format(".2s")(value) + " $"
    }
    let indicatorColumn = `<div class="col-auto d-flex align-items-stretch">
                <div class="card text-dark  bg-info m-2 indicator-card" >
                    <div class="card-header text-center ">
                        <div class="indicator-title">
                            ${indicatorName}
                        </div>
                    </div>
                    <div class="card-body text-center">
                        <div class="card-title indicator-value ">
                            ${value}
                         </div>
                    </div>
                 </div>
              </div>`
    return  indicatorColumn
}
function getLiHTML(d){
    let li = `<li class="list-group-item">${d.value}</li>`
    return li
}
function getProductLists(products){
    console.log(products)
    let ulB = `<ul class="list-group list-group-flush product-capitalize">`
    
    let ulE = `</ul>`
    var liHTML = ""
    for(var i =0;i< products.length;i++){
        var description = products[i].Description
        
        d ={'value': description}
        liHTML += getLiHTML(d)
    }

    var html = ulB + liHTML + ulE
    console.log(html)
    return html
}
function getCustomerLists(customers) {
    
    let ulB = `<ul class="list-group list-group-flush">`
    
    let ulE = `</ul>`
    var liHTML = ""
    for (var i = 0; i < customers.length; i++) {
        var customerId = parseInt(customers[i]["Customer ID"])
        
        d = { 'value': customerId }
        liHTML += getLiHTML(d)
    }
    var html =  ulB + liHTML + ulE;
    console.log(html)
    return html
}
function getProductCard(header,products) {
    var list = getProductLists(products)
    let cardHTML = `<div class="card" style="width: 18rem;">
    <div class="card-header card-header-title">
        ${header}
    </div>
        ${list}
    </div>`
    
    var html = cardHTML
    
    return cardHTML
}

function getCustomerCard(header,customers){
    var list = getCustomerLists(customers)
    let cardHTML = `<div class="card" style="width: 18rem;">
    <div class="card-header card-header-title">
        ${header}
    </div>
        ${list}
    </div>`
    // console.log(customers)
    var html = cardHTML
    return html
    
}

function setBarChart(header,barcharts){
    const salesFormat = d3.format('$.2f');
    barcharts.sort((a,b)=> months.indexOf(a.Month) - months.indexOf(b.Month))

    // var bWidths = [ 180,250,300,350,400,450,500,640,660]
    var bWidths = []
    var initWidth = 210
    var maxWidth = 620
    bWidths.push(initWidth)
    var step = (maxWidth-initWidth)/11
    for(var i =0;i<11;i++){
        initWidth+=step
        bWidths.push(initWidth)
    }
    // bWidths.push(initWidth)

    var correctedbWidth = bWidths[barcharts.length - 1]

    var year = barcharts[0].Year

    var bMargin = { top: 30, right: 30, bottom: 70, left: 60 },
        bWidth = correctedbWidth - bMargin.left - bMargin.right,
        bHeight = 400 - bMargin.top - bMargin.bottom;

    // barcharts= barcharts.slice(0,5)

    console.log(barcharts)

    var bsvg = d3.select('#barchartColumn').append('svg')
        .attr('id','barchartColumnSVG')
        .attr('width', bWidth + bMargin.left + bMargin.right)
        .attr('height', bHeight + bMargin.top + bMargin.bottom)
        .append('g')
        .attr('transform', 'translate(' + bMargin.left + ',' + bMargin.top + ')');

    var x = d3.scaleBand()
        .domain(barcharts.map(function (d)  {return d.Month}))
        .range([0,bWidth])
        .padding(0.2)
        

    var y = d3.scaleLinear()
        .domain([0, d3.max(barcharts, function (d) { return parseFloat(d.Sales); })])
        .range([bHeight, 0])

    bsvg.selectAll(".salesBar")     
        .data(barcharts)
        .enter()
        .append("rect")        
        .attr("x", function (d) { return x(d.Month); })
        .attr("y", function (d) { return y(d.Sales); })
        .attr("height", function (d) { return bHeight - y(d.Sales); })
        .attr("width", x.bandwidth())
        .attr('data-bs-toggle','tooltip')
        .attr('data-bs-placement', 'top')
        .attr('title', function(d){return salesFormat(d.Sales)})
        .attr('fill','#69b3a2')

    bsvg.append("g")
        .attr("transform", "translate(0," + bHeight + ")")        
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform","translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")

    bsvg.append('text')
        .attr('id', 'y_axis_label')
        .attr('class', 'y_axis_label')
        .attr('x', - bHeight / 2)
        .attr('y', -20)
        .attr("transform", "translate(-30,0)rotate(-90)")
        .text('Sales (In USD $)');

    bsvg.append('text')
        .attr('id', 'x_axis_label')
        .attr('class', 'x_axis_label')
        .attr('x', bWidth / 2)
        .attr('y', bHeight + bMargin.bottom / 1.12)
        .text('Sales in the Months of ' + year);

    bsvg.append("g")
        .call(d3.axisLeft(y))

    $("#barchartColumnSVG").ready(function(){
        // $('[data-bs-toggle="tooltip"').tooltip()
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        })

    })
    // bsvg
    //     .append("g")
    //     .attr("fill", '#69b3a2ue')
    //     .selectAll(".bar")
    //     .data(data)
    //     .join("rect")
    //     .attr("x", function (d) { return x(d.Month); })
    //     .attr("y", function (d) { return y(d.Sa les); })
    //     .attr("height", function (d) { return height - y(d.Sales); })        
    //     .attr("width", 5)


}
var svg = d3.select('#map').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');



var world_map_file = "data/world_countries.json"
var data_file = "data/grouped_data.csv"
var world_indictator_file = "data/bridged_indicator.csv"
var transaction_data_file = "data/transaction_data.csv"
var product_file = "data/product.csv"
var customer_file = "data/customer.csv"
var indicator_file = "data/indicator_map.json"
var geo_mapper_file = "data/world_geo_mapper.json"
var barchart_file = "data/barchart.csv"
var readFiles = [
    d3.json(world_map_file),
    d3.csv(data_file),
    d3.csv(world_indictator_file),
    
    d3.csv(product_file),
    d3.csv(customer_file),
    d3.json(indicator_file),
    d3.json(geo_mapper_file),
    d3.csv(barchart_file)
]

var productObject = {}
var customerObject = {}
var indicatorMapObject = {}
var barchartObject = {}
var worldGeoMapper = {}

var valsPerRow = 4
var colSize = parseInt(12 /valsPerRow)

var indicatorObject ={};

var projection = d3.geoNaturalEarth1()
    .scale(310)
    .rotate([352, 0, 0])
    .translate([width / 2, height / 2]);


var path = d3.geoPath()
    .projection(projection);


var metaColumns = ['Year','Country']

Promise.all(readFiles).then((reads) => 
{
    console.log("Reached")
    world_data = reads[0]
    data = reads[1]
    indicators = reads[2]
    products = reads[3]
    customers = reads[4]
    indicatorMapObject= reads[5]
    worldGeoMapper = reads[6]

    var barchartData = reads[7]

    


    var years = d3.nest()
        .key(function (d) { return d.Year; })
        .sortKeys(d3.ascending)
        .entries(data)
        .map((a) => { return a.key; });

    var countries = d3.nest()
        .key(function (d) { return d.Country; })
        .sortKeys(d3.ascending)
        .entries(data)
        .map((a) => { return a.key; });

    columns = data.columns

    var main_columns = columns.filter(d => !metaColumns.includes(d))
    console.log(main_columns)
    
    dataObject = {}
    countries.forEach((d) => { dataObject[d] ={} } )
    console.log(dataObject)


    var groupedData = d3.nest()
        .key(function (d) { return d.Country; })
        .sortKeys(d3.ascending)
        .key(function (d) { return d.Year; })
        .sortKeys(d3.ascending)
        .entries(data)

    dataObject = {}
    groupedData.forEach(function (d) {
        var game = d.key;
        var countryObject = {}
        var countryValues = d.values
        // console.log("Game is "+game+ " with "+countryValues.length+" countries")
        countryValues.forEach(function (e) {
            country = e.key
            values = e.values
            countryObject[country] = values[0]
        })

        dataObject[game] = countryObject
    })

    groupedData = d3.nest()
        .key(function (d) { return d.Country; })
        .sortKeys(d3.ascending)
        .key(function (d) { return d.Year; })
        .sortKeys(d3.ascending)
        .entries(indicators)

    
        
    groupedData.forEach(function (d) {
            var game = d.key;
            var countryObject = {}
            var countryValues = d.values
            // console.log("Game is "+game+ " with "+countryValues.length+" countries")
            countryValues.forEach(function (e) {
                country = e.key
                values = e.values
                countryObject[country] = values
            })
            
            indicatorObject[game] = countryObject
        })

    groupedData = d3.nest()
        .key(function (d) { return d.Country; })
        .sortKeys(d3.ascending)
        .key(function (d) { return d.Year; })
        .sortKeys(d3.ascending)
        .entries(products)

    groupedData.forEach(function (d) {
        var game = d.key;
        var countryObject = {}
        var countryValues = d.values
        // console.log("Game is "+game+ " with "+countryValues.length+" countries")
        countryValues.forEach(function (e) {
            country = e.key
            values = e.values
            countryObject[country] = values.slice(0,5)
        })

        productObject[game] = countryObject
    })

    groupedData = d3.nest()
        .key(function (d) { return d.Country; })
        .sortKeys(d3.ascending)
        .key(function (d) { return d.Year; })
        .sortKeys(d3.ascending)
        .entries(customers)

    groupedData.forEach(function (d) {
        var game = d.key;
        var countryObject = {}
        var countryValues = d.values
        // console.log("Game is "+game+ " with "+countryValues.length+" countries")
        countryValues.forEach(function (e) {
            country = e.key
            values = e.values
            countryObject[country] = values.slice(0,5)
        })

        customerObject[game] = countryObject
    })

    groupedData = d3.nest()
        .key(function (d) { return d.Country; })
        .sortKeys(d3.ascending)
        .key(function (d) { return d.Year; })
        .sortKeys(d3.ascending)
        .entries(barchartData)

    groupedData.forEach(function (d) {
        var game = d.key;
        var countryObject = {}
        var countryValues = d.values
        // console.log("Game is "+game+ " with "+countryValues.length+" countries")
        countryValues.forEach(function (e) {
            country = e.key
            values = e.values
            countryObject[country] = values
        })

        barchartObject[game] = countryObject
    })

    console.log(barchartObject)
    // console.log(customerObject)
    // console.log(indicatorObject)
    

    // for( var key in dataObject){
    //     console.log(key)
    //     var subdata = data.filter(d =>  d.Country == key )
    //     console.log(subdata)
    // }

    

    // console.log(dataObject['Australia']['2009'])

    
    setup_ui(world_data,dataObject,years,main_columns)

    }
)


function  setup_ui(map,dataObject,years,main_columns){
    var yearDropDownOptions = d3.select('#year')
    .selectAll('options')
    .data(years)
    .enter()
    .append('option')

    yearDropDownOptions
    .attr('value',(a) => {return a } )
    .text( (a) => { return a })

    
    var columnsDropDownOptions = d3.select('#datapoint')
        .selectAll('options')
        .data(main_columns)
        .enter()
        .append('option')
    
    columnsDropDownOptions 
        .attr('value', (a) => { return a })
        .text((a) => { return a })

    d3.select('#year')
        .on('change', (a) => { dropDownHandler(map, dataObject) })

    d3.select('#datapoint')
        .on('change', (a) => { dropDownHandler(map, dataObject)})
    
    displayMap(map, dataObject,years[year.length-1],main_columns[0])
    $('#year').val(years[year.length - 1])
    

}

function displayMap(map, dataObject, year, main_column) 
{
    svg.selectAll("*").remove()
    
    var colorScheme = d3.schemeReds[5];
    colorScheme = colorScheme.slice(1,5)

    console.log(colorScheme)
    var data = new Array()

    for(const country in dataObject){
        if (dataObject[country][year] != undefined){
            data.push(dataObject[country][year][main_column])
            // console.log(dataObject[country][year][main_column])
        }
    }
    data.sort((a, b) => (a - b))

    var colorScale = d3.scaleQuantile()
        .domain(data)
        .range(colorScheme);
    
    var quantileInfo = new Array();
    quantileInfo.push(data[0])
    colorScale.quantiles().forEach((a) => { quantileInfo.push(a); });
    quantileInfo.push(data[data.length - 1])
    console.log(quantileInfo)

    svg.append("g")
        .attr("id", "countries")
        .attr("class", "countries")
        .selectAll("path")
        .data(map.features)
        .enter()
        .append("path")
        .attr("fill", function (d) {
            var country = d.properties.name;
            var cName = getWorldGeoMapping(country)
            // console.log(cname)
            if (dataObject[cName] == undefined || dataObject[cName][year] == undefined) {
                
                return "grey"
            }            
            
            return colorScale(dataObject[cName][year][main_column])
           
        })
        .style('opacity', 0.7)
        .attr("d", path)
        .on('click',function(d){

            
            var country = d.properties.name;
            var cName = getWorldGeoMapping(country)
            
            if (dataObject[cName] == undefined || dataObject[cName][year] == undefined) {
                $('.toast').show();
                
            }
            else{
                $('.toast').hide();
                $("#modalRow").empty()
                $("#productColumn").empty()
                $("#customerColumn").empty()
                $("#barchartColumn").empty()

                $('#exampleModalCenterTitle').text(getModalTitle(country,year))
                var htmlContent =""

                var indicators = indicatorObject[cName][year]

                var topProducts = productObject[cName][year]
                topProducts.sort((a, b) => parseFloat(b.Sales) - parseFloat(a.Sales))
                // console.log(topProducts)

                var topCustomers = customerObject[cName][year]
                topCustomers.sort((a, b) => parseFloat(b.Sales) - parseFloat(a.Sales))
                
                var barcharts = barchartObject[cName][year]
                console.log(barcharts)

                var length = indicators.length
                
                var rows = parseInt(length/4)
                var extraRows = length % 4

                for(var i = 0;i< length;i++){
                    htmlContent+=getIndicatorColumn(indicators[i])
                }
                var customerHTMLContent = getCustomerCard("Top Customer IDs",topCustomers)
                var productHTMLContent = getProductCard("Top Product Descriptions",topProducts)
                
                setBarChart("Sales Trend",barcharts)

                // console.log(customerHTMLContent)
                // console.log(productHTMLContent)
                $("#indicatorRow").html(htmlContent)
                $("#productColumn").html(productHTMLContent)
                $("#customerColumn").html(customerHTMLContent)
                // $("#barchartColumn").html(barchartHTMLContent)
                $('#modalscreen').modal('show')
                
            }
            
        })
        
        .on("mouseover", function (d) {
            
            var country = d.properties.name;
            var cName = getWorldGeoMapping(country)
            var columnValue = 'N/A'
            var isNonSales = isNoneSalesValueString(main_column)

            if (dataObject[cName] == undefined || dataObject[cName][year] == undefined) {
                columnValue = 'N/A'

            }
            else{
                if(isNonSales){
                    columnValue = d3.format("d")(dataObject[cName][year][main_column])
                }else{

                    columnValue = d3.format(".2f") (dataObject[cName][year][main_column])
                }
            }
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("<div id='tooltip'><strong>Country: </strong><span class='details'>" + country + "<br></span><strong>" + main_column + ": </strong><span class='details'>" + columnValue+"<br></span></div>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        
           
            
            d3.select(this)
                .style('opacity', 1)
                .style('stroke-width', 3);
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);

            d3.select(this)
                .style('opacity', 0.8)
                .style('stroke-width', 0.3);
                
        });


    var legend = svg.append("g")
        .attr('id', 'legend')
        .attr("transform", 'translate(' + (0) + ',' + (height/1.8) + ')')
    
    var isNonSales = isNoneSalesValueString(main_column)
    // console.log(isNonSales)

    var title = main_column 
    var inUSD = "(In USD '$')"
    var tdx = 0
    var legend_title =legend
        .append('text')
        .attr('dx',tdx)
        .attr('dy', -50)
        .attr('class','legend-title')
        .text(title)
    if(! isNonSales){
        var legend_title = legend
            .append('text')
            .attr('dx', tdx)
            .attr('dy', -30)
            .attr('class', 'legend-title')
            .text(inUSD)
        
    }

    
    for (var i = 0; i < 4; i++) {
        var legend_square = legend
            .append("rect")
            .attr('width', 14)
            .attr('height', 14)
            .attr("y", function (d) { return 22 * i; })
            .style("fill", colorScheme[i])

        var legend_text = legend
            .append("text")
            .attr("dx", function (d) { return 24; })
            .attr("dy", function (d) { return 22 * i; })
            .attr("y", 12)
            .attr("class", "legend-text")
            // .style("text-anchor", "middle")
            .text(d3.format("d")(quantileInfo[i]) + " to " + d3.format("d")(quantileInfo[i + 1]))
    }
    
}
function dropDownHandler(map, dataObject){
    var selectedYear = d3.select("#year").node().value;
    var column = d3.select("#datapoint").node().value;
    console.log(selectedYear)
    console.log(column)
    displayMap(map, dataObject, selectedYear, column)

}



$(window).on("load", function () {
    // WebFont.load({
    //     google: {
    //         families: ['Lato:bold']
    //     }
    // });
    var options = {
        animation: true,
        autohide: false,
        delay: 500
    }
    var toastElList = [].slice.call(document.querySelectorAll('.toast'))
    var toastList = toastElList.map(function (toastEl) {
        return new bootstrap.Toast(toastEl, options)
    })
    $('.toast').toast('show');


    $(".load").fadeOut('slow')
})
