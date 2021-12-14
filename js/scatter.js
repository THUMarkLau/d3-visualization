function scatter(idx) {
    var svg = d3.select("body").select("svg");
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.l + "," + (margin.t + 650) + ")");
    var to_scatter_data = scatter_data[idx]
    for (var i = 0; i < to_scatter_data.length; i++) {
        var cluster_data = to_scatter_data[i];
        g.selectAll(".point-" + i)
            .data(cluster_data)
            .enter()
            .append("circle")
            .attr("cx", function(d, i) {return d[0] + scatter_redis})
            .attr("cy", function(d, i) {return d[1] + scatter_redis})
            .attr("r", scatter_redis)
            .attr("fill", scatter_color[i])
            .attr("class", "point-" + i + " point")
            .attr("cluster-id", i)
            .on("click", function(d, i) {
                // TODO: 绘制对应的折线图
            })
            .on("bclick", function() {
                console.log("test")
            })
    }
}