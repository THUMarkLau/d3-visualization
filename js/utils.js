var show_data = [];
var left_show_cnt = 10;
var right_show_cnt = 3;

function generate_all() {
    var width = 2000, height = 1100, margin = {b: 0, t: 40, l: 120, r: 50};
    show_data = [];
    d3.select("body").select("svg").remove()
    var select_idx = [], count = 0;
    while (count < left_show_cnt) {
        var cur_select_idx = Math.floor(Math.random() * left_cnt)
        var found = false
        for (var i = 0; i < count; i++) {
            if (select_idx[i] === cur_select_idx) {
                found = true
                break
            }
        }
        if (!found) {
            select_idx[count++] = cur_select_idx
        }

    }
    for (var i = 0; i < select_idx.length; i++) {
        // [i * right_cnt, (i+1) * right_cnt-1]
        var idx = select_idx[i]
        // select the top 5 of the select_idx
        var temp_data = []
        for (var j = idx * right_cnt; j < (idx + 1) * right_cnt; j++) {
            temp_data[temp_data.length] = origin_data[j]
            temp_data[temp_data.length - 1][3] = idx
            temp_data[temp_data.length - 1][4] = j - idx * right_cnt
        }
        temp_data.sort(function (a, b) {
            return b[2] - a[2];
        })
        for (var j = 0; j < right_show_cnt; j++) {
            show_data[show_data.length] = temp_data[j]
        }
    }
    var svg = d3.select("body")
        .append("svg").attr('width', width).attr('height', (height + margin.b + margin.t)).attr("xmlns", "http://www.w3.org/2000/svg").attr("version", "1.1")
        .append("g").attr("transform", "translate(" + margin.l + "," + margin.t + ")").attr("id", "mainFrame");

    shuffle(colors, colors.length)
    var data = [
        {data: bP.partData(show_data, 2), id: 'SalesAttempts', header: ["Channel", "State", "Sales Attempts"]},
    ];
    bP.draw(data, svg);

}

generate_all()


function shuffle(array, size) {
    var index = -1,
        length = array.length,
        lastIndex = length - 1;

    size = size === undefined ? length : size;
    while (++index < size) {
        // var rand = baseRandom(index, lastIndex),
        var rand = index + Math.floor(Math.random() * (lastIndex - index + 1))
        value = array[rand];

        array[rand] = array[index];

        array[index] = value;
    }
    array.length = size;
    return array;
}

function get_class_pic_path(p, class_name) {
    if (p == 0) {
        return dataDir + "img\\cub_imgs\\" + class_name + "\\1.jpg";
    } else {
        return dataDir + "img\\imagenet_imgs\\" + class_name + "\\1.jpg";
    }
}


showClassImg = function (svg, visData, i, p) {
    margin = {b: 0, t: 40, l: 120, r: 50}
    var g = d3.select("body").select("svg").append("g").attr("id", "composition").attr("transform", "translate(" + 900 + "," + margin.t + ")");
    var upper_height = 30, lower_height = 200, width = 700;
    var align_y = 15

    // upper one
    g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", upper_height)
        .attr("width", width)
        .style("fill", "#FFFFFF")
        .style("stroke", "black")
        .style("stroke-width", "1px")
    g.append("text")
        .text("COCO categories")
        .attr("y", align_y)
        .attr("x", width / 10)
        .attr("font-size", "130px")
        .attr("dy", ".3em")
        .attr("dx", ".5em")
        .attr("font-weight", "bold")
    g.append("text")
        .text("ImageNet categories")
        .attr("y", align_y)
        .attr("x", width / 2)
        .attr("font-size", "130px")
        .attr("dy", ".3em")
        .attr("dx", ".5em")
        .attr("font-weight", "bold")

    // lower one
    g.append("rect")
        .attr("x", 0)
        .attr("y", upper_height)
        .attr("height", lower_height)
        .attr("width", width)
        .style("fill", "#FFFFFF")
        .style("stroke", "black")
        .style("stroke-width", "1px")

    var main_img_path = get_class_pic_path(p, visData.keys[p][i])
    var datas = data_map.get(visData.keys[p][i]);
    var percentage_map = d3.map()
    var sub_class_names = datas.map(function (d, i) {
        var name = p === 0 ? d[1] : d[0]
        percentage_map.set(name, d[2])
        return name
    })
    sub_class_names.sort(function (a, b) {
        return percentage_map.get(b) - percentage_map.get(a)
    })
    var img_width = 80, img_height = lower_height / 3 * 2
    // 绘制 main class
    g.append("svg:image")
        .attr("x", width / 10)
        .attr("y", upper_height + lower_height / 10)
        .attr("xlink:href", main_img_path)
        .attr("width", img_width)
        .attr("height", img_height)
    g.append("text")
        .text(visData.keys[p][i])
        .attr("y", upper_height + lower_height - 10)
        .attr("x", width / 10)
        .attr("font-size", "130px")
        .attr("dy", ".3em")
        .attr("dx", ".5em")
        .attr("font-weight", "bold")
    g.append("text")
        .text("=")
        .attr("y", upper_height + lower_height / 10 + img_height / 2 - 10)
        .attr("x", width / 10 + img_width)
        .attr("font-size", "130px")
        .attr("dy", ".3em")
        .attr("dx", ".5em")
        .attr("font-weight", "bold")
    var padding_left = 30, margin_left = 35 + img_width
    var left = 100
    // 绘制组成
    for (var i = 0; i < sub_class_names.length; i++) {
        var img_path = get_class_pic_path(1 - p, sub_class_names[i])
        g.append("svg:image")
            .attr("x", width / 10 + i * (img_width + padding_left) + margin_left)
            .attr("y", upper_height + lower_height / 10)
            .attr("xlink:href", img_path)
            .attr("width", img_width)
            .attr("height", img_height)
        g.append("text")
            .text("+")
            .attr("y", upper_height + lower_height / 10 + img_height / 2 - 10)
            .attr("x", width / 10 + i * (img_width + padding_left) + margin_left + img_width)
            .attr("font-size", "130px")
            .attr("dy", ".3em")
            .attr("dx", ".5em")
            .attr("font-weight", "bold")
        g.append("text")
            .text(("" + percentage_map.get(sub_class_names[i]) * 100).substring(0, 4) + "%")
            .attr("y", upper_height + lower_height - 10)
            .attr("x", width / 10 + i * (img_width + padding_left) + margin_left + img_width / 4)
            .attr("font-size", "130px")
            .attr("dy", ".3em")
            .attr("dx", ".5em")
            .attr("font-weight", "bold")
        left = left - percentage_map.get(sub_class_names[i]) * 100
    }
    // 绘制剩下的
    g.append("svg:image")
        .attr("x", width / 10 + sub_class_names.length * (img_width + padding_left) + margin_left)
        .attr("y", upper_height + lower_height / 10 + img_height / 2 - 10)
        .attr("xlink:href", dataDir + "img\\etc.jpg")
        .attr("width", img_width / 3)
    g.append("text")
        .text(("" + left).substring(0, 4) + "%")
        .attr("y", upper_height + lower_height - 10)
        .attr("x", width / 10 + sub_class_names.length * (img_width + padding_left) + margin_left)
        .attr("font-size", "130px")
        .attr("dy", ".3em")
        .attr("dx", ".5em")
        .attr("font-weight", "bold")
}