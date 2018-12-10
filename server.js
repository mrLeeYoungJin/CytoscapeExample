var path = require('path');
var express = require('express');

var app = express();
var mysql      = require('mysql');
var dbconfig   = require('./src/js/database.js');
var connection = mysql.createConnection(dbconfig);

app.use('/', express.static('src'));

//console.log('__dirname : ', __dirname)

app.set('views', __dirname + '/src/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.get('/smpPattern', function(req, res) {
  var searchdate = req.query.searchdate;
  var d = new Date();

  var year = d.getFullYear();
  var month = d.getMonth() + 1
  if(month<10) { month='0'+month }

  var startDate = year+month+'01';
  var endDate = year+month+'31';

  if(searchdate != '' && searchdate != undefined ) {
    startDate = searchdate+'01';
    endDate = searchdate+'31';
  }

  // var startDate = searchdate+'01';
  // var endDate = searchdate+'31';

  console.log(startDate, endDate)

  var smpQuery = " select " +
  " 	SMP_DATE as smpDate " +
  " 	, season " +
  " 	, (case " +
  " 			when WEEKDAY(SMP_DATE) = 0 then '월' " +
  " 			when WEEKDAY(SMP_DATE) = 1 then '화' " +
  " 			when WEEKDAY(SMP_DATE) = 2 then '수' " +
  " 			when WEEKDAY(SMP_DATE) = 3 then '목' " +
  " 			when WEEKDAY(SMP_DATE) = 4 then '금' " +
  " 			when WEEKDAY(SMP_DATE) = 5 then '토' " +
  " 			when WEEKDAY(SMP_DATE) = 6 then '일' " +
  " 		end) as dayTitle " +
  " 	, SUBSTR(SMP_DATE, 7,8) as day " +
  " 	, GROUP_CONCAT(SMP_TIME, '|', loadType, '|', TEMPERATURE, '|', SMP_VAL ORDER BY SMP_TIME asc SEPARATOR ',') as smpVals " +
  " 	, min(TEMPERATURE) as minTemperature " +
  "   , max(TEMPERATURE) as maxTemperature " +
  " 	, COUNT(SMP_TIME)  as cnt " +
  " from " +
  " 	( " +
  " 		SELECT " +
  " 			a.*, " +
  " 			(CASE " +
  " 				WHEN b.LOAD_TYPE = 0 THEN 'Low' " +
  " 				WHEN b.LOAD_TYPE = 1 THEN 'Middle' " +
  " 				WHEN b.LOAD_TYPE = 2 THEN 'High' " +
  " 			END) as loadType  " +
  " 			, c.TEMPERATURE " +
  " 		FROM " +
  " 			( " +
  " 				SELECT " +
  " 					SMP_DATE, SMP_TIME, SMP_VAL, " +
  " 					(CASE " +
  " 					 WHEN month(SMP_DATE) = 6 OR month(SMP_DATE) = 7 OR month(SMP_DATE) = 8 " +
  " 						 THEN 0 " +
  " 					 WHEN month(SMP_DATE) = 3 OR month(SMP_DATE) = 4 OR month(SMP_DATE) = 5 OR month(SMP_DATE) = 9 OR " +
  " 								month(SMP_DATE) = 10 " +
  " 						 THEN 1 " +
  " 					 WHEN month(SMP_DATE) = 11 OR month(SMP_DATE) = 12 OR month(SMP_DATE) = 1 OR month(SMP_DATE) = 2 " +
  " 						 THEN 2 " +
  " 					 END) AS season " +
  " 				FROM KPX_SMP_INFO " +
  " 				WHERE SMP_DATE BETWEEN "+startDate+" and "+ endDate + " " +
  " 			) a, KEPCO_ENFOR_TIME b, " +
  "       ( " +
  "       SELECT " +
  "	        IF (WEATHER_TIME = 00,REPLACE(DATE_ADD(WEATHER_DATE, INTERVAL -1 DAY), '-', ''), WEATHER_DATE) AS WEATHER_DATE " +
  "	      , IF (WEATHER_TIME = 00, 24, WEATHER_TIME) AS WEATHER_TIME " +
  "	      , TEMPERATURE " +
  "       FROM KMA_WEATHER) c " +
  " 		WHERE a.season = b.SEASON_TYPE AND a.SMP_TIME = b.LOAD_TIME and a.SMP_DATE = c.WEATHER_DATE and a.SMP_TIME = c.WEATHER_TIME " +
  " 	) a " +
  " group by a.SMP_DATE " +
  " ORDER BY a.SMP_DATE asc "

  console.log('req : ', typeof(searchdate))

  connection.query(smpQuery, function(err, rows) {
    if(err) throw err;

    //console.log('rows: ', rows);

    res.render('smpPattern', {
        datas : rows
    });
  });
});

app.listen(3001, 'localhost', (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:3000');
});
