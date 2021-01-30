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
				let type;
				let isCorrect = question.classList.contains("correct");
				if (hint.textContent=="Выберите один правильный ответ") type = "radio";
				if (hint.textContent=="Введите ответ в виде текста (регистр не учитывается)") type = "text";
				if (hint.textContent=="Соедините элементы попарно (неверно соединенную пару можно разбить, щелкнув на крестик)") type = "connectPairs";
				res["questions"][i] = {};
				res["questions"][i]["title"] = question.querySelector(".question-description p").innerHTML;
				res["questions"][i]["type"] = type;
				res["questions"][i]["isCorrect"] = isCorrect;
				switch (type) {
					case "radio":
						let choosenLabel = question.querySelector("label.checked");
						let choosenRadioOuterHtml = choosenLabel.querySelector("input").outerHTML;
						res["questions"][i]["answer"] = choosenLabel.innerHTML.replace(choosenRadioOuterHtml, "").trim();
						break;
					case "text":
						let response = question.querySelector(".response input");
						res["questions"][i]["answer"] = response.value;
						break;
					case "connectPairs":
						let pairs = question.querySelectorAll(".qt_connect_group");
						let answer = {};
						for (pair of pairs) {
							let items = pair.querySelectorAll(".qt_connect_item");
							answer[items[0].innerHTML.trim()] = items[1].innerHTML.trim();
						}
						res["questions"][i]["answer"] = answer;
						break;
				}
			}
		}
		else {
            res["isTestTab"] = false;
		}
		console.log(res);
        sendResponse(res);
    });
};