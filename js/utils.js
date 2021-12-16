!function(){
    var bP={};
    var b=30, bb=150, height=600, buffMargin=1, minHeight=14;
    var c1=[-130, 40], c2=[-50, 100], c3=[-10, 140]; //Column positions of labels.
    var colors =["#3366FF", "#DC39FF",  "#FF9900","#109618", "#990099", "#0099C6"];
    var dataDir = "file://D:\\Workspace\\Datavisualize\\大作业\\data\\";
    // 这个函数负责建立数据之间的关系
    bP.partData = function(data,p){
        var sData={};

        sData.keys=[
            d3.set(data.map(function(d){ return d[0];})).values().sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);}),
            d3.set(data.map(function(d){ return d[1];})).values().sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);})
        ];

        sData.data = [	sData.keys[0].map( function(d){ return sData.keys[1].map( function(v){ return 0; }); }),
            sData.keys[1].map( function(d){ return sData.keys[0].map( function(v){ return 0; }); })
        ];

        data.forEach(function(d){
            sData.data[0][sData.keys[0].indexOf(d[0])][sData.keys[1].indexOf(d[1])]=d[p];
            sData.data[1][sData.keys[1].indexOf(d[1])][sData.keys[0].indexOf(d[0])]=d[p];
        });

        // sData 中包含了要可视化的数据
        // sData.key 是有一个长度为 N 的数组和一个长度为 M 的数组
        // sData.data 包含了一个 N*M 的矩阵和一个 M*N 的矩阵，这两个矩阵互为转置关系
        return sData;
    }

    // 这个函数负责计算可视化相关的信息，包括位置、线条粗细等等
    function visualize(data){
        var vis ={};
        // 计算每个类在最终结果中的位置，高度，百分比等
        function calculatePosition(a, s, e, b, m){
            // total is the sum of data.data
            var total=d3.sum(a);
            var sum=0, neededHeight=0, leftoverHeight= e-s-2*b*a.length;
            var ret =[];

            // 这个函数计算出了在最终结果中每个样本所占的比例
            a.forEach(
                function(d){
                    var v={};
                    v.percent = (total == 0 ? 0 : d/total);
                    v.value=d;
                    v.height=Math.max(v.percent*(e-s-2*b*a.length), m);
                    (v.height==m ? leftoverHeight-=m : neededHeight+=v.height );
                    ret.push(v);
                }
            );

            var scaleFact=leftoverHeight/Math.max(neededHeight,1), sum=0;

            ret.forEach(
                function(d){
                    d.percent = scaleFact*d.percent;
                    d.height=(d.height==m? m : d.height*scaleFact);
                    d.middle=sum+b+d.height/2;
                    d.y=s + d.middle - d.percent*(e-s-2*b*a.length)/2;
                    d.h= d.percent*(e-s-2*b*a.length);
                    d.percent = (total == 0 ? 0 : d.value/total);
                    sum+=2*b+d.height;
                }
            );
            return ret;
        }

        // mainBars 是外壳，subBars 是内核
        vis.mainBars = [
            calculatePosition( data.data[0].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight),
            calculatePosition( data.data[1].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight)
        ];

        vis.subBars = [[],[]];
        // 计算每个 MainBar 下 subBar 的位置
        vis.mainBars.forEach(function(pos,p){
            pos.forEach(function(bar, i){
                calculatePosition(data.data[p][i], bar.y, bar.y+bar.h, 0, 0).forEach(function(sBar,j){
                    sBar.key1=(p==0 ? i : j);
                    sBar.key2=(p==0 ? j : i);
                    vis.subBars[p].push(sBar);
                });
            });
        });
        // 对 subBar 进行排序
        vis.subBars.forEach(function(sBar){
            sBar.sort(function(a,b){
                return (a.key1 < b.key1 ? -1 : a.key1 > b.key1 ?
                    1 : a.key2 < b.key2 ? -1 : a.key2 > b.key2 ? 1: 0 )});
        });

        vis.edges = vis.subBars[0].map(function(p,i){
            return {
                key1: p.key1,
                key2: p.key2,
                y1:p.y,
                y2:vis.subBars[1][i].y,
                h1:p.h,
                h2:vis.subBars[1][i].h
            };
        });
        vis.keys=data.keys;
        return vis;
    }

    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return edgePolygon(i(t));
        };
    }

    // 绘制两边的数据
    function drawPart(data, id, p){
        d3.select("#"+id).append("g").attr("class","part"+p)
            .attr("transform","translate("+( p*(bb+b))+",0)");
        d3.select("#"+id).select(".part"+p).append("g").attr("class","subbars");
        d3.select("#"+id).select(".part"+p).append("g").attr("class","mainbars");

        var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
            .selectAll(".mainbar").data(data.mainBars[p])
            .enter().append("g").attr("class","mainbar").attr("id", function(d, i){return (p === 0 ? "left" : "right") + i});

        mainbar.append("rect").attr("class","mainrect")
            // 位置
            .attr("x", 0)
            .attr("y",function(d){ return d.middle-d.height/2; })
            // 大小
            .attr("width",b)
            .attr("height",function(d){ return d.height; })
            // 抗锯齿
            .style("shape-rendering","auto")
            // 不透明度
            .style("fill-opacity",0)
            // 选中时的方框
            .style("stroke-width","0.5")
            .style("stroke","black").style("stroke-opacity",0);

        // channel 行的文字
        mainbar.append("text").attr("class","barlabel")
            .attr("x", c1[p]).attr("y",function(d){ return d.middle+5;})
            .text(function(d,i){ return data.keys[p][i];})
            .attr("text-anchor","start" );

        // count 行的文字
        mainbar.append("text").attr("class","barvalue")
            .attr("x", c2[p]).attr("y",function(d){ return d.middle+5;})
            .text(function(d,i){
                // 优化，防止过程导致展示溢出
                if (d.value.toString().length < 5) {
                    return d.value;
                } else {
                    return d.value.toString().substr(0, 5);
                }
            })
            .attr("text-anchor","end");

        // count 行的百分比
        mainbar.append("text").attr("class","barpercent")
            .attr("x", c3[p]).attr("y",function(d){ return d.middle+5;})
            .text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;})
            .attr("text-anchor","end").style("fill","grey");

        // 填充 subBarxz
        d3.select("#"+id)
            .select(".part"+p)
            .select(".subbars")
            .selectAll(".subbar")
            .data(data.subBars[p])
            .enter()
            .append("rect")
            .attr("class","subbar")
            .attr("x", 0)
            .attr("y",function(d){ return d.y})
            .attr("width",b)
            .attr("height",function(d){ return d.h})
            .style("fill",function(d){ return colors[d.key1];});
    }

    // 绘制中间的连线
    function drawEdges(data, id){
        d3.select("#"+id).append("g").attr("class","edges").attr("transform","translate("+ b+",0)");

        d3.select("#"+id).select(".edges").selectAll(".edge")
            .data(data.edges).enter().append("polygon").attr("class","edge")
            .attr("points", edgePolygon).style("fill",function(d){ return colors[d.key1];})
            .style("opacity",0.5).each(function(d) { this._current = d; });
    }

    // 绘制顶部的文字
    function drawHeader(header, id){
        d3.select("#"+id).append("g").attr("class","header").append("text").text(header[2])
            .style("font-size","20").attr("x",108).attr("y",-20).style("text-anchor","middle")
            .style("font-weight","bold");

        [0,1].forEach(function(d){
            var h = d3.select("#"+id).select(".part"+d).append("g").attr("class","header");

            h.append("text").text(header[d]).attr("x", (c1[d]-5))
                .attr("y", -5).style("fill","grey");

            h.append("text").text("Count").attr("x", (c2[d]-10))
                .attr("y", -5).style("fill","grey");

            h.append("line").attr("x1",c1[d]-10).attr("y1", -2)
                .attr("x2",c3[d]+10).attr("y2", -2).style("stroke","black")
                .style("stroke-width","1").style("shape-rendering","crispEdges");
        });
    }

    // 绘制边，每个边就是一个梯形
    function edgePolygon(d){
        return [0, d.y1, bb, d.y2, bb, d.y2+d.h2, 0, d.y1+d.h1].join(" ");
    }

    function transitionPart(data, id, p){
        var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
            .selectAll(".mainbar").data(data.mainBars[p]);
        //
        mainbar.select(".mainrect").transition().duration(500)
            .attr("y",function(d){ return d.middle-d.height/2;})
            .attr("height",function(d){ return d.height;});

        mainbar.select(".barlabel").transition().duration(500)
            .attr("y",function(d){ return d.middle+5;});

        mainbar.select(".barvalue").transition().duration(500)
            .attr("y",function(d){ return d.middle+5;}).text(function(d,i){
            if (d.value.toString().length < 5) {
                return d.value;
            } else {
                return d.value.toString().substr(0, 5);
            }
        });

        mainbar.select(".barpercent").transition().duration(500)
            .attr("y",function(d){ return d.middle+5;})
            .text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;});

        d3.select("#"+id).select(".part"+p).select(".subbars")
            .selectAll(".subbar").data(data.subBars[p])
            .transition().duration(500)
            .attr("y",function(d){ return d.y})
            .attr("height",function(d){return d.h});
    }

    function transitionEdges(data, id){
        d3.select("#"+id).append("g").attr("class","edges")
            .attr("transform","translate("+ b+",0)");

        d3.select("#"+id).select(".edges").selectAll(".edge").data(data.edges)
            .transition().duration(500)
            .attrTween("points", arcTween)
            .style("opacity",function(d){ return (d.h1 ==0 || d.h2 == 0 ? 0 : 0.5);});
    }

    function transition(data, id){
        new_data = data
        transitionPart(data, id, 0);
        transitionPart(data, id, 1);
        transitionEdges(data, id);
    }

    bP.draw = function(data, svg){
        d3.select("body").select("svg").select("#mainFrame").attr("keep", "0")
        data.forEach(function(biP,s){
            svg.append("g")
                .attr("id", biP.id)
                // 修改位置
                .attr("transform","translate("+ 250+",0)");


            var visData = visualize(biP.data);
            // 画出左边部分
            drawPart(visData, biP.id, 0);
            // 画出右边部分
            drawPart(visData, biP.id, 1);
            drawEdges(visData, biP.id);
            drawHeader(biP.header, biP.id);

            [0,1].forEach(function(p){
                d3.select("#"+biP.id)
                    .select(".part"+p)
                    .select(".mainbars")
                    .selectAll(".mainbar")
                    .on("mouseover",function(d, i){
                        var mainFrame = d3.select("body").select("svg").select("#mainFrame");
                        var keep = mainFrame.attr("keep");
                        if (keep === "0") {
                            return bP.selectSegment(data, p, i);
                        }
                    })
                    .on("mouseout",function(d, i){
                        var mainFrame = d3.select("body").select("svg").select("#mainFrame");
                        var keep = mainFrame.attr("keep");
                        if (keep === "0") {
                            return bP.deSelectSegment(svg, data, p, i);
                        }
                    })
                    .on("click", function(d, i) {
                        var keep = d3.select(this).attr("keep");
                        var global_keep = d3.select("body").select("svg").select("#mainFrame").attr("keep");
                        if (keep === "0" || keep === null) {
                            if (global_keep === "0") {
                                d3.select(this).attr("keep", "1")
                                d3.select("body").select("svg").select("#mainFrame").attr("keep", "1")
                                // remove all img
                                svg.selectAll(".img_svg").remove()
                                scatter(i)
                                bP.showClassImg(svg, visData, i)
                            }
                        } else if (keep === "1") {
                            d3.select(this).attr("keep", "0")
                            d3.select("body").select("svg").select("#mainFrame").attr("keep", "0")
                        }
                    });
            });
        });
    }

    var findMax = function(i, check_data) {
        /*
            寻找被选中的类，对应的另一侧中，概率最大的五个类
         */
        var selected_right = []
        var min_val = 10
        var min_idx = -1
        for(var idx = 0; idx < check_data.length; idx = idx + 1) {
            if (selected_right.length < 5) {
                selected_right.push(idx)
                if (check_data[idx].height < min_val) {
                    min_val = check_data[idx].height
                    min_idx = idx
                }
            } else if (check_data[idx].height > min_val) {
                for(var j = 0; j < 5; j = j + 1) {
                    if (selected_right[j] === min_idx) {
                        selected_right[j] = idx
                    }
                }
                min_val = 10
                for(var j = 0; j < 5; j = j + 1) {
                    if (check_data[selected_right[j]].height < min_val) {
                        min_val = check_data[selected_right[j]].height
                        min_idx = selected_right[j]
                    }
                }
            }
        }
        return selected_right
    }

    var new_data;

    bP.showClassImg = function(svg, visData, i) {
        // 展示左侧的图片
        svg.append("svg:image")
            .attr("xlink:href", dataDir + i + ".svg")
            .attr("id", "img_left" + i)
            .attr("class", "img_svg")
            .attr("width", 100)
            .attr("height", visData.mainBars[0][i].height)
            .attr("x", 0)
            .attr("y", visData.mainBars[0][i].middle - visData.mainBars[0][i].height / 2);


        var newdata;
        data.forEach(function(k){
            newdata =  {keys:[], data:[]};

            newdata.keys = k.data.keys.map( function(d){ return d;});

            newdata.data[1] = k.data.data[1].map( function(d){ return d;});

            newdata.data[0] = k.data.data[0]
                .map( function(v){ return v.map(function(d, i){ return (1==i ? d : 0);}); });

            newdata = visualize(newdata)

        })
        newdata = newdata.subBars[1].slice(i * 20, i * 20 + 20)
        var selected_right = findMax(i, newdata)
        // 绘制右侧被选中的对应图片
        for(var idx = 0; idx < selected_right.length; idx++) {
            svg.append("svg:image")
                .attr("xlink:href", dataDir + idx + ".svg")
                .attr("id", "img_right" + idx)
                .attr("class", "img_svg")
                .attr("width", 100)
                .attr("height", new_data.subBars[1][ i * 20 + selected_right[idx]].h)
                .attr("x", 570)
                .attr("y", new_data.subBars[1][i * 20 + selected_right[idx]].y);
        }

    }

    bP.selectSegment = function(data, m, selected_id){
        console.log(selected_id)
        data.forEach(function(k){
            var newdata =  {keys:[], data:[]};

            newdata.keys = k.data.keys.map( function(d){ return d;});

            newdata.data[m] = k.data.data[m].map( function(d){ return d;});

            // 对另一侧的值进行计算，如果不在 selected_id 中，值就会被设置为 0
            newdata.data[1-m] = k.data.data[1-m]
                .map( function(v){ return v.map(function(d, i){ return (selected_id==i ? d : 0);}); });

            transition(visualize(newdata), k.id);

            var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
                .selectAll(".mainbar").filter(function(d,i){ return (i==selected_id);});

            selectedBar.select(".mainrect").style("stroke-opacity",1);
            selectedBar.select(".barlabel").style('font-weight','bold');
            selectedBar.select(".barvalue").style('font-weight','bold');
            selectedBar.select(".barpercent").style('font-weight','bold');
        });
    }

    bP.deSelectSegment = function(svg, data, m, s){
        svg.selectAll(".img_svg").remove()
        d3.select(".scatter").remove()
        d3.select(".chart").remove()
        // d3.select("body").selectAll(".point").remove()
        data.forEach(function(k){
            transition(visualize(k.data), k.id);

            var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
                .selectAll(".mainbar").filter(function(d,i){ return (i==s);});

            selectedBar.select(".mainrect").style("stroke-opacity",0);
            selectedBar.select(".barlabel").style('font-weight','normal');
            selectedBar.select(".barvalue").style('font-weight','normal');
            selectedBar.select(".barpercent").style('font-weight','normal');
        });
    }

    this.bP = bP;
}();