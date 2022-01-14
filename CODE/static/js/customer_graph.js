var months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

var load_transform_cust = function(data, filter_obj, geos){
    objs=[]
    // console.log(data)
    churns = {}
    tv = {
        "mn": Infinity,
        "mx": 0
    }
    x_coors = JSON.parse(JSON.stringify(tv))
    y_coors = JSON.parse(JSON.stringify(tv))
    data.forEach((d)=>{
        if(churns[d["Churn Class"].trim()]==undefined){
            churns[d["Churn Class"].trim()] = {
                "mn": Infinity,
                "mx": 0
            } 
        }
        tv.mx = Math.max(tv.mx,+d["Total value bought"].trim())
        tv.mn = Math.min(tv.mn,+d["Total value bought"].trim())
        x_coors.mx = Math.max(x_coors.mx,+d["x"].trim())
        x_coors.mn = Math.min(x_coors.mn,+d["x"].trim())
        y_coors.mx = Math.max(y_coors.mx,+d["y"].trim())
        y_coors.mn = Math.min(y_coors.mn,+d["y"].trim())
        churns[d["Churn Class"].trim()].mn = Math.min(churns[d["Churn Class"].trim()].mn,+d["Probability of Churn"].trim())
        churns[d["Churn Class"].trim()].mx = Math.max(churns[d["Churn Class"].trim()].mx,+d["Probability of Churn"].trim())
        objs.push({
            id: +d["Customer ID"].trim(),
            churnprob: +d["Probability of Churn"].trim(),
            churnclass: d["Churn Class"].trim(),
            tv: +d["Total value bought"].trim(),
            recency: +d["Recency (R)"].trim(),
            freq: +d["Frequency(F)"].trim(),
            monetary: +d["Monetary(M)"].trim(),
            geo: d["Geography"].trim(),
            x: +d["x"].trim(),
            y: +d["y"].trim(),
            org_x: +d["x"].trim(),
            org_y: +d["y"].trim(),
        })
    })
    if(filter_obj){
        // console.log(objs.length)
        objs = objs.filter((x)=>filter_obj.churnClass.indexOf(x.churnclass)>=0)
        // console.log(objs.length)
        objs = objs.filter((x)=>filter_obj.country.indexOf(x.geo)>=0)
        // console.log(objs.length)
        objs = objs.filter((x)=>filter_obj.ltv_from<x.tv)
        // console.log(objs.length)
        if(filter_obj.ltv_to){
            objs = objs.filter((x)=>filter_obj.ltv_to>x.tv)
            console.log(objs.length)
        }
    }
    return {objs,churns,tv,x_coors,y_coors}
}


var edge_transform = function(edges, threshold, thres_mx, data)
{
    var objs = []
    var mx = 0
    var mn = Infinity
    // console.log(data)
    var nodes = data.map((x)=>x.id)
    // console.log(nodes)
    links = []
    // nodes = columns.map((x)=>Number(x))
    // console.log(nodes)
    visited = []
    edges.forEach((edge)=>{
        target = []
        Object.keys(edge).forEach((col)=>{
            if(col=="Customer ID"){
                visited.push(edge[col])
            }
            // console.log(visited)
            if(col!="Customer ID" && edge[col]>threshold && (!thres_mx || edge[col]<thres_mx) && Number(col)!=Number(edge["Customer ID"])){
                // console.log(thres_mx, edge[col], (!thres_mx || edge[col]<=thres_mx))
                var obj = {}
                var val = Number(edge[col])
                mx = Math.max(mx,val)
                mn = Math.min(mn,val)
                src_ind = nodes.indexOf(Number(edge["Customer ID"]))
                dest_ind = nodes.indexOf(Number(col))
                // console.log(Number(edge["Customer ID"]))
                // console.log(Number(col))
                // console.log(visited.indexOf(col)==-1)
                if(src_ind!=-1 && dest_ind!=-1 && visited.indexOf(col)==-1){
                    obj.source = src_ind
                    obj.target = dest_ind
                    obj.value = val
                    objs.push(obj);
                    target.push(dest_ind);
                }
            }
        });
        source = Array(target.length).fill(src_ind)
        links.push({source,target})
    })
    // console.log(objs.length)
    // console.log(mx)
    // console.log(mn)
    return {objs,mx,mn,nodes,links}
}

var cg = function(filter_obj, geos) {
    var svgns = 'http://www.w3.org/2000/svg';
    console.log(filter_obj)
    // Transform edge input objects into source and targets
    var data = JSON.parse(JSON.stringify(window.allcusts))
    var edges = JSON.parse(JSON.stringify(window.alledges))
    // console.log(data.length)
    // console.log(edges.length)

    var width = $('#graph_col').width(),
    height = 700;
    // edges = load_transform_edge(edges)
    var cust_res = load_transform_cust(data, filter_obj, geos)
    data = cust_res.objs

    // Transform x and y coors within range
    console.log(cust_res)
    var xScale = d3.scaleLinear()
    .domain([cust_res.x_coors.mn, cust_res.x_coors.mx])
    .range([100, width-200]);

    var yScale = d3.scaleLinear()
    .domain([cust_res.y_coors.mn, cust_res.y_coors.mx])
    .range([100, height-100]);

    data.forEach((d)=>{
        d.org_x = xScale(d.x)
        d.org_y = yScale(d.y)
        d.x = xScale(d.x)
        d.y = yScale(d.y)
        // console.log(d.org_x+" "+d.x)
        // console.log(d.org_y+" "+d.y)
    })

    var churns = cust_res.churns
    var tv = cust_res.tv
    var edge_res = edge_transform(edges, filter_obj.sim_from, filter_obj.sim_to, data);
    // console.log(edge_res)
    var mx = edge_res.mx
    var mn = edge_res.mn
    var node_inds = edge_res.nodes
    var nodes = {}
    var links = edge_res.objs;
    // compute the distinct nodes from the links.
    links.forEach(function(link) {
        link.source = nodes[link.source] || (nodes[link.source] = data[link.source]);
        link.target = nodes[link.target] || (nodes[link.target] = data[link.target]);
    });

    // var degree_map={}
    // edge_res.objs.forEach(function(link) {
    //     //   console.log(link.source.name)
    //     //   console.log(degree_map[link.source.name]===undefined)
    //       if(degree_map[link.source]===undefined){
    //           degree_map[link.source]=0
    //       }
    //       if(degree_map[link.target]===undefined){
    //           degree_map[link.target]=0
    //       }
    //       degree_map[link.source]+=1
    //       degree_map[link.target]+=1
    //   })

    var submissiveColorScaleRed = d3.scaleLinear()
    .domain([churns["High"].mn, churns["High"].mx])
    .range([200, 50]);

    var submissiveColorScaleGreen = d3.scaleLinear()
    .domain([churns["Low"].mn, churns["Low"].mx])
    .range([200, 50]);

    var submissiveColorScaleBlue = d3.scaleLinear()
    .domain([churns["Medium"].mn, churns["Medium"].mx])
    .range([200, 50]);

    var binaryScale = d3.scaleLinear()
    .domain([Math.min(churns["Low"].mn,churns["Medium"].mn,churns["High"].mn), Math.max(churns["Low"].mx,churns["Medium"].mx,churns["High"].mx)])
    .range(["green", "red"]);

    var radiusScale = d3.scaleLinear()
    .domain([tv.mn, tv.mx])
    .range([20, 60]);

    var edgeColorScale = d3.scaleLog()
    .domain([mn, mx])
    .range(["white", "black"]);

    // var gbscale = d3.scaleLinear()
    // .domain([d3.min(Object.values(degree_map)), d3.max(Object.values(degree_map))])
    // .range([150, 50]);

    // var redscale = d3.scaleLinear()
    // .domain([d3.min(Object.values(degree_map)), d3.max(Object.values(degree_map))])
    // .range([255, 0]);

    // console.log(degree_map)

// console.log(data.length)
var force = d3.forceSimulation()
    .nodes(Object.values(nodes))
    // .force('center', d3.forceCenter(width / 2, height / 2))
    // .force("x", d3.forceX())
    // .force("y", d3.forceY())
    // .force("charge", d3.forceManyBody().strength(0.5))
    .alphaTarget(1)
    .on("tick", tick);

d3.select("div#svg_div").remove()

var graph_div = d3.select("div#graph_col").append("div")
                .attr("id", "svg_div")


var defs = document.createElementNS(svgns, 'defs');

var svg = graph_div.append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id","network-svg")
    // .append(defs)


// var linkGen = d3.linkHorizontal();
// add the links
var path = svg.append("g")
    .selectAll("path")
    .data(links)
    .enter()
    .append("path")
    // .attr("d", linkGen)
    .attr("fill", "none")
    .attr("stroke", function(d){
        return edgeColorScale(d.value)
    });

// console.log(force.nodes())
// define the nodes
var node = svg.selectAll(".node")
    .data(force.nodes())
    .enter().append("g")
    .attr("class", "node")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
        .on("dblclick", function(d){
            if(d.fx!==null){
                d.fx=d.org_x;
                d.fy=d.org_y;
                var colorstr = "gray"
                if(d.churnclass=="Low"){
                    colorstr = "rgb("+String(submissiveColorScaleGreen(d.churnprob))+",255,"+String(submissiveColorScaleGreen(d.churnprob))+")";
                }
                if(d.churnclass=="Medium"){
                    colorstr = "rgb("+String(submissiveColorScaleBlue(d.churnprob))+","+String(submissiveColorScaleBlue(d.churnprob))+",255)";
                }
                if(d.churnclass=="High"){
                    colorstr = "rgb(255,"+String(submissiveColorScaleRed(d.churnprob))+","+String(submissiveColorScaleRed(d.churnprob))+")";
                }
                d3.select(this)
                .select("circle")
                .style("fill", colorstr)
                .style("stroke-width", "1.5px")
                .style("stroke", "none");
            }
            $("#metricHeader")
                .addClass("d-none");

            $("#metricSubHeader")
                .addClass("d-none");
        d3.select("div#svg_cus_div").remove()
        })
        .on("mouseover", function(d) {
            
            var pos = $(this)[0].getBoundingClientRect()
            console.log(pos)
            console.log(pos.x)
            console.log(pos.y)

            var width = pos.width
            var fx= pos.x+window.scrollX - (width/2) - 30
            var fy = pos.y + window.scrollY - (width / 2) - 75
            // var div = document.createElement("div")
            // div.id = "tooltip"
            // div.style.position = "absolute"
            // div.style.top = d.y+"px"
            // div.style.left = d.x+"px"
            // div.height = "fit-content"
            // div.width = "fit-content"
            var country = d.geo;
            var churn = d.churnprob;
            var tv = d.tv;
            var innerHTML = "<div id='tooltip'><strong>Country: </strong><span class='details'>" + country + "<br></span><strong> Churn Probability: </strong><span class='details'>" + churn + "<br></span><strong> Lifetime Value: </strong><span class='details'>" + tv +"<br></span></div>"
            // div.innerHTML = "<div class='jumbotron' id='tooltip'><p>Country: "+country+"</p><br/><p>Churn Probability: "+churn+"</p><br/><p>Lifetime Value: "+tv+"</p>";
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(innerHTML)
                .style("left", (fx) + "px")
                .style("top", (fy) + "px");
            // document.body.appendChild(div);
            // document.getElementById("svg_div").appendChild(div)
        })
        .on("mouseout", function(d) { 
            div.transition()
                .duration(500)
                .style("opacity", 0);

            d3.select(this)
                .style('opacity', 0.8)
                .style('stroke-width', 0.3);
        })
        .on("click",function(d){create_cust_bar(d.id)})
        ;
    

// add the nodes
node.append("circle")
    .attr("id", function(d){
        return "node"+String(d.id);
    })
    .attr("r", function(d) {
        return radiusScale(d.tv)
    })
    .style("fill", function(d){
        var colorstr = "gray"
        if(d.churnclass=="Low"){
            colorstr = "rgb("+String(submissiveColorScaleGreen(d.churnprob))+",255,"+String(submissiveColorScaleGreen(d.churnprob))+")";
        }
        if(d.churnclass=="Medium"){
            colorstr = "rgb("+String(submissiveColorScaleBlue(d.churnprob))+","+String(submissiveColorScaleBlue(d.churnprob))+",255)";
        }
        if(d.churnclass=="High"){
            colorstr = "rgb(255,"+String(submissiveColorScaleRed(d.churnprob))+","+String(submissiveColorScaleRed(d.churnprob))+")";
        }
        return colorstr
        // return binaryScale(d.churnprob)
        // createGradientCircle(colorstr, "gradient"+d.id, svg);
        // return "url(#gradient"+d.id+")"
    });

// add label
node.append("text")
    .attr("text-anchor", "middle")
    .attr("font-weight",50)
    .attr('class','circle-text')
    .text(function(d){
        return d.id;
    })

// add the curvy lines
function tick() {
    path.attr("d", function(d) {
        // console.log(d);
        var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" +
        d.source.x + "," +
        d.source.y + "A" +
        dr + "," + dr + " 0 0,1 " +
        d.target.x + "," +
        d.target.y;
    });
    node.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")"; 
    });
}

function dragstarted(d) {
    // console.log(d3.event.active)
    // console.log(d)
    if (!d3.event.active) force.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    // d3.select("circle#node"+String(d.id))
    // .attr("cx", d.x )
    // .attr("cy", d.y )
};

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    // console.log(d.org_x+" "+d.x)
};

function dragended(d) {
    if (!d3.event.active) force.alphaTarget(0);
    //   if (d.fixed == true) {
    //       d.fx = d.x;
    //       d.fy = d.y;
    //   }
    //   else {
    //       d.fx = null;
    //       d.fy = null;
    //   }
    d.fx = d.x;
    d.fy = d.y;
    d3.select(this)
    .select("circle")
    .style("fill", "white")
    .style("stroke-width", "3px")
    .style("stroke", "black");
};
    
    $(".load").fadeOut('slow')

}

var createGradientCircle = (color,id,svg) => {
    var tempScale = d3.scaleLinear()
    .domain([1,10])
    .range(["white", color]);
    
    var node = document.getElementById("gradientCircle").cloneNode(true);
    node.id = id;
    var stop2 = node.querySelector("#stop-2")
    var stop3 = node.querySelector("#stop-3");
    stop2.style["stop-color"] = tempScale(7);
    stop3.style["stop-color"] = tempScale(10);
    document.body.appendChild(node)
}

var get_geos = (cust)=> {
    var geos=[]
    cust.forEach((d)=>{
        geos.push(d["Geography"].trim())
    })
    return [...new Set(geos)];
}

var filterAndRender = function(e){
    var country = document.getElementById("geo").value;
    var churnClass = document.getElementById("churn").value;
    var ltv_from = Number(document.getElementById("churn-from").value)
    if(document.getElementById("tv-check").value){
        var ltv_to = Number(document.getElementById("churn-to").value)
    }
    var sim_from = Number(document.getElementById("sim-from").value)
    if(document.getElementById("sim-check").value){
        var sim_to = Number(document.getElementById("sim-to").value)
    }
    // console.log(country+" "+churnClass+" "+ltv_from+" "+ltv_to+" "+sim_from+" "+sim_to)
    if(country=="All"){
        country = window.geos;
    }
    else{
        country = [country]
    }
    if(churnClass=="All"){
        churnClass = ["Low","Medium","High"]
    }
    else{
        churnClass = [churnClass]
    }
    var filter_obj = {country,churnClass,ltv_from,ltv_to,sim_from,sim_to}
    cg(filter_obj)
    cardsdel()
    getcards()
}

 




//code related to the bar chart

function create_cust_bar(cust_id) {

//objs=[{'Customer': '12346', 'Jan-10': '81.3', 'Feb-10': '34.2'}, {'Customer': '12386', 'Jan-10': '81.3', 'Feb-10': '34.2'}]

// pulling out the data for the required customer id
monthly_data.forEach(function(value,index){

    if (value["Customer"]== cust_id){
   ydata=[parseFloat(value['Jan-11']),parseFloat(value['Feb-11']),parseFloat(value['Mar-11']), parseFloat(value['Apr-11']),
   parseFloat(value['May-11']),parseFloat(value['Jun-11']),parseFloat(value['Jul-11']),parseFloat(value['Aug-11']),parseFloat(value['Sep-11']),
   parseFloat(value['Oct-11']),parseFloat(value["Nov-11"]),parseFloat(value["Dec-11"])]

}
})

/*Jan-10,Feb-10,Mar-10,Apr-10,May-10,Jun-10,Jul-10,Aug-10,Sep-10,Oct-10,Nov-10,Dec-10,Jan-11,Feb-11,Mar-11,Apr-11,May-11,Jun-11,Jul-11,Aug-11,Sep-11,Oct-11,Nov-11,Dec-11
 */
console.log(ydata)


xaxis_data = ["Jan-11", "Feb-11",'Mar-11',"Apr-11","May-11","Jun-11","July-11","Aug-11","Sep-11","Oct-11", "Nov-11", "Dec-12"]
//ydata = [22.5,28.2,30.1,28.1,22.1,22.5,28.2,30.1,28.1,22.1,22,32]

// removing the element if exisint

d3.select("div#svg_cus_div").remove()

//defining an svg element

width = $('#customer_metrics_col').width()
height = 550

var graph_div1 = d3.select("div#customer_metrics") 
                .append("div")
                .attr("id", "svg_cus_div")

//console.log(graph_div1)


var svg1 = graph_div1.append("svg")
    .attr("width", width)
    .attr("height", height)
    //.attr('transform', "translate("+padding.left+','+(chartarea.height+padding.top)+')')
    // .append(defs)*/


/*var svg1 = d3.select("div#Customer_metrics")
                    .append("svg")
                    .attr("width",width)
                    .attr("height",height)
                    .attr("id", "cus_svg_div");*/
        
var padding = {top:30,bottom:80,right:100, left:80};

var chartarea = {

    "width": width-padding.left - padding.right,
    "height": height-padding.top - padding.bottom
};




// title of the chart
// svg1.append("g").attr("id", "bar_chart_title")
//     .append("text")
//     .attr("id", "title-a")
//     .attr("text-anchor", "middle")
//     .attr("x", chartarea.width/2+20)
//     .attr("y",  15)
//     .attr("font-weight","bold")
//     .style("font-size", "20px")
//     .text("Past 12 Months Sales to the Customer")

console.log("Customer ID is "+cust_id)

let heading =`12 Months Sales for the Customer ${cust_id}`
$("#metricHeader")
.removeClass("d-none");

$("#metricSubHeader")
.removeClass("d-none");

$("#metricSubHeader")
.text(heading)
//Creating scales
var yscale = d3.scaleLinear()
                .domain([0,d3.max(ydata, function(d){return d;})+1])
                .range([chartarea.height,0]);
    


  var xscale = d3.scaleBand()
                    .domain([1,2,3,4,5,6,7,8,9,10,11,12])     // data.map(function(d) {   return d[0]; })
                    .range([0,chartarea.width])
                    .padding(0.2);


//creating y axis

var y_axis= d3.axisLeft(yscale).ticks(12) //.tickFormat(function(d){  return (udata[d-0.5].name).slice(0,10)})//tickValues(function(d,i) {return i}).tickFormat(function(d,i) {return d.name});

  svg1.append('g')
        .attr("id",'y-axis-bars')
        .attr('transform', "translate("+padding.left+','+(padding.top)+')')
        .attr('font-size',"10px")
        .call(y_axis)
        .ticks;

 


// creating x axis
var x_axis = d3.axisBottom(xscale).ticks(12)
            .tickFormat(d => months[d-1])
       //var xgrid = d3.axisBottom(xscale).tickSize(-chartarea.height).tickFormat("").ticks(10)
 
 svg1.append("g")
      .attr("id","x-axis-bars")
          .attr('transform', "translate("+padding.left+','+(chartarea.height+padding.top)+')')
          //.attr('transform', "translate(80,490)")
          .call(x_axis)
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

//svg1.append("g")    .attr('transform', "translate("+padding.left+','+(chartarea.height+padding.top)+')').call(xgrid);

mybar = svg1.append("g")
              .attr("id", "bars")
              .attr('transform', "translate("+padding.left+','+(padding.top)+')')

barpad= 10

mybar.selectAll("rect")
   .data(ydata)
   .enter()
   .append("rect")
   .attr("x", function(d,i){return xscale(i+1)})
   .attr("y", function(d){return (yscale(d))})
    .attr('fill', '#69b3a2')
    .attr("width", xscale.bandwidth() )    
   .attr("height", function(d){;return (chartarea.height-yscale(d))} )
    .attr('data-bs-toggle', 'tooltip')
    .attr('data-bs-placement', 'top')
    .attr('title', function (d) { return d; });


svg1.append("g").attr("id", "bar_y_axis_label").append("text")
    .attr("text-anchor", "end")
    .attr("x", -(chartarea.height/ 2))
    .attr("y", 15)
    .attr("dy", ".95em")
    .attr("transform", "rotate(-90)")
    .style("fill", "black")
    .style("font-size", "20px")
    .text("Sales (in '000 $)");


svg1.append('g').attr("id","bar_x_axis_label")
          .append("text")
          .attr("class", "x-axis label")
          .attr("text-anchor", "end")
          .attr("x", padding.left+chartarea.width/2)
          .attr("y", chartarea.height+padding.top+(padding.left/2)+10)
          .style("fill", "black")
            .style("font-size", "20px")
          .text("Months");

    $("#svg_cus_div").ready(function () {
    // $('[data-bs-toggle="tooltip"').tooltip()
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })

})

}


$(window).on("load", function () {
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
}
)