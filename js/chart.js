let chart_height = 200
let chart_width = 200

function chart(class_id, cluster_id) {
    var vis;
    if (d3.select("body").select("svg").selectAll(".chart").empty()) {
        vis = d3.select("body")
            .select("svg")
            .append("g")
            .attr("transform", "translate(" + (margin.l + 800) + "," + (margin.t + scatter_height + 250) + ")")
            .attr("class", "chart")
        WIDTH = 1000,
            HEIGHT = 500,
            MARGINS = {
                top: 20,
                right: 20,
                bottom: 20,
                left: 50
            };
        drawAxis(vis, [0, chart_height], chart_height, chart_width)
    } else {
        vis = d3.select("body").select("svg").select(".chart")
    }
    var lineGen = d3.svg.line()
        .x(function (d) {
            return d[0]
        })
        .y(function (d) {
            return chart_height - d[1]
        });
    var data = chart_data[class_id][cluster_id]

    vis.append('path')
        .attr('d', lineGen(data))
        .attr('stroke', scatter_color[cluster_id])
        .attr('stroke-width', 2)
        .attr('fill', 'none');

}