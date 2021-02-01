//Дополнить своими ошибками, безопасные режимы
function getFile() {
	let file = document.querySelector("#answerJSON").files[0]; 
	if (!file) {
		alert("Сначала нужно загрузить файл!");
		return false;
	}
	return file;
}


var create_file_button = document.getElementById("create_file__button");
var solve_test_button = document.getElementById("solve_test__button");
var load_file_button = document.getElementById("load_file__button");
var file_name_spans = document.getElementsByClassName("file_name");
var append_test_button = document.getElementById("append_test__button");

var file_input = document.getElementById("answerJSON");
//var safeRegimes = [7, 2];
var safeRegimes = [];
window.onload=()=> {
	create_file_button.onclick = () => {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.sendMessage(tab.id, {action:"create"}, function(res) {
					if (chrome.runtime.lastError) {
						alert("Попробуйте перезагрузить страницу!");
						console.log(chrome.runtime.lastError);
					}
					else {
						if (!res.OK) {
							switch(res.error_code) {
								case 0:
									alert("Выберите вкладку с тестом");
									return;
							}
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
		if (file = getFile()) {
			var reader = new FileReader();
			reader.readAsText(file);
			reader.onload = function() {
				safeRegimes = [];
				for (let check of document.querySelectorAll(".safe-regimes input[type='checkbox']:checked")) safeRegimes.push(check.value);
				let text = reader.result;
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.tabs.getSelected(null, function(tab) {
						chrome.tabs.sendMessage(tab.id, {action:"solve", answerJSON: text, safeRegimes:safeRegimes}, function(res) {
							if (chrome.runtime.lastError) {
								alert("Попробуйте перезагрузить страницу!");
								console.log(chrome.runtime.lastError);
							}
							else {
								if (!res.OK) {
									switch(res.error_code) {
										case 0:
											alert("Выберите вкладку с тестом");
									}
									return;
								}
							}
						});
					});
				});
			}
		}
	}

	append_test_button.onclick = ()=> {
		if (file = getFile()) {
			var reader = new FileReader();
			reader.readAsText(file);
			reader.onload = function() {
				let text = reader.result;
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.tabs.getSelected(null, function(tab) {
						chrome.tabs.sendMessage(tab.id, {action:"append", answerJSON: text}, function(res) {
							if (chrome.runtime.lastError) {
								alert("Попробуйте перезагрузить страницу!");
								console.log(chrome.runtime.lastError);
							}
							else {
								if (!res.OK) {
									switch(res.error_code) {
										case 0:
											alert("Выберите вкладку с тестом");
											return;
									}
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
		}
	}

	load_file_button.onclick = ()=> {
		file_input.click();
	}

	file_input.onchange = ()=> {
		let file = file_input.files[0];
		if (file)  {
			for (let span of file_name_spans) span.textContent = file.name;
		};
	}
}