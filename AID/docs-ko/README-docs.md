> 📄 이 문서는 원문(docs/)의 한국어 번역입니다. 코드·명령·경로·링크는 원문 그대로 유지했습니다.

# 문서

이 디렉터리는 Paca의 주요 문서 홈입니다.

## 섹션

- [architecture/overview.md](architecture/overview.md): 시스템에 대한 상위 수준의 조망.
- [architecture/repository-structure.md](architecture/repository-structure.md): 계획된 저장소 레이아웃.
- [architecture/service-boundaries.md](architecture/service-boundaries.md): 각 서비스의 책임.
- [architecture/database-schema.md](architecture/database-schema.md): 데이터베이스 스키마(DBML)와 인터랙티브 다이어그램.
- [architecture/interaction-views.md](architecture/interaction-views.md): 스프린트, 백로그, 타임라인 뷰가 하나의 모델과 하나의 task-list API를 공유하는 방식.
- [guides/getting-started.md](guides/getting-started.md): 신규 기여자가 가장 먼저 읽어야 할 내용.
- [guides/mcp-server-setup.md](guides/mcp-server-setup.md): MCP 서버를 통해 AI 에이전트(Claude, 커스텀 에이전트)를 Paca와 통합하기 위한 설정 가이드.
- [guides/local-development.md](guides/local-development.md): 로컬 개발의 의도와 향후 설정 방향.
- [guides/design-system.md](guides/design-system.md): 웹 UI를 위한 비주얼 언어, 컴포넌트 패턴, 인터랙션 규칙.
- [api/README.md](api/README.md): API 및 이벤트 계약 문서 색인.
- [api/http-design.md](api/http-design.md): HTTP API 경로, 엔드포인트 책임, 향후 리소스 설계.
- [deployment/README.md](deployment/README.md): 배포 및 환경 문서 색인.
- [product/overview.md](product/overview.md): 제품 개념과 워크플로 방향.
- [plugins/overview.md](plugins/overview.md): 플러그인 시스템 — 아키텍처, 확장 지점, 보안 모델.
- [plugins/frontend-plugin-system.md](plugins/frontend-plugin-system.md): 모듈 페더레이션, 확장 지점 레지스트리, 프런트엔드 SDK API.
- [plugins/backend-plugin-system.md](plugins/backend-plugin-system.md): WASM 런타임, 호스트 함수 브리지, 라우트 등록.
- [plugins/marketplace.md](plugins/marketplace.md): 공개 GitHub 마켓플레이스 카탈로그 스키마와 설치 플로.
- [plugins/sdk-reference.md](plugins/sdk-reference.md): `@paca-ai/plugin-sdk-react`(TypeScript) 및 `github.com/Paca-AI/plugin-sdk`(Go)의 전체 API 레퍼런스.
- [plugins/developer-guide.md](plugins/developer-guide.md): Paca 플러그인을 구축하고 게시하는 단계별 가이드.

## 원칙

- 문서는 짧고 탐색하기 쉽게 유지합니다.
- 구현 세부 사항보다 결정을 먼저 문서화합니다.
- 프레임워크 수준의 잦은 변경보다 안정적인 개념을 우선합니다.
- 루트 README는 제품 중심으로 유지하고, 기술적 세부 사항은 이 디렉터리를 사용합니다.
