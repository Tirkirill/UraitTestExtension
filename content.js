const RADIO_TYPE = 1;
const CONNECTPAIRS_TYPE = 7;
const TEXT_TYPE = 6;
const TEXT_TYPE2 = 3;
const ORDER_TYPE = 9;
const CHECKS_TYPE = 2;
const SELECT_TYPE = 8;
//DRAG_TYPE = распределение по группам
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
				solveTest(sendResponse, req.answerJSON, req.safeRegimes);
				break;
			case "append":
				appendTest(sendResponse, req.answerJSON);
				break;
		}
	});
};

function createFile(sendResponse) {
	let res = {};
	let isTest = document.querySelector(".quiz-content");
	if (isTest) {
		res = getTestRes();
	}
	else {
		res["OK"] = false;
		res["errorCode"] = 0;
	}
	sendResponse(res);
}

function solveTest(sendResponse, answerJSON, safeRegimes) {
	var report = JSON.parse(answerJSON);
	var questions = document.querySelectorAll(".question");
	for (let question of questions) {
		let questionId = question.dataset.id;
		let currentQuestion;
		currentQuestion = report["questions"].find((reportQuestion)=>reportQuestion.id == questionId)	
		let type = currentQuestion.type;
		let answer;
		if (currentQuestion.correctAnswer) {
			answer = currentQuestion.correctAnswer;
			setInputs(currentQuestion.type, answer, true, question, safeRegimes);
		}
		else {
			for (let incorrect_answer of currentQuestion.incorrectAnswers) {
				switch (currentQuestion.type) {
					case RADIO_TYPE:
					case TEXT_TYPE:
					case TEXT_TYPE2:
					case SELECT_TYPE:
						setInputs(type, incorrect_answer, false, question, safeRegimes);
						break;
				}
			}
		}
	}
	sendResponse({"OK":true});
}

function format(str, params) {
	return str.replace(/\{(\w+)\}/g, function(a,b) { return params[b]});
}

function setInputs(type, answer, isCorrect, question, safeRegimes) {
	let template;
	let style;
	let hint;
	if (isCorrect) {
		template = RIGHT_ANSWER_TEMPLATE;
		style = RIGHT_ANSWER_STYLE;
	}
	else {
		template = WRONG_ANSWER_TEMPLATE;
		style = WRONG_ANSWER_STYLE;	
	}
	switch (type) {
		case RADIO_TYPE:
			let radioLabels = question.querySelectorAll("label");
			for (let label of radioLabels) {
				let radio = label.children[0];
				if (radio.value == answer) {
					label.style.cssText = style;
					console.log(safeRegimes);
					console.log(String(type));
					console.log(safeRegimes.indexOf(String(type)));
					if (isCorrect && safeRegimes.indexOf(String(type))==-1) radio.click();
					break;
				}
			}
			break;
		case TEXT_TYPE:
		case TEXT_TYPE2:
			hint = question.querySelector(".hint");
			hint.innerHTML += format(template, [" "+answer+"<br>"]);
			break;
		case CONNECTPAIRS_TYPE:
			let i = 1;
			for (let fItemId in answer) {
				let fItem = question.querySelector(".qt_connect_item[id='"+fItemId+"']");
				let sItem = question.querySelector(".qt_connect_item[id='"+answer[fItemId]+"']");
				fItem.innerHTML += format(template, [i-1]);
				sItem.innerHTML += format(template, [i-1]);
				if (isCorrect && safeRegimes.indexOf(String(type))==-1) {
					setTimeout(()=> {
						fItem.click();
					}, 500*i)
					setTimeout(()=> {
						sItem.click();
					}, 500*i)
					i++;
				}
			} 
			break;
		case CHECKS_TYPE:
			let checkLabels = question.querySelectorAll("label");
			let j = 1;
			for (let label of checkLabels) {
				let check = label.children[0];
				if (answer.includes(check.value)) {
					if (isCorrect && safeRegimes.indexOf(String(type))==-1) {
						if (!check.checked)  {
							setTimeout(()=>check.click(), j*500)
							j++;
						};
					}
					label.style.cssText = style;
				}
			}
			break;
		case ORDER_TYPE:
			let sorts =  question.querySelectorAll(".ui-sortable-handle");
			for (let sort of sorts) {
				let index = answer.indexOf(sort.dataset.id);
				if (index != -1) {
					sort.innerHTML += format(template, [index]);;
				}
			}
			break;
		case DRAG_TYPE:
			for (let itemId in answer) {
				let groupId = answer[itemId];
				let groupTitle = document.getElementById(groupId).querySelector(".question_answer_title").textContent;
				document.getElementById(itemId).innerHTML += format(template, [groupTitle]);
			}
			break;
		case SELECT_TYPE:
			let answerOption = question.querySelector("option[value='"+answer+"']");
			hint = question.querySelector(".hint");
			hint.innerHTML += format(template, [" "+answerOption.textContent + "<br>"]);
			break;
		default:
			console.log("Такой тип вопроса не учтен...");
			break;
	}	
}

function getTestRes() {
	res = {};
	res["OK"] = true;
	res["questions"] = [];
	let questions = document.querySelectorAll(".question");
	for (let i=0; i<questions.length; i++) {
		let question = questions[i];

		let hint = question.querySelector(".hint");
		let type = Number(question.dataset.type);
		let isCorrect = question.classList.contains("correct");
		res["questions"][i] = {};
		res["questions"][i]["incorrectAnswers"] = [];
		res["questions"][i]["title"] = question.querySelector(".question-description p").textContent;
		res["questions"][i]["type"] = type;
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
			case DRAG_TYPE:
				answer = {};
				let groups = question.querySelectorAll(".question_answer");
				for (let group of groups) {
					let groupId = group.id;
					let items = group.querySelectorAll(".question_type_5");	
					for (let item of items) {
						let itemId = item.id;
						answer[itemId] = groupId;
					}
				}
				break;
			default:
				console.log("Такой тип вопроса не учтен...\nВопрос: " + res["questions"][i]["title"] + "\nHint: "+hint.textContent);
				break;
		}
		if (isCorrect) res["questions"][i]["correctAnswer"] = answer;
		else {
			res["questions"][i]["incorrectAnswers"] = [answer];
		}
	}
	res["fileTitle"] = document.querySelectorAll(".quiz-content a")[1].textContent;
	return res;
}

//Порядок важен для ORDER_TYPE
//Для CONNECTPAIRS_TYPE и DRAG_TYPE важны сочетания
function appendTest(sendResponse, answerJSON) {
	var oldReport = JSON.parse(answerJSON);
	var oldReportQuestions = oldReport.questions; 
	var newReport = getTestRes().questions;
	for (let oldInfo of oldReportQuestions) {
		if (oldInfo.correctAnswer) continue;
		let id = oldInfo.id;
		let newInfo = newReport.find(question => question.id == id);
		if (newInfo.correctAnswer) oldInfo.correctAnswer = newInfo.correctAnswer;
		else {
			let newIncorrect = newInfo.incorrectAnswers[0];
			let oldIncorrects = oldInfo.incorrectAnswers;
			switch (newInfo.type) {
				case TEXT_TYPE:
				case TEXT_TYPE2:
				case SELECT_TYPE:
				case RADIO_TYPE:
					if (oldIncorrects.indexOf(newIncorrect)==-1) oldIncorrects.push(newIncorrect)
					break;
				//В разработке
				// case ORDER_TYPE:
				// 	for (let i=0; i<oldIncorrects.length; i++) {
				// 		let oldIncorrect = oldIncorrects[i];
				// 		let isSame = true;
				// 		for (let j=0; j<oldIncorrect.length;j++) {
				// 			if (oldIncorrect[j]!=newIncorrect[j]) {
				// 				isSame = false;
				// 				break;
				// 			}
				// 		}
				// 		if (isSame) break;
				// 	}
				// 	break;
			}
		}
	}
	sendResponse(oldReport);
}