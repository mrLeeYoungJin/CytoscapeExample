var customCategories = [];
var customTemperatureSeries = [];
var minTemperatureSeries = [];
var maxTemperatureSeries = [];

var series = {
  name: '최저기온',
  color : 'blue',
  lineWidth: 1,
  index: 1,
  data: []
}

var series1 = {
  name: '최고기온',
  color : 'red',
  lineWidth: 1,
  index: 2,
  data: []
}

var drSeries = {
  type: 'column',
  name: '발령일',
  //color : 'red',
  yAxis: 1,
  lineWidth: 1,
  index: 0,
  data: []
}

var drDates = ['20180111','20180112','20180124','20180125','20180126','20180206','20180207']
var drDateSeries = [];

datas.forEach(function(data, i) {
  let date = data.smpDate;
  customCategories.push(date.substring(6,8));
  drDateSeries.push(0)

  drDates.forEach(function(drDate) {
    if(date == drDate) {
      drDateSeries[i] = 10
    }
  });

  minTemperatureSeries.push(data.minTemperature);
  maxTemperatureSeries.push(data.maxTemperature);
});

series.data = minTemperatureSeries;
series1.data = maxTemperatureSeries;
drSeries.data = drDateSeries;

customTemperatureSeries.push(series);
customTemperatureSeries.push(series1);
customTemperatureSeries.push(drSeries);

Highcharts.chart('container2', {
    chart: {
    		zoomType: 'x',
        type: 'spline'
    },
    title: {
        text:  + datasOne.smpDate.substring(0,4) + '년 ' + datasOne.smpDate.substring(4,6) + '월, 서울 최저/최고 기온'
    },
    /* subtitle: {
        text: 'Source: Wikipedia.org'
    }, */
    xAxis: {
        categories: customCategories,
        //tickmarkPlacement: 'on',
        title: {
        	text: '일자',
          enabled: true
        }
    },
    yAxis: [{
      labels: {
        format: '{value}'+'도'
      },
      title: {
        //text: 'Value'
        enabled: false
      }
    }
    , { // Secondary yAxis
        labels: {
          enabled: false
        },
        title: {
            text: '발령일',
            enabled: false
        }
    }
  ],
    tooltip: {
        formatter: function () {
          let s = '';

          $.each(this.points, function (i, data) {
            let point = data.point;
            if(this.series.name != '발령일') {
              s += this.series.name + ': '+ point.y + '도 <br />';
            }
          });

          return s;
        },
        // headerFormat: '',
        // pointFormat: '{series.name}: <b>{point.y}도</b> <br />',
        shared: true
    },
    plotOptions: {
        spline: {
            lineWidth: 1,
            marker: {
                enabled: false
            }
        }
    },
    series:customTemperatureSeries
});
