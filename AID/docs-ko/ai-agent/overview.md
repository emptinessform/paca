> 📄 이 문서는 원문(docs/)의 한국어 번역입니다. 코드·명령·경로·링크는 원문 그대로 유지했습니다.

# AI 에이전트 기능 — 개요

Paca AI 에이전트는 [OpenHands Software Agent SDK](https://docs.openhands.dev/sdk)로 구동되는 일급(first-class) 프로젝트 멤버입니다. 각 에이전트는 격리된 Docker 컨테이너에서 실행되며, 태스크 배정, 댓글 @멘션, 또는 직접 채팅으로 트리거될 수 있습니다. 에이전트는 사람 멤버와 완전히 동일하게 프로젝트에 참여합니다 — 멤버 목록에 표시되고, 태스크를 배정받을 수 있으며, 댓글과 채팅에서 메시지를 주고받습니다.

## 목차

- [Concepts](#concepts)
- [Architecture](#architecture)
- [Trigger Model](#trigger-model)
- [Conversation Lifecycle](#conversation-lifecycle)
- [Repository Access & PR Creation](#repository-access--pr-creation)
- [Default Agent Types](#default-agent-types)
- [Customization](#customization)
- [Related Documents](#related-documents)

---

## Concepts

| 용어 | 의미 |
|---|---|
| **Agent** | 역할, LLM 구성, 스킬, MCP 서버, 시스템 프롬프트를 갖춘 프로젝트 범위의 AI 개체입니다. |
| **Agent Member** | `member_type = 'agent'`이며 `agents` 테이블을 참조하는 `project_members` 행입니다. 에이전트는 모든 제품 화면에서 사람 멤버와 동일하게 취급됩니다. |
| **Agent Type** | LLM, 스킬, 시스템 프롬프트를 미리 채워 넣는 템플릿입니다. 내장 타입: PO Assistant, Business Analyst, Developer, Manual Tester. 사용자는 커스텀 타입을 만들 수 있습니다. |
| **Agent Conversation** | 단일 OpenHands SDK `Conversation` 세션으로, 각 트리거 이벤트마다 전용 Docker 컨테이너에서 생성됩니다. |
| **Conversation Event** | 대화 내의 원자적 액션/관찰(LLM 메시지, bash 명령, 파일 편집 등)입니다. 이력 및 실시간 모니터링을 위해 데이터베이스에 저장됩니다. |
| **Trigger** | 에이전트 대화를 생성하는 이벤트입니다: 태스크 배정, 댓글 @멘션, 또는 직접 채팅 메시지. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  apps/web                                                                   │
│  • Agent management UI (project settings)                                   │
│  • Real-time conversation monitoring (stop / continue / history)            │
│  • @mention autocomplete for agents in comments                             │
│  • Direct chat panel with agents                                            │
└─────────────────┬───────────────────────────────────────────────────────────┘
                  │ HTTP / Socket.IO
                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  services/api  (Go + Gin)                                                   │
│  • Agent CRUD (domain: agent)                                               │
│  • Publishing agent-trigger events → Valkey Stream "paca:agent:triggers"   │
│  • REST endpoints for conversation history & control                        │
│  • Writing conversation summaries / replies back to tasks/comments          │
└──────────┬───────────────────────────────┬──────────────────────────────────┘
           │  Valkey Stream (triggers)      │  Valkey Stream (events back)
           ▼                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  services/ai-agent  (Python + FastAPI + OpenHands SDK)                      │
│  • Stream consumer: reads "paca:agent:triggers"                             │
│  • Spawns one DockerWorkspace per conversation                              │
│  • Runs OpenHands Conversation inside the container                         │
│  • Publishes conversation events → Valkey Stream "paca:agent:events"        │
│  • REST endpoints: pause, resume, stop, history                             │
└──────────────────────────────────────────────────────────────────────────────┘
                  │
                  │  Docker socket (spawn / manage containers)
                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Agent Docker Containers  (ghcr.io/openhands/agent-server:latest-python)    │
│  • One container per active conversation                                    │
│  • Completely isolated from other containers                                │
│  • Workspace cloned from repo plugin (credentials injected as secrets)     │
│  • Destroyed when conversation finishes / is stopped                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 서비스 책임

| 서비스 | 책임 |
|---|---|
| `services/api` | 에이전트 구성을 소유하고, 에이전트 호출을 트리거하며, 대화 요약과 응답을 저장하고, 제어 API를 노출합니다. |
| `services/ai-agent` | OpenHands SDK를 통해 에이전트 대화를 실행하고, Docker 컨테이너 라이프사이클을 관리하며, 이벤트를 다시 스트리밍합니다. |
| `services/realtime` | Socket.IO를 통해 실시간 대화 이벤트를 웹 클라이언트에 전달합니다(기존과 동일한 Valkey→Socket.IO 팬아웃). |
| Docker host | 컨테이너 격리를 제공합니다. 에이전트 컨테이너는 기본적으로 내부 네트워크의 다른 Paca 서비스 컨테이너에 접근할 수 없습니다. |

---

## Trigger Model

### 1. 태스크 배정

태스크의 `assignee_id`가 `member_type = 'agent'`인 `project_members` 행을 가리키면, API는 다음을 포함하는 `agent.task.assigned` 이벤트를 Valkey Stream에 발행합니다.

```json
{
  "trigger_type": "task_assigned",
  "agent_id": "<uuid>",
  "project_id": "<uuid>",
  "task_id": "<uuid>",
  "task_title": "...",
  "task_description": "...",
  "actor_member_id": "<uuid>"
}
```

에이전트 서비스는 이를 가져와 대화를 시작하고, 에이전트에게 해당 태스크를 작업하도록 지시합니다. 완료되면 에이전트는 태스크에 요약 댓글을 게시하고 선택적으로 PR을 생성합니다.

### 2. 댓글 @멘션

댓글 본문에 `@<agent-handle>`이 포함되면, API는 `agent.comment.mention` 이벤트를 발행합니다.

```json
{
  "trigger_type": "comment_mention",
  "agent_id": "<uuid>",
  "project_id": "<uuid>",
  "task_id": "<uuid>",
  "comment_id": "<uuid>",
  "comment_body": "...",
  "actor_member_id": "<uuid>"
}
```

에이전트는 댓글 스레드에서 직접 응답합니다.

### 3. 직접 채팅

전용 채팅 API를 통해 사용자는 에이전트 멤버에게 메시지를 보낼 수 있습니다. 내부적으로 이는 `agent.chat.message` 이벤트를 발행하고, 사용자별·에이전트별로 지속적인 대화를 열거나(또는 재개) 합니다.

```json
{
  "trigger_type": "chat_message",
  "agent_id": "<uuid>",
  "project_id": "<uuid>",
  "chat_session_id": "<uuid>",
  "message": "...",
  "actor_member_id": "<uuid>"
}
```

---

## Conversation Lifecycle

```
Trigger event published
        │
        ▼
ai-agent service dequeues event
        │
        ▼
Resolve agent config (LLM, skills, MCP servers, system prompt)
        │
        ▼
Clone repository (if coding task) via repository plugin adapter
  - fetch clone URL + temporary token from plugin
  - inject credentials as OpenHands SecretSource (never logged)
        │
        ▼
Spawn DockerWorkspace (OpenHands agent-server image)
        │
        ▼
Create OpenHands Conversation with:
  - LLM from agent config
  - Skills from agent config
  - MCP servers from agent config
  - System prompt from agent config
  - Conversation ID stored in DB
  - Persistence dir mounted into container
  - Event callback → publish to Valkey "paca:agent:events"
        │
        ├─── User sends "pause" → conversation.pause()
        ├─── User sends "resume" → conversation.run()
        ├─── User sends "stop" → conversation.close(), container destroyed
        │
        ▼
Conversation finishes (agent sends finish action)
        │
        ▼
Persist summary + outputs
  - Post reply comment / chat message via API
  - Create PR if coding task (via repo plugin)
        │
        ▼
Container destroyed, conversation state archived
```

---

## Repository Access & PR Creation

에이전트는 VCS 자격 증명을 직접 볼 수 없으면서도 코드를 읽고 쓸 수 있어야 합니다.

### 클론 흐름

1. 트리거에 코딩 태스크가 포함되면, `services/ai-agent`는 프로젝트 컨텍스트와 함께 **저장소 플러그인 어댑터** 엔드포인트(예: GitHub 플러그인)를 호출합니다.
2. 플러그인은 **수명이 짧은 범위 제한 토큰**(예: 저장소에 대한 읽기/쓰기 권한을 가지고 10분간 유효한 GitHub 설치 토큰)과 HTTPS 클론 URL을 반환합니다.
3. 이 토큰은 요청 시 새 토큰을 가져오는 `SecretSource`로서 `conversation.update_secrets()`를 통해 OpenHands `Conversation`에 주입됩니다 — 토큰 값은 어떤 로그나 에이전트 출력에도 나타나지 않습니다.
4. 에이전트의 첫 번째 도구 호출이 저장소를 클론합니다: `git clone https://x-access-token:$GIT_TOKEN@github.com/org/repo.git`.
5. 대화가 종료되면 워크스페이스가 파괴되고 토큰이 자동으로 만료됩니다.

### PR 생성 흐름

1. 에이전트가 코딩 작업을 완료하고 완료 메시지에서 준비 완료를 알립니다.
2. `services/ai-agent`는 에이전트가 생성한 브랜치 이름과 설명을 사용하여 저장소 플러그인 어댑터의 **PR 생성 엔드포인트**를 호출합니다.
3. 플러그인이 PR을 생성하고 PR URL을 반환합니다.
4. 에이전트 서비스는 Paca 태스크에 PR URL을 댓글로 게시합니다.

이 설계가 의미하는 바는 다음과 같습니다.
- 에이전트는 자격 증명을 절대 저장하지 않습니다.
- 자격 증명은 컨테이너 로그에서 읽을 수 없습니다(`SecretSource`에 의해 마스킹됨).
- 플러그인이 VCS 인증에 대한 단일 정보 출처(single source of truth)로 유지됩니다.

---

## Default Agent Types

| 타입 | 역할 | 기본 LLM | 사전 로드된 스킬 |
|---|---|---|---|
| **PO Assistant** | 프로덕트 오너 — 백로그 정리, 인수 조건, 우선순위 지정 | `anthropic/claude-sonnet-4-6` | Agile PO 가이드라인이 포함된 `po-assistant` 스킬 |
| **Business Analyst** | 요구사항 분석, 사용자 스토리 작성, 갭 분석 | `anthropic/claude-sonnet-4-6` | `ba-assistant` 스킬 |
| **Developer** | 코딩, 코드 리뷰, PR 생성, 버그 수정 | `anthropic/claude-sonnet-4-6` | `developer` 스킬 + `github`/`gitlab` 스킬 |
| **Manual Tester** | 테스트 케이스 설계, 탐색적 테스트 문서, 결함 분석 | `anthropic/claude-sonnet-4-6` | `manual-tester` 스킬 |

사용자는 LLM 제공자, 스킬, MCP 서버, 시스템 프롬프트를 임의로 조합하여 커스텀 에이전트 타입을 만들 수 있습니다.

---

## Customization

모든 에이전트는 네 가지 커스터마이징 축을 노출합니다.

| 축 | 설명 |
|---|---|
| **LLM Provider** | LiteLLM이 지원하는 모든 제공자: Anthropic, OpenAI, Azure, AWS Bedrock, Gemini, Groq, OpenRouter, 로컬 LLM 등. |
| **System Prompt** | 자유 형식의 Jinja2 템플릿 또는 일반 텍스트로, 에이전트 타입에서 미리 채워집니다. |
| **Skills** | AgentSkills 표준 `SKILL.md` 디렉터리 또는 인라인 텍스트 스킬입니다. DB에 저장되며 런타임에 컨테이너에 마운트됩니다. |
| **MCP Servers** | 표준 `mcpServers` 형식을 따르는 JSON MCP 구성입니다. 대화 시작 시 컨테이너 내부에서 평가됩니다. |

---

## Related Documents

- [database-schema.md](database-schema.md) — 에이전트 테이블 및 `project_members`에 대한 수정 사항
- [api-design.md](api-design.md) — 에이전트 관리용 REST 엔드포인트
- [ai-agent-service.md](ai-agent-service.md) — `services/ai-agent` 구현 세부 사항
- [repository-plugin-adapter.md](repository-plugin-adapter.md) — 에이전트가 VCS 자격 증명에 접근하는 방식
- [realtime-events.md](realtime-events.md) — 대화 중 발생하는 Socket.IO 이벤트
