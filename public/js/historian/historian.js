
var Historian  = function () {

	var $ = jQuery;
	var historianGraph;

	this.initialize = function() {
		historianGraph = new HistorianGraph();
	}

	this.plotHistoricGraph = function (){
		var item = $( "#deviceslist" ).val();
		if(item) {
			var tokens = item.split(':');

			var top = $( 'input[name=historicQuery]:checked' ).val();
			console.log("called "+top);
			var queryParam = {};
			
			if(top == "topEvents") {
				queryParam = {
					top: $(historicTopRange).spinner( "value" )
				};
			} 
			else if(top == "dateRange") {
				//Datetimes only in GMT
				var startDate = Date.parse($(historicStarts).val()+" GMT");
				var endDate = Date.parse($(historicEnds).val()+" GMT");
				queryParam = {
					start: startDate,
					end: endDate
				};
			}
			
			$.ajax
			({
				type: "GET",
				url: "/api/v0001/historian/"+tokens[1]+"/"+tokens[2]+"/"+tokens[3],
				data: queryParam,
				dataType: 'json',
				async: true,

				success: function (data, status, jq){

					$('#chart').empty();
					$('#timeline').empty();
					$('#legend').empty();
					historianGraph.displayHistChart(null,data);
				},
				error: function (xhr, ajaxOptions, thrownError) {
					console.log(xhr.status);
					console.log(thrownError);
				}
			});
		}
	}

	this.initialize();
};