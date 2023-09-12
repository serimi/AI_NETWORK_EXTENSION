// background.js

// 백그라운드 페이지가 로드될 때 실행되는 코드
chrome.runtime.onInstalled.addListener(({ reason, details }) => { // details 추가
  if (reason === 'install') {
    chrome.tabs.create({
      url: "input.html"
    });
  } else if (reason === 'update') { // details.reason 대신 reason 사용
    // 확장 프로그램이 업데이트될 때 실행될 코드
    console.log('Extension updated!');
  }
});

// 데이터 캐싱 및 저장 (올바른 key와 value 사용)
chrome.storage.local.set({ key: 'value' }, function() {
  console.log('데이터가 저장되었습니다.');
});

// 저장된 데이터 읽기 (올바른 key 사용)
chrome.storage.local.get('key', function(result) {
  console.log('저장된 데이터:', result.key);
});

// 컨텐트 스크립트에서 이벤트 트리거
document.dispatchEvent(new CustomEvent('customEventName', { detail: 'data' })); // data 추가

// 이전에 검색한 URL 결과를 저장하는 객체
const cachedResults = {};

// 이벤트 리스너 추가: content scripts에서 메시지를 기다림
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getData') {
    const url = request.url;

    // 캐시된 결과가 있는지 확인
    if (cachedResults.hasOwnProperty(url)) {
      sendResponse({ result: cachedResults[url] }); // 캐시된 결과 반환
    } else {
      const data = {
        url: url
      };

      // Django 웹 애플리케이션에 데이터 전송
      fetch('https://your-django-app-url.com/api/endpoint', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(result => {
          // 결과를 캐시에 저장
          cachedResults[url] = result;
          // 처리된 결과를 content scripts로 반환
          sendResponse({ result });
        })
        .catch(error => {
          console.error('데이터를 가져오는 중 오류 발생:', error);
        });
    }

    // 비동기 응답을 유지
    return true;
  }
});
