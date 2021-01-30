window.onload = function() {
    chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
        var res = {};
		let isTest = document.querySelector(".quiz-content");
		if (isTest) {
			res["isTestTab"] = true;
			res["questions"] = [];
			let questions = document.querySelectorAll(".question");
			for (let i=0; i<questions.length; i++) {
				let question = questions[i];
				let hint = question.querySelector(".hint");
				let type = "";
				let isCorrect = question.classList.contains("correct");
				switch (hint.textContent) {
					case "Выберите один правильный ответ":
						type="radio";
						break;
					case "Введите ответ в виде текста (регистр не учитывается)":
					case "Введите на месте пропуска текст (регистр не учитывается)":
						type = "text";
						break;
					case "Соедините элементы попарно (неверно соединенную пару можно разбить, щелкнув на крестик)":
						type = "connectPairs";
						break;
					case "Выберите один или несколько правильных ответов":
						type="checks";
						break;
					case "Выберите из выпадающего списка правильный ответ":
						type="select";
						break;
					case "Расставьте в правильном порядке":
						type="order";
						break;
				}
				res["questions"][i] = {};
				res["questions"][i]["title"] = question.querySelector(".question-description p").textContent;
				res["questions"][i]["type"] = type;
				res["questions"][i]["isCorrect"] = isCorrect;
				let answer;
				switch (type) {
					case "radio":
						let choosenLabel = question.querySelector("label.checked");
						let choosenRadioOuterHtml = choosenLabel.querySelector("input").outerHTML;
						answer = choosenLabel.innerHTML.replace(choosenRadioOuterHtml, "").trim();
						break;
					case "text":
						let response = question.querySelector(".response input");
						answer = response.value;
						break;
					case "connectPairs":
						answer = {};
						let pairs = question.querySelectorAll(".qt_connect_group");
						for (pair of pairs) {
							let items = pair.querySelectorAll(".qt_connect_item");
							answer[items[0].innerHTML.trim()] = items[1].innerHTML.trim();
						}
						break;
					case "checks":
						answer = [];
						let labels = question.querySelectorAll("label");
						for (let label of labels) {
							let box = label.querySelector("input[type='checkbox']");
							if (box.checked) {
								answer.push(label.innerHTML.replace(box.outerHTML, "").trim());
							}
						}
						break;
					case "select":
						let select = question.querySelector("select");
						answer = select.querySelector("option[selected='selected'").textContent;
						break;
					case "order":
						answer = [];
						let questionOrder = question.querySelector(".question-order");
						let items = questionOrder.querySelectorAll("div");
						for (let item of items) {
							answer.push(item.textContent);
						}
						break;
					case "":
						console.log("Такой тип вопроса не учтен...\nВопрос: " + res["questions"][i]["title"] + "\nHint: "+hint.textContent);
						break;
				}
				console.log(answer!=undefined);
				res["questions"][i]["answer"] = answer;
			}
		}
		else {
            res["isTestTab"] = false;
		}
		console.log(res);
        sendResponse(res);
    });
};