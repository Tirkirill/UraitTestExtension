//Дополнить своими ошибками, безопасный режим для соединения пар, форматы
var create_file_button = document.querySelector("#create_file__button");
var solve_test_button = document.querySelector("#solve_test__button");
if (create_file_button) {
	create_file_button.onclick = () => {
		let format = document.querySelector('input[name="format"]:checked').value;
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.sendMessage(tab.id, {action:"create", format: format}, function(res) {
					if (chrome.runtime.lastError) {
						alert("Попробуйте перезагрузить страницу!");
					}
					else {
						var hiddenElement = document.createElement('a');
						hiddenElement.href = 'data:attachment/text,' + encodeURIComponent(JSON.stringify(res));
						hiddenElement.target = '_blank';
						hiddenElement.download = res.fileTitle + ".txt";
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