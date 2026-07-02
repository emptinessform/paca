> 📄 이 문서는 원문(docs/)의 한국어 번역입니다. 코드·명령·경로·링크는 원문 그대로 유지했습니다.

# API 문서

이 섹션은 Paca의 외부 계약을 설명합니다.

## 목차

- [http-design.md](http-design.md): REST API 설계, 경로 규칙, 구현된 엔드포인트, 계획된 리소스 엔드포인트.

## 계획된 범위

- `services/api`가 노출하는 HTTP API.
- `services/realtime`가 노출하는 Socket.IO 연결 및 이벤트 계약.
- `services/ai-agent`가 노출하는 AI 관련 엔드포인트.
- `services/api`에서 `services/realtime`로 전달되는 Valkey Stream 메시지를 포함해, 비동기 워크플로와 관련된 이벤트 경계.
- 안정화된 이후의 서비스 간 계약 규칙.

이제 HTTP API는 [http-design.md](http-design.md)에 초기 구체적 설계를 갖추었습니다. 실시간 및 AI 에이전트 계약은 해당 서비스들이 안정적인 표면을 노출한 이후에 따라와야 합니다.
