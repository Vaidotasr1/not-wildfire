chrome.runtime.onMessage.addListener(function(response, sender, sendResponse){

var waitForPageLoad = false; // Stops replaying while page is loading

if(response.type == "loaded"){ // Indicates that page is loaded
	waitForPageLoad = false; 
}

  if(response.type == "Play"){ // Replaying
 injectScript("click", 226, 518, null);
 //assignValues();
	}

if(response.type == "start"){ // Start recording
	isRec = true;
	 contentArray = [];
   eventArray = [];
   valueArray = [];
}

      if(isRec){
        if(response.type == "event") {  // Saving data
          eventArray.push(response.content);

        }   
   if(response.type == "html") {
           contentArray.push(response.content); 
        }

		        if(response.type == "value") {
          valueArray.push(response.content);
				}
		        if(response.type == "stop") {
					isRec = false;


for(var i = 0; i < eventArray.length; i++){

	append_to_json(eventArray[i], contentArray[i], valueArray[i], "defaultName"); // Saving data to local storage
}
				}
}
});

var index; //Indexes for arrays containing commands positions and values.
var injectedScript = []; // Scripts that are already injected in page
var Commands = [];
var PositionX = [];
var PositionY = [];
var Values = [];

function DataParsing(){
	var temp_records = (localStorage.getItem("defaultName")).split(";");

for(var i = 0; i < temp_records.length-1; i++)
{

var object = JSON.parse(temp_records[i]);
Commands[i] = object.Command;
PositionX[i] = object.X;
PositionY[i] = object.Y;
Values[i] = object.Value;
}
}

// Reads data from chrome.storage and selects commands, positions and values 
function assignValues(){

DataParsing();

		    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
 chrome.tabs.executeScript(tabs[0].id, {file: "jquery-3.3.1.js"}); // Line is not added to injectScript, to prevent multiple library injections
  });

callInjection(0); //Starting simulation
	
}

function append_to_json(command, target, value, jsonName){

	if(command === null)
		return false;
		
	var json = {
		"Command":command,
		"Target":target,
		"Value":value
	}
	
	var data = JSON.stringify(json);
	
	var oldJSON = localStorage.getItem(jsonName);
    if(oldJSON === null){
		oldJSON = "";
	}

    localStorage.setItem(jsonName, oldJSON + data + ";");
	}
	
  let isRec = false;
  var contentArray = [];
  var eventArray = [];
  var valueArray = [];


// ---------------PAKOLKAS NEREIKIA. REIKES KAI ATKARTOSIM VEIKSMUS PER KELIS TABUS
var func = function(x){
//chrome.tabs.create({'url': "http://www.9gag.com"}, function(tab){ 
alert(x);
		    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
    var activeTab = tabs[0];
				chrome.tabs.executeScript(activeTab.id, {file: "Replay_Basic.js"});
	   chrome.tabs.sendMessage(activeTab.id, {"argument": x});
  });

	};
 


// Function is recursively called with one second gaps until it iterates through all commands
function callInjection(index){
if(!waitForPageLoad) 
{
 injectScript(Commands[index], 0, 0, Values[index]);	

	 setTimeout(function(){
		 	 if(index < commands.length){
			 callInjection(index+1);	 
	 			 }	 
	 }, 1000);		 	
} else // If page is not loaded yet, function tries to call itself each 0.5sec
{
		 setTimeout(function(){
			 callInjection(index);	 
	 }, 500);	
}
}



// Injects script into current tab
function injectScript(command, posX, posY, value)
{				

    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){ //Passing commands and values
    var activeTab = tabs[0];	
if(jQuery.inArray(command, injectedScript) !== -1)  // Checks if script is already added to page
{
		chrome.tabs.sendMessage(activeTab.id, {"type": command,"posX": posX, "posY": posY, "value": value}); // If yes
}
else {
injectedScript.push(command);
if(command == "URLchange")
{
	injectedScript = [];
waitForPageLoad = true;
	}

	var file = command.concat("_ext.js");				
				chrome.tabs.executeScript(activeTab.id, {file: file}, function(){
										chrome.tabs.sendMessage(activeTab.id, {"type": command,"posX": posX, "posY": posY, "value": value});
					});
}
  });
}


