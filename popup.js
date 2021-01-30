var create_file_button = document.querySelector("#create_file__button");
var solve_test_button = document.querySelector("#solve_test__button");
if (create_file_button) {
	create_file_button.onclick = () => {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.sendMessage(tab.id, {action:"create"}, function(res) {
					if (chrome.runtime.lastError) {
						alert("Попробуйте перезагрузить страницу!");
					}
					else {
						alert(res.isTestTab);
						var hiddenElement = document.createElement('a');
						hiddenElement.href = 'data:attachment/text,' + encodeURI(JSON.stringify(res));
						hiddenElement.target = '_blank';
						hiddenElement.download = 'Test.txt';
						hiddenElement.click();
					}
				});
			});
		});
	}
	solve_test_button.onclick = () => {
		let file = document.querySelector("#answerJSON").files[0];
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function() {
			let text = reader.result;
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.getSelected(null, function(tab) {
					chrome.tabs.sendMessage(tab.id, {action:"solve", answerJSON: text}, function(res) {
						if (chrome.runtime.lastError) {
							alert("Попробуйте перезагрузить страницу!");
						}
						else {

						}
					});
				});
			});
		}
	}
}