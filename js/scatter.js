function scatter(idx) {
    d3.select("body").select("svg").select(".scatter").remove()
    var g = d3.select("body").select("svg")
        .append("g")
        .attr("transform", "translate(" + (margin.l+800) + "," + margin.t + ")")
        .attr("class", "scatter");

    var to_scatter_data = scatter_data[idx]
    for (var i = 0; i < to_scatter_data.length; i++) {
        var cluster_data = to_scatter_data[i];
        g.selectAll(".point-" + i)
            .data(cluster_data)
            .enter()
            .append("circle")
            .attr("cx", function (d, i) {
                return d[0] + scatter_redis
            })
            .attr("cy", function (d, i) {
                console.log(scatter_height - d[1] - scatter_redis)
                return scatter_height - d[1] - scatter_redis
            })
            .attr("r", scatter_redis)
            .attr("fill", scatter_color[i])
            .attr("class", "point-" + i + " point")
            .attr("cluster-id", i)
            .attr("class-id", idx)
            .on("click", function (d, i) {
                chart(parseInt(d3.select(this).attr("class-id")), parseInt(d3.select(this).attr("cluster-id")));
            })
            .on("bclick", function () {
                console.log("test")
            })
    }
    drawAxis(g, [0, scatter_height],scatter_height, scatter_width)
}

function drawAxis(g, origin, height, width) {
    var defs = g.append("defs")
    var arrow_marker = defs.append("marker")
        .attr("id","arrow")
        .attr("markerUnits","strokeWidth")
        .attr("markerWidth",9)
        .attr("markerHeight",9)
        .attr("viewBox","0 0 12 12")
        .attr("refX",6)
        .attr("refY",6)
        .attr("orient","auto")

    var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
    arrow_marker.append("path")
        .attr("d",arrow_path)
        .attr("fill","#000")
    // y 轴
    g.append("line")
        .attr("x1", origin[0])
        .attr("y1", origin[1])
        .attr("x2", origin[0])
        .attr("y2", origin[1] - height)
        .attr("marker-end","url(#arrow)")
        .style("stroke-width", scatter_line_width)
        .style("stroke", "black")
    // x 轴
    g.append("line")
        .attr("x1", origin[0])
        .attr("y1", origin[1])
        .attr("x2", origin[0] + width)
        .attr("y2", origin[1])
        .attr("marker-end","url(#arrow)")
        .style("stroke-width", scatter_line_width)
        .style("stroke", "black")
    g.append("text")
        .attr("x", origin[0])
        .attr("y", origin[1] + 15)
        .text("O")
        .style("font-weight", "bold")
}