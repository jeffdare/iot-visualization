var subscribeTopic = "";

var Realtime = function(orgId, api_key, auth_token) {

	var firstMessage = true;

	var clientId="a:"+orgId+":" +Date.now();

	console.log("clientId: " + clientId);
	var hostname = orgId+".messaging.internetofthings.ibmcloud.com";
	var client;

	this.initialize = function(){

		client = new Messaging.Client(hostname, 8883,clientId);

		// Initialize the Realtime Graph
		var rtGraph = new RealtimeGraph();
		client.onMessageArrived = function(msg) {
			var topic = msg.destinationName;
			
			var payload = JSON.parse(msg.payloadString);
			//First message, instantiate the graph  
		    if (firstMessage) {
		    	firstMessage=false;
		    	rtGraph.displayChart(null,payload);
		    } else {
		    	rtGraph.graphData(payload);
		    }
		};

		client.onConnectionLost = function(e){
			console.log("Connection Lost at " + Date.now() + " : " + e.errorCode + " : " + e.errorMessage);
			this.connect(connectOptions);
		}

		var connectOptions = new Object();
		connectOptions.keepAliveInterval = 3600;
		connectOptions.useSSL=true;
		connectOptions.userName=api_key;
		connectOptions.password=auth_token;

		connectOptions.onSuccess = function() {
			console.log("MQTT connected to host: "+client.host+" port : "+client.port+" at " + Date.now());
		}

		connectOptions.onFailure = function(e) {
			console.log("MQTT connection failed at " + Date.now() + "\nerror: " + e.errorCode + " : " + e.errorMessage);
		}

		console.log("about to connect to " + client.host);
		client.connect(connectOptions);
	}

	// Subscribe to the device when the device ID is selected.
	this.plotRealtimeGraph = function(){
		var subscribeOptions = {
			qos : 0,
			onSuccess : function() {
				console.log("subscribed to " + subscribeTopic);
			},
			onFailure : function(){
				console.log("Failed to subscribe to " + subscribeTopic);
				console.log("As messages are not available, visualization is not possible");
			}
		};
		
		var item = $("#deviceslist").val();
		var tokens = item.split(':');
		if(subscribeTopic != "") {
			console.log("Unsubscribing to " + subscribeTopic);
			client.unsubscribe(subscribeTopic);
		}
		
		subscribeTopic = "iot-2/type/" + tokens[2] + "/id/" + tokens[3] + "/evt/+/fmt/json";
		client.subscribe(subscribeTopic,subscribeOptions);

		console.log("first   :: "+firstMessage);

		//clear prev graphs
		$('#chart').empty();
		$('#timeline').empty();
		$('#legend').empty();
		firstMessage = true;
	}

	this.initialize();
}