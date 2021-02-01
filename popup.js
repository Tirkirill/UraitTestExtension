//Дополнить своими ошибками, безопасный режим для соединения пар, форматы
var create_file_button = document.getElementById("create_file__button");
var solve_test_button = document.getElementById("solve_test__button");
var load_file_button = document.getElementById("load_file__button");
var file_name = document.getElementById("file_name");
var file_input = document.getElementById("answerJSON");

if (create_file_button) {
	create_file_button.onclick = () => {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.sendMessage(tab.id, {action:"create"}, function(res) {
					if (chrome.runtime.lastError) {
						alert("Попробуйте перезагрузить страницу!");
					}
					else {
						if (!res.isTestTab) {
							alert("Выберите вкладку с тестом");
							return;
						}
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
		if (!file) {
			alert("Сначала нужно загрузить файл!");
			return;
		}
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

	load_file_button.onclick = ()=> {
		file_input.click();
	}

	file_input.onchange = ()=> {
		file_name.textContent = file_input.files[0].name;
	}

	


}