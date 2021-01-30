var create_file_button = document.querySelector("#create_file__button");
if (create_file_button) {
	create_file_button.onclick = () => {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			var tab = tabs[0];
			try {
				chrome.tabs.getSelected(null, function(tab) {
					chrome.tabs.sendMessage(tab.id, {}, function(res) {
						if (chrome.runtime.lastError) {
							alert("Попробуйте перезагрузить страницу!");
						}
						else {
							alert(res.isTestTab);
						}
					});
				});
			}
			catch(e){
				if (e instanceof runtime.lastError) {
					alert("Попробуйте перезагрузить страницу!")
				}
				else {
					alert("Непридвиденная ошибка!");
					alert(e);
				}
			}
		});
	}
}