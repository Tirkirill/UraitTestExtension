const RADIO_TYPE = 1;
const CONNECTPAIRS_TYPE = 7;
const TEXT_TYPE = 6;
const TEXT_TYPE2 = 3;
const ORDER_TYPE = 9;
const CHECKS_TYPE = 2;
const SELECT_TYPE = 8;
const DRAG_TYPE = 5;

const RIGHT_ANSWER_STYLE = 'color:green; font-size:16px; font-weight: bold';
const RIGHT_ANSWER_TEMPLATE = "<span style= 'color:green; font-size:16px; font-weight: bold'>{0}</span>";
const WRONG_ANSWER_STYLE = 'color:red; font-size:16px; font-weight: bold';
const WRONG_ANSWER_TEMPLATE = "<span style= 'color:red; font-size:16px; font-weight: bold'>{0}</span>";
const NEUTRAL_ANSWER_STYLE = 'color:darkgray; font-size:16px; font-weight: bold';
const NEUTRAL_ANSWER_TEMPLATE = "<span style= 'color:darkgray; font-size:16px; font-weight: bold'>{0}</span>";


window.onload = function() {
    chrome.runtime.onMessage.addListener(function(req, _, sendResponse) {
		switch(req.action) {
			case "create":
				createFile(sendResponse);
				break;
			case "solve":
				solveTest(sendResponse, req.answerJSON);
				break;
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
				case TEXT_TYPE2:
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
	sendResponse({...res, fileTitle: document.querySelectorAll(".quiz-content a")[1].textContent});
}

function solveTest(sendResponse, answerJSON) {
	var report = JSON.parse(answerJSON);
	var questions = document.querySelectorAll(".question");
	for (let question of questions) {
		let questionId = question.dataset.id;
		let currentQuestion;
		for (let reportQuestion of report["questions"]) {
			if (reportQuestion.id == questionId) {
				currentQuestion = reportQuestion;
				break;
			}
		}	
		let template;
		let style;
		if (currentQuestion.isCorrect) {
			template = RIGHT_ANSWER_TEMPLATE;
			style = RIGHT_ANSWER_STYLE;
		}
		else {
			switch (currentQuestion.type) {
				case RADIO_TYPE:
				case TEXT_TYPE:
				case TEXT_TYPE2:
				case SELECT_TYPE:
					template = WRONG_ANSWER_TEMPLATE;
					style = WRONG_ANSWER_STYLE;
					break;
				default:
					template = NEUTRAL_ANSWER_TEMPLATE;
					style = NEUTRAL_ANSWER_STYLE;
					break;
			}
		}
		switch (currentQuestion.type) {
			case RADIO_TYPE:
				let radioLabels = question.querySelectorAll("label");
				for (let label of radioLabels) {
					let radio = label.children[0];
					if (radio.value == currentQuestion.answer) {
						label.style.cssText = style;
						radio.click();
						break;
					}
				}
				break;
			case TEXT_TYPE:
			case TEXT_TYPE2:
				let hint = question.querySelector(".hint");
				hint.innerHTML += format(template, [currentQuestion.answer]);
				break;
			case CONNECTPAIRS_TYPE:
				let i = 1;
				for (let fItemId in currentQuestion.answer) {
					let fItem = question.querySelector(".qt_connect_item[id='"+fItemId+"']");
					let sItem = question.querySelector(".qt_connect_item[id='"+currentQuestion.answer[fItemId]+"']");
					setTimeout(()=> {
						fItem.click();
					}, 250*i)
					setTimeout(()=> {
						sItem.click();
					}, 250*i)
					fItem.innerHTML += format(template, [i-1]);
					sItem.innerHTML += format(template, [i-1]);
					i++;
				} 
				break;
			case CHECKS_TYPE:
				let checkLabels = question.querySelectorAll("label");
				let j = 1;
				for (let label of checkLabels) {
					let check = label.children[0];
					if (currentQuestion.answer.includes(check.value)) {
						if (!check.checked)  {
							setTimeout(()=>check.click(), j*250)
							j++;
						};
						label.style.cssText = style;
					}
				}
				break;
			case ORDER_TYPE:
				currentQuestion.answer.indexOf;
				let sorts =  question.querySelectorAll(".ui-sortable-handle");
				for (let sort of sorts) {
					let index = currentQuestion.answer.indexOf(sort.dataset.id);
					if (index != -1) {
						sort.innerHTML += format(template, [index]);;
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

function format(str, params) {
	return str.replace(/\{(\w+)\}/g, function(a,b) { return params[b]});
}