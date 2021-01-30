window.onload = function() {
    chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
        var res = {};
		let isTest = document.querySelector(".quiz-content");
		if (isTest) {
            res["isTestTab"] = true;
			questions = document.querySelectorAll(".question");
			for (let question of questions) {
				console.log(question.querySelector(".question-description p").innerHTML);
			}
		}
		else {
            res["isTestTab"] = false;
		}
        sendResponse(res);
    });
};