# Test Case: YouTube Playlist Exporter - Batch Loading & Auto-Looping

본 문서는 YouTube Playlist Exporter의 **배치 단위 자동 증분 로딩(Incremental Batch Loading)** 기능에 대한 테스트 케이스를 명세합니다.

## 1. 개요
기존의 단일 요청 방식에서 벗어나, 사용자가 설정한 `BATCH SIZE` 단위로 API를 호출하고, 모든 아이템을 가져올 때까지 자동으로 루프를 돌며 데이터를 축적하는 기능을 검증합니다.

## 2. 테스트 환경
- **플랫폼**: Web (Desktop/Mobile)
- **도구**: Playwright (E2E), Manual Testing
- **준비 사항**: YouTube API Key 설정 (Mock 데이터 활용 가능)

## 3. 테스트 케이스 목록

| ID | 테스트 시나리오 | 기대 결과 (Expected Result) | 우선순위 |
|:---|:---|:---|:---:|
| TC-YT-01 | **배치 사이즈 UI 확인** | 'ITEM LIMIT' 문구가 'BATCH SIZE (MAX 50)'로 변경되어 있어야 함. | High |
| TC-YT-02 | **자동 증분 로딩 검증** | URL 입력 시 지정된 BATCH SIZE(예: 20) 단위로 API를 호출하고, 끝날 때까지 자동으로 다음 데이터를 불러와야 함. | Critical |
| TC-YT-03 | **실시간 진행률 표시** | Live Preview 헤더에 `(현재 로드 수 / 전체 아이템 수)` 형식이 실시간으로 업데이트되어야 함. (예: 20 / 100 -> 40 / 100) | Medium |
| TC-YT-04 | **Batch Size 변경 적용** | Batch Size를 50으로 변경 후 URL 입력 시, 한 번에 50개씩 데이터를 가져와야 함. | High |
| TC-YT-05 | **에러 핸들링 (Metadata)** | 잘못된 URL 입력 시 `metadata is not defined` 등의 ReferenceError 없이 정상적으로 에러 메시지가 출력되어야 함. | Critical |
| TC-YT-06 | **중복 호출 방지 (Debounce)** | URL 입력 중 실시간으로 API가 난사되지 않도록 적절한 디바운스(800ms)가 작동해야 함. | Medium |

## 4. Playwright 자동화 시나리오

```typescript
// 테스트 코드 핵심 로직 예시
test('should loop and append items automatically in batches', async ({ page }) => {
  const urlInput = page.getByTestId('playlist-url-input');
  const batchInput = page.getByTestId('item-limit-input');
  
  // 1. 배치 사이즈 설정
  await batchInput.fill('10');
  
  // 2. URL 입력
  await urlInput.fill('https://www.youtube.com/playlist?list=VALID_ID');
  
  // 3. 실시간 업데이트 확인 (첫 10개)
  await expect(page.locator('text=Live Preview (10')).toBeVisible({ timeout: 5000 });
  
  // 4. 자동 루프 대기 (다음 10개)
  await expect(page.locator('text=Live Preview (20')).toBeVisible({ timeout: 5000 });
});
```

---
**작성일**: 2026-05-04
**상태**: ✅ 작성 완료 (수정 내용 반영됨)
