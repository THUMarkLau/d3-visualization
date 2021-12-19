function scatter(origin_x, origin_y, data, p, rate) {
    // d3.select("body").select("svg").select(".scatter").remove()
    var g = d3.select("body").select("svg")
        .append("g")
        .attr("transform", "translate(" + (origin_x - scatter_width / 2) + "," + (origin_y - scatter_height / 2) + ")")
        .attr("class", "scatter")
        .attr("id", "scatter-" + p);
    g.append("rect")
        .attr("x", 0)
        .attr("y", -5)
        .attr("width", scatter_width + 5)
        .attr("height", scatter_height + 5)
        .style("stroke", "black")
        .style("fill", "white")
    drawAxis(g, [scatter_width / 2, scatter_height / 2], scatter_height, scatter_width)
    var to_scatter_data = []
    data.scatter_color.map(function (d, i) {
        to_scatter_data[i] = {}
        to_scatter_data[i].color = d
        to_scatter_data[i].label = data.scatter_label[i]
        if (p === 0) {
            to_scatter_data[i].x = data.scatter_data[i][0] + scatter_1_x_bias
        } else {
            to_scatter_data[i].x = data.scatter_data[i][0]
        }
        to_scatter_data[i].x *= rate
        to_scatter_data[i].y = data.scatter_data[i][1] * rate
    })
    // console.log(to_scatter_data)
    g.selectAll(".scatter-point-" + p).data(to_scatter_data).enter().append("circle")
        .attr("cx", function (d) {
            return d.x + scatter_width / 2
        })
        .attr("cy", function (d) {
            return -d.y + scatter_height / 2
        })
        .attr("r", scatter_redis)
        .attr("class-id", function (d) {
            return d.label
        })
        .attr("fill", function (d) {
            return d.color
        })
        .attr("id", function (d) {
            return "circle-" + p + "-" + d.label
        })
        .attr("class", "scatter-point-" + p)
}

function drawAxis(g, origin, height, width) {
    var defs = g.append("defs")
    var arrow_marker = defs.append("marker")
        .attr("id", "arrow")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", 9)
        .attr("markerHeight", 9)
        .attr("viewBox", "0 0 12 12")
        .attr("refX", 6)
        .attr("refY", 6)
        .attr("orient", "auto")

    var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
    arrow_marker.append("path")
        .attr("d", arrow_path)
        .attr("fill", "#000")
    // y 轴
    g.append("line")
        .attr("x1", origin[0])
        .attr("y1", origin[1] + height / 2)
        .attr("x2", origin[0])
        .attr("y2", origin[1] - height / 2)
        .attr("marker-end", "url(#arrow)")
        .style("stroke-width", scatter_line_width)
        .style("stroke", "black")
    // x 轴
    g.append("line")
        .attr("x1", origin[0] - width / 2)
        .attr("y1", origin[1])
        .attr("x2", origin[0] + width / 2)
        .attr("y2", origin[1])
        .attr("marker-end", "url(#arrow)")
        .style("stroke-width", scatter_line_width)
        .style("stroke", "black")
}