noDevice = false;
function print_r(arr, level) {
    var print_red_text = "";
    if(!level) level = 0;
    var level_padding = "";
    for(var j=0; j<level+1; j++) level_padding += "&nbsp;&nbsp;&nbsp;";
    if(typeof(arr) == 'object') {
        for(var item in arr) {
            var value = arr[item];
            if(typeof(value) == 'object') {
                print_red_text += level_padding + "'" + item + "' :<br>";
                print_red_text += print_r(value,level+1);
		} 
            else 
                print_red_text += level_padding + "'" + item + "' => \"" + value + "\"<br>";
        }
    } 

    else  print_red_text = "===>"+arr+"<===("+typeof(arr)+")";
    return print_red_text;
}
document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("offline", onDeviceOffline, false);
document.addEventListener("resume", onDeviceResume, false);
document.addEventListener("pause", onDevicePause, false);
function onDeviceReady() {
	db = new CDB(); 
	connect = new CCONNECT(); 
	preloadAssets();
	window.plugins.OneSignal
		.startInit("451f4ea0-2e67-4a44-add4-1540cd3129c5")
		.inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.None)
		.handleNotificationOpened(function(pushdata) {
			initPushData(pushdata, 'opened');
		})
		.handleNotificationReceived(function(pushdata) {
			initPushData(pushdata, 'received');
		})
		.endInit();	
}
function initPushData(pushdata, type) {
	console.log(pushdata);
	window.RECIEVED_PUSH_DATA = pushdata;	
	window.RECIEVED_PUSH_TYPE = type;
}
function onDeviceOffline() {}
function onDeviceResume() {}
function onDevicePause() {}
function handleOpenURL(url) {
  window.needToOpenUrl = url;
}