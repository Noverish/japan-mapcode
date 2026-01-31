$(document).ready(function() {
    $('#extractBtn').click(function() {
        const url = $('#urlInput').val().trim();

        if (!url) {
            showError('URL을 입력해주세요.');
            return;
        }

        if (!isValidGoogleMapsUrl(url)) {
            showError('올바른 Google Maps 링크를 입력해주세요.');
            return;
        }

        hideError();
        hideResult();
        showLoading();

        // URL에 쿼리 파라미터 추가
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('url', url);
        history.replaceState(null, '', newUrl);

        const apiHost = location.hostname === 'localhost' ? 'local-timeline.hyunsub.kim' : 'timeline.hyunsub.kim';
        const key = new URLSearchParams(window.location.search).get('key');
        const requestBody = { url: url };
        if (key) {
            requestBody.key = key;
        }
        $.ajax({
            url: `https://${apiHost}/api/v1/japan-map-code`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestBody),
            timeout: 15000,
            success: function(response) {
                hideLoading();
                showResult(response.latitude, response.longitude, response.mapCode);
            },
            error: function(xhr) {
                hideLoading();
                if (xhr.status === 403) {
                    showError('이 사이트를 이용할 수 있는 권한이 없습니다.');
                } else if (xhr.status === 429) {
                    showError('너무 많이 요청했습니다. 잠시 후 다시 시도해주세요.');
                } else if (xhr.responseJSON && xhr.responseJSON.message) {
                    showError(xhr.responseJSON.message);
                } else {
                    showError('좌표 추출에 실패했습니다.');
                }
            }
        });
    });

    $('#urlInput').keypress(function(e) {
        if (e.which === 13) {
            $('#extractBtn').click();
        }
    });

    // 입력값 변경 시 X 버튼 표시/숨김
    $('#urlInput').on('input', function() {
        if ($(this).val().trim()) {
            $('#clearBtn').removeClass('d-none');
        } else {
            $('#clearBtn').addClass('d-none');
        }
    });

    // X 버튼 클릭 시 입력 초기화
    $('#clearBtn').click(function() {
        $('#urlInput').val('').focus();
        $(this).addClass('d-none');
        hideError();
        hideResult();
    });

    $(document).on('click', '.copy-btn', function() {
        const target = $(this).data('target');
        const text = $('#' + target).text();

        navigator.clipboard.writeText(text).then(() => {
            const originalText = $(this).text();
            $(this).text('완료!');
            setTimeout(() => {
                $(this).text(originalText);
            }, 1000);
        });
    });

    // 쿼리 파라미터에서 url 확인 (이벤트 핸들러 등록 후 실행)
    const urlParams = new URLSearchParams(window.location.search);
    const urlFromQuery = urlParams.get('url');

    if (urlFromQuery) {
        $('#urlInput').val(urlFromQuery).trigger('input');
        $('#extractBtn').click();
    }
});

function showResult(lat, lng, mapCode) {
    $('#fullCoord').text(lat + ', ' + lng);
    $('#mapCode').text(mapCode || '-');

    const embedUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sko!2skr!4v1234567890`;
    $('#mapPreview').attr('src', embedUrl);

    $('#resultBox').removeClass('d-none');
}

function hideResult() {
    $('#resultBox').addClass('d-none');
}

function showError(message) {
    $('#errorBox').text(message).removeClass('d-none');
}

function hideError() {
    $('#errorBox').addClass('d-none');
}

function showLoading() {
    $('#loading').removeClass('d-none');
}

function hideLoading() {
    $('#loading').addClass('d-none');
}

function isValidGoogleMapsUrl(url) {
    const patterns = [
        /^https?:\/\/(www\.)?google\.(com|co\.[a-z]{2,}|[a-z]{2,})\/maps/i,
        /^https?:\/\/maps\.app\.goo\.gl\//i,
        /^https?:\/\/goo\.gl\/maps\//i,
        /^https?:\/\/maps\.google\.(com|co\.[a-z]{2,}|[a-z]{2,})\//i
    ];
    return patterns.some(pattern => pattern.test(url));
}
