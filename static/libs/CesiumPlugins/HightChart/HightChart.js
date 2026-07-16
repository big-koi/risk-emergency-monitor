DiitEarth = DiitEarth || {};

var h = DiitEarth.HightChart = {
    mapGeoJSON: null,
    data: [],
    mapReady: function () {
        debugger
        $.getJSON("../data/geojson/china.json", function (data) {
            debugger
            h.mapGeoJSON = data;
            h.data = [];
            $.each(h.mapGeoJSON.features, function (index, feature) {
                h.data.push({
                    key: feature.properties["name"],
                    value: feature.properties["size"]
                });
            });
            h.hightchart();
        });
    },
    hightchart: function () {
        var scene = viewer.scene;
        scene.canvas.setAttribute('tabIndex', 0);
        var chartContainer = document.createElement("div");
        chartContainer.style.position = 'absolute';
        chartContainer.style.top = '0px';
        chartContainer.style.left = '0px';
        chartContainer.style.width = scene.canvas.width + 'px';
        chartContainer.style.height = scene.canvas.height + 'px';
        chartContainer.style.pointerEvents = 'none';
        chartContainer.setAttribute('id', 'echarts');
        chartContainer.setAttribute('class', 'echartMap');
        viewer.container.appendChild(chartContainer);
        $("#echarts").highcharts('Map', {
            title: {
                text: null
            },
            mapNavigation: {
                enabled: true
            },
            colorAxis: {
                min: 0,
                stops: [
                    [0, '#EFEFFF'],
                    [0.5, Highcharts.getOptions().colors[0]],
                    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).brighten(-0.5).get()]
                ]
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                verticalAlign: 'bottom'
            },
            series: [{
                data: h.data,
                mapData: h.mapGeoJSON,
                joinBy: ['name', 'size'],
                name: 'Random data',
                states: {
                    hover: {
                        color: Highcharts.getOptions().colors[2]
                    }
                }, dataLabels: {
                    enabled: false,
                    formatter: function () {
                        return mapKey === 'custom/world' || mapKey === 'countries/us/us-all' ?
                            (this.point.properties && this.point.properties['hc-a2']) :
                            this.point.name;
                    }
                },
                point: {
                    events: {
                        // On click, look for a detailed map
                        click: function () {
                            var key = this.key;
                            $('#mapDropdown option').each(function () {
                                if (this.value === 'countries/' + key.substr(0, 2) + '/' + key + '-all.js') {
                                    $('#mapDropdown').val(this.value).change();
                                }
                            });
                        }
                    }
                }
            }, {
                type: 'mapline',
                name: "Separators",
                data: Highcharts.geojson(h.mapGeoJSON, 'mapline'),
                nullColor: 'gray',
                showInLegend: false,
                enableMouseTracking: false
            }]
        });
    }
};