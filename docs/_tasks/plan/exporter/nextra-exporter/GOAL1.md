# Nextra Export Implementation Goals (GOAL1.md)

이 문서는 Nextra Export 기능 개발을 통해 달성하고자 하는 목표와 성공 지표를 정의합니다.

## 🎯 핵심 목표 (Core Objectives)
1.  **Seamless Transition**: Mark Explorer에서 작성한 마크다운 문서를 별도의 수정 없이 즉시 Nextra 사이트로 발행할 수 있는 환경 제공.
2.  **Visual Excellence**: 개발 지식이 없는 사용자도 테마 프리셋을 통해 세련된 문서 사이트를 구축할 수 있도록 지원.
3.  **Technical Reliability**: 복잡한 계층 구조와 자산(이미지) 링크를 Nextra 표준에 맞춰 완벽하게 자동 치환하여 깨짐 없는 배포 보장.

## ✅ 성공 지표 (Success Metrics)
*   **무결성 (Integrity)**: 내보낸 ZIP 파일을 압축 해제하고 `npm install && npm run dev` 실행 시 에러 없이 즉시 구동되어야 함.
*   **자산 링크 (Asset Links)**: 모든 마크다운 내의 로컬 이미지가 `./img/...` 경로로 올바르게 치환되고 화면에 표시되어야 함.
*   **사이드바 동기화**: Mark Explorer에서 설정한 파일 정렬 순서가 Nextra 사이드바(`_meta.json`)에 100% 동일하게 반영되어야 함.
*   **사용자 경험 (UX)**: 설정 마법사를 통해 1분 이내에 내보내기 준비를 완료할 수 있어야 함.

## 🚀 기대 효과
*   개인 지식 베이스를 문서 사이트로 즉시 퍼블리싱하는 워크플로우 단축.
*   Nextra의 강력한 검색 기능과 SEO 최적화 혜택을 Mark Explorer 사용자에게 제공.
*   향후 Phase 2, 3(자동 배포 및 로컬 서버 실행)를 위한 견고한 데이터 변환 레이어 확보.
