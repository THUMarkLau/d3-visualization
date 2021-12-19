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

function drawChart(p, classIdx) {
    var data_path = "./data/json/"
    if (p === 0) {
        data_path += "cub200-contour/"
    } else {
        data_path += "ImageNet1K-contour/"
    }
    data_path += "class" + classIdx + ".json"
    d3.json(data_path, function (error, data) {
        if (error == null) {
            var to_chart_data = []
            data.contour_color.map(function (d, i) {
                to_chart_data[i] = {}
                to_chart_data[i].color = d
                var points = []
                data.contour_data[i].map(function (d, i) {
                    if (p === 1) {
                        points[2 * i] = (d[0] + scatter_1_x_bias) * scatter_1_rate
                        points[2 * i + 1] = d[1] * scatter_1_rate
                    } else {
                        points[2 * i] = d[0] * scatter_2_rate
                        points[2 * i + 1] = d[1] * scatter_2_rate
                    }
                    points[2 * i] = points[2 * i] + scatter_width / 2
                    points[2 * i + 1] = -points[2 * i + 1] + scatter_height / 2
                })
                to_chart_data[i].path = points.join(" ")
            })
            var g = d3.select("#scatter-" + (1 - p))
            g.selectAll(".scatter-path").data(to_chart_data).enter().append("polygon")
                .attr("points", function (d) {
                    return d.path
                })
                .attr("fill-opacity", "0")
                .style("stroke", function (d, i) {
                    return d.color
                })
                .style("stroke-opacity", 1)
                .style("stroke-width", 2)
        }
    })
}