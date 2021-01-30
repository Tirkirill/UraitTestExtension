const { timeout, delay } = require("q");

const RADIO_TYPE = 1;
const CONNECTPAIRS_TYPE = 7;
const TEXT_TYPE = 6;
const ORDER_TYPE = 9;
const CHECKS_TYPE = 2;
const SELECT_TYPE = 8;


window.onload = function() {
    chrome.runtime.onMessage.addListener(function(req, _, sendResponse) {
		if (req.action == "create") {
			createFile(sendResponse);
		}
		if (req.action == "solve") {
			solveTest(sendResponse, req.answerJSON);
		}
	});
};

function createFile(sendResponse) {
	var res = {};
	let isTest = document.querySelector(".quiz-content");
	if (isTest) {
		res["isTestTab"] = true;
		res["questions"] = [];
		let questions = document.querySelectorAll(".question");
		for (let i=0; i<questions.length; i++) {
			let question = questions[i];
			let hint = question.querySelector(".hint");
			let type = Number(question.dataset.type);
			let isCorrect = question.classList.contains("correct");
			res["questions"][i] = {};
			res["questions"][i]["title"] = question.querySelector(".question-description p").textContent;
			res["questions"][i]["type"] = type;
			res["questions"][i]["isCorrect"] = isCorrect;
			res["questions"][i]["id"] = question.dataset.id;
			let answer;
			switch (type) {
				case RADIO_TYPE:
					let choosenLabel = question.querySelector("label.checked");
					answer = choosenLabel.querySelector("input").value;
					break;
				case TEXT_TYPE:
					let response = question.querySelector(".response input");
					answer = response.value;
					break;
				case CONNECTPAIRS_TYPE:
					answer = {};
					let pairs = question.querySelectorAll(".qt_connect_group");
					for (pair of pairs) {
						let items = pair.querySelectorAll(".qt_connect_item");
						answer[items[0].id] = items[1].id;
					}
					break;
				case CHECKS_TYPE:
					answer = [];
					let labels = question.querySelectorAll("label");
					for (let label of labels) {
						let box = label.querySelector("input[type='checkbox']");
						if (box.checked) {
							answer.push(box.value);
						}
					}
					break;
				case SELECT_TYPE:
					let select = question.querySelector("select");
					answer = select.querySelector("option[selected='selected'").value;
					break;
				case ORDER_TYPE:
					answer = [];
					let questionOrder = question.querySelector(".question-order");
					let items = questionOrder.querySelectorAll("div");
					for (let item of items) {
						answer.push(item.dataset.id);
					}
					break;
				default:
					console.log("Такой тип вопроса не учтен...\nВопрос: " + res["questions"][i]["title"] + "\nHint: "+hint.textContent);
					break;
			}
			res["questions"][i]["answer"] = answer;
		}
	}
	else {
		res["isTestTab"] = false;
	}
	sendResponse(res);
}

function solveTest(sendResponse, answerJSON) {
	var report = JSON.parse(answerJSON);
	var questions = document.querySelectorAll(".question")
	for (let question of questions) {
		let questionId = question.dataset.id;
		question.dataset.tryingAnswer = true;
		let currentQuestion;
		for (let reportQuestion of report["questions"]) {
			if (reportQuestion.id == questionId) {
				currentQuestion = reportQuestion;
				break;
			}
		}	
		switch (currentQuestion.type) {
			case RADIO_TYPE:
				let radios = question.querySelectorAll("input[type='radio']");
				for (let radio of radios) {
					if (radio.value == currentQuestion.answer) {
						radio.click();
						break;
					}
				}
				break;
			case TEXT_TYPE:
				let input = question.querySelector("input[type='text']");
				input.focus();
				input.value = currentQuestion.answer;
				break;
			case CONNECTPAIRS_TYPE:
				for (let fItem in currentQuestion.answer) {
					question.querySelector(".qt_connect_item[id='"+fItem+"']").click();
					question.querySelector(".qt_connect_item[id='"+currentQuestion.answer[fItem]+"']").click();
				} 
				break;
			case CHECKS_TYPE:
				let checks = question.querySelectorAll("input[type='checkbox']");
				for (let check of checks) {
					if (currentQuestion.answer.includes(check.value)) {
						check.click();
					}
				}
				break;
			default:
				console.log("Такой тип вопроса не учтен...");
				break;
		}	
	}
	sendResponse({});
}