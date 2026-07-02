> 📄 이 문서는 원문(docs/)의 한국어 번역입니다. 코드·명령·경로·링크는 원문 그대로 유지했습니다.

# 아키텍처 개요

Paca는 명확하게 분리된 소수의 런타임 표면을 갖춘 단일 오픈소스 모노레포입니다.

## 런타임 영역

- `apps/web` — React, TanStack Start, shadcn/ui로 구축된 사용자 대상 애플리케이션.
- `apps/mcp` — `@paca-ai/paca-mcp` MCP 서버; AI 에이전트를 Paca 데이터 계층에 연결합니다.
- `apps/e2e` — Playwright로 구축된 종단 간(end-to-end) 테스트 스위트; 배포되는 런타임은 아니지만 전체 스택을 검증하는 외부 검증기입니다.
- `services/api` — Go, Chi, sqlx로 구축된 주요 애플리케이션 백엔드.
- `services/realtime` — Node.js와 Socket.IO로 구축된 실시간 전송 서비스.
- `services/ai-agent` — Python, FastAPI, OpenHands SDK로 구축된 AI 에이전트 오케스트레이션 런타임.

## 플랫폼 의존성

- PostgreSQL은 핵심 트랜잭션 제품 데이터를 저장합니다. 전체 스키마는 [database-schema.md](database-schema.md)를 참고하세요.
- Valkey는 백엔드 런타임 간의 캐시, 단기 조정 상태, 비동기 이벤트 스트림을 담당합니다.

## 상호작용 모델

- `apps/web`는 요청-응답 워크플로를 위해 `services/api`가 노출하는 HTTP API를 사용합니다.
- `apps/web`는 실시간 업데이트를 위해 Socket.IO를 통해 `services/realtime`에 연결합니다.
- `apps/mcp`는 API 키를 사용하여 HTTP로 `services/api`를 호출합니다; 플러그인 도구는 `/api/v1/plugins/{pluginId}/…`로 라우팅됩니다.
- `apps/e2e`는 실행 중인 전체 스택을 대상으로 실제 브라우저를 구동하며 여러 런타임 표면에 걸친 횡단 관심사 플로를 검증합니다.
- `services/api`는 제품 상태에 대한 시스템 오브 레코드(system of record)로 남으며, 실시간과 관련된 도메인 이벤트를 Valkey Stream에 게시합니다.
- `services/realtime`는 `services/api`가 보낸 Valkey Stream 메시지를 소비하여, 연결된 Socket.IO 룸과 사용자에게 클라이언트에 안전한 이벤트를 팬아웃합니다.
- `services/ai-agent`는 Valkey Stream에서 에이전트 트리거 이벤트를 읽고, OpenHands SDK를 통해 각 대화마다 Docker 컨테이너를 생성하며, 대화 이벤트를 다시 Valkey에 게시합니다.

## 아키텍처 의도

- 서비스 경계를 명시적으로 유지합니다.
- 상태를 변경하는 비즈니스 로직은 실시간 엣지 서비스가 아니라 `services/api`에 둡니다.
- 이벤트 생성을 Socket.IO 전송과 분리하기 위해 Valkey Streams를 사용합니다.
- 재사용이 입증되기 전에 공유 계층을 추가하지 않습니다.
- 제품 대상 문서와 구현 대상 문서를 분리합니다.
- 저장소를 루트에서 공개적으로 읽기 쉽게 유지합니다.

공유되는 스프린트, 백로그, 타임라인 뷰 모델에 대해서는 [interaction-views.md](interaction-views.md)를 참고하세요.
