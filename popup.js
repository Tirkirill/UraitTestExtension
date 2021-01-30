var create_file_button = document.querySelector("#create_file__button");
if (create_file_button) {
	create_file_button.onclick = () => {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			var tab = tabs[0];
			alert(tab.url, tab.title);
			chrome.tabs.getSelected(null, function(tab) {
				alert(tab.id);
				chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(res) {
					alert('onResponse' + res.isTestTab);
				});
			});
		});
	}
}