# Claude Code Instructions

## Cache Busting

`styles.css` 또는 `app.js` 파일을 수정할 때마다 `index.html`에서 해당 파일의 쿼리 파라미터(epoch millis)를 현재 시간으로 업데이트해야 합니다.

```html
<link href="styles.css?{epoch_millis}" rel="stylesheet">
<script src="app.js?{epoch_millis}"></script>
```
