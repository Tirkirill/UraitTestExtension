var create_file_button = document.querySelector("#create_file__button");
if (create_file_button) {
	create_file_button.onclick = () => {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.sendMessage(tab.id, {}, function(res) {
					if (chrome.runtime.lastError) {
						alert("Попробуйте перезагрузить страницу!");
					}
					else {
						alert(res.isTestTab);
						var hiddenElement = document.createElement('a');
						hiddenElement.href = 'data:attachment/text,' + encodeURI(JSON.stringify(res));
						hiddenElement.target = '_blank';
						hiddenElement.download = 'Test.json';
						hiddenElement.click();
					}
				});
			});
		});
	}
}