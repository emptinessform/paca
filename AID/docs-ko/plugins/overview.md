> 📄 이 문서는 원문(docs/)의 한국어 번역입니다. 코드·명령·경로·링크는 원문 그대로 유지했습니다.

# 플러그인 시스템 개요

Paca의 플러그인 시스템은 개발자가 코어를 포크하지 않고도 제품을 확장할 수 있게 해줍니다. 플러그인은 UI 화면(뷰, 사이드바 섹션, 태스크 상세 패널, 프로젝트 설정 탭)을 추가하고, 백엔드 HTTP 라우트를 등록하며, 데이터베이스와 이벤트 버스에 범위가 제한된 접근 권한으로 서버 측 로직을 실행할 수 있습니다.

## 목표

- 커뮤니티가 코어 릴리스 주기와 독립적으로 기능을 출시할 수 있도록 합니다.
- 팀이 필요한 기능만 설치할 수 있도록 합니다.
- 프런트엔드와 백엔드 모두에서 안전하고 샌드박스화된 실행 모델을 제공합니다.
- 시스템의 개념 증명(proof-of-concept)으로서 자사(first-party) 기능(BDD 시나리오, 체크리스트, GitHub 통합, 시간 추적)을 플러그인으로 이전합니다.

## 비목표

- 프로세스 재시작 없이 런타임에 백엔드 플러그인을 핫 리로드하는 것은 보류합니다.
- 플러그인 간 통신(플러그인이 서로 호출하는 것)은 v1의 범위를 벗어납니다.

## 마켓플레이스

Paca는 공개 GitHub 카탈로그를 기반으로 하는 관리자 마켓플레이스 UI를 포함합니다.

- 카탈로그 출처: `Paca-AI/paca-plugins` (`catalog/plugins.json`)
- 게시 모델: 플러그인 개발자가 풀 리퀘스트를 통해 기여합니다.
- 설치 흐름: API가 아티팩트 tarball을 다운로드하고, 에셋을 설치하고, 마이그레이션을 실행하고, 플러그인 런타임 모듈을 로드합니다.

스키마 및 운영 세부 사항은 [marketplace.md](marketplace.md)를 참조하세요.

## 핵심 개념

| 개념 | 설명 |
|---|---|
| **Plugin** | 매니페스트에서 확장 지점을 선언하는, 버전이 지정된 프런트엔드 및/또는 백엔드 코드 번들입니다. |
| **Extension Point** | 플러그인이 동작을 주입할 수 있는 Paca UI 또는 백엔드의 명명된 슬롯입니다. |
| **Plugin Manifest** | 플러그인의 ID, 버전, 권한, 확장 지점 등록을 선언하는 `plugin.json` 파일입니다. |
| **Plugin Registry** | 어떤 플러그인이 어떤 버전으로 설치·활성화되어 있는지에 대한 설치별 기록입니다. |
| **Plugin SDK** | Paca 호스트에 대한 타입이 지정된 API를 제공하는 TypeScript(`@paca-ai/plugin-sdk-react`), Go(`github.com/Paca-AI/plugin-sdk-go`), MCP(`@paca-ai/plugin-sdk-mcp`) 패키지입니다. |

## 아키텍처 한눈에 보기

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                        │
│                                                                 │
│  ┌──────────────────┐     Module Federation / ES modules        │
│  │   apps/web        │◄───────────────────────────────────────┐ │
│  │  (host app)       │                                         │ │
│  └──────────────────┘                                         │ │
│                                                                │ │
│  ┌──────────────────┐  ┌──────────────────┐                   │ │
│  │ Plugin A (JS/CSS)│  │ Plugin B (JS/CSS)│  ... (remote entry│ │
│  │  micro-frontend  │  │  micro-frontend  │       served by   │ │
│  └──────────────────┘  └──────────────────┘       plugin CDN) │ │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  services/api  (Go)                                            │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Plugin Runtime (wazero)                                 │  │
│  │                                                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │  │
│  │  │ plugin-bdd   │  │ plugin-gh    │  │ plugin-time   │  │  │
│  │  │   .wasm      │  │   .wasm      │  │   .wasm       │  │  │
│  │  └──────────────┘  └──────────────┘  └───────────────┘  │  │
│  │          │                │                  │           │  │
│  │          └────────────────┴──────────────────┘           │  │
│  │                           │                              │  │
│  │              Host Function Bridge                        │  │
│  │      (db_query, db_exec, http_register, event_emit)      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Core API (Gin router, domain services, PostgreSQL, Valkey)    │
└────────────────────────────────────────────────────────────────┘
```

## 확장 지점

| ID | 화면 | 설명 |
|---|---|---|
| `sidebar.general.section` | 일반 사이드바 | 전역 왼쪽 내비게이션에 접을 수 있는 섹션을 추가합니다. |
| `sidebar.project.section` | 프로젝트 사이드바 | 프로젝트 사이드바 내비게이션 안에 접을 수 있는 섹션을 추가합니다. |
| `task.detail.section` | 태스크 상세 패널 | 태스크 드로어/페이지의 설명 아래에 패널을 추가합니다. |
| `project.settings.tab` | 프로젝트 설정 | 프로젝트 설정 페이지에 탭을 추가합니다. |
| `view` | 메인 콘텐츠 영역 | 전체 뷰(예: Gantt, Roadmap, Calendar)를 선택 가능한 보드 뷰로 등록합니다. |
| `api.route` | 백엔드 | `/api/v1/plugins/{pluginId}/` 아래에 하나 이상의 HTTP 라우트를 등록합니다. |
| `event.handler` | 백엔드 | 코어 도메인 이벤트(태스크 생성, 스프린트 종료 등)를 구독합니다. |
| `mcp.tools` | MCP 서버 | Paca MCP 서버를 통해 AI가 호출할 수 있는 MCP 도구를 노출합니다. |

## 플러그인 라이프사이클

```
Uploaded → Validated (manifest + WASM signature check) → Installed
         → Enabled per project (or globally)
         → Routes registered at startup / plugin enable
         → UI loaded lazily when user navigates to extension point
         → Disabled → Uninstalled (data retained unless plugin opts-in to cleanup)
```

## 보안 모델

### 프런트엔드
- 플러그인 JS 번들은 구성 가능한 플러그인 CDN 오리진에서 로드됩니다.
- 호스트 앱은 엄격한 콘텐츠 보안 정책(Content Security Policy)을 적용합니다. 플러그인 오리진은 서버 구성에서 허용 목록에 추가되어야 합니다.
- 플러그인은 호스트가 각 확장 지점에 명시적으로 전달하는 컨텍스트 객체만 받습니다 — 호스트의 React 트리나 내부 스토어에 직접 접근할 수 없습니다.
- 신뢰할 수 없는/서드파티 플러그인의 경우 iframe에서 샌드박스화해야 합니다(v2 고려 사항).

### 백엔드
- 각 WASM 플러그인은 호스트 파일 시스템에 접근할 수 없는 격리된 `wazero` 모듈에서 실행됩니다.
- 호스트 함수 브리지는 행 수준 범위 제한을 적용합니다. 모든 DB 호출은 암묵적으로 플러그인의 인가된 프로젝트 범위로 필터링됩니다.
- 플러그인은 임의의 SQL을 실행할 수 없습니다. 타입이 지정된 호스트 함수(`db.QueryTasks`, `db.CreateCustomRecord` 등)를 호출합니다.
- `plugin.json`의 플러그인별 권한 목록이 어떤 호스트 함수를 사용할 수 있는지를 통제합니다.
- WASM 실행은 `wazero`의 리소스 제어를 통해 CPU/메모리가 제한됩니다.

## 디렉터리 구조

```
plugins/                          ← local plugin store
  local/
    backend/                      ← Backend WASM binaries, migrations, manifests
      <plugin-id>/
        plugin.json
        backend.wasm
        migrations/
    frontend/                     ← Frontend JS/CSS bundles
      <plugin-id>/
        assets/
          remoteEntry.js
          ...
  README.md                       ← This file
```

플러그인 SDK는 이제 별도의 저장소에서 유지 관리됩니다.

- **Backend SDK (Go)**: [github.com/Paca-AI/plugin-sdk-go](https://github.com/Paca-AI/plugin-sdk-go)
- **Frontend SDK (React/TypeScript)**: [github.com/Paca-AI/plugin-sdk-react](https://github.com/Paca-AI/plugin-sdk-react)

## 관련 문서

- [Frontend Plugin System](frontend-plugin-system.md) — 모듈 페더레이션, 확장 지점 레지스트리, UI용 SDK API.
- [Backend Plugin System](backend-plugin-system.md) — WASM 런타임, 호스트 함수 브리지, 라우트 등록.
- [SDK Reference](sdk-reference.md) — 두 SDK에 대한 전체 API 레퍼런스.
- [First-Party Plugins](first-party-plugins.md) — BDD, 체크리스트, GitHub, 시간 추적의 마이그레이션 계획.
- [Developer Guide](developer-guide.md) — 첫 플러그인 작성을 위한 단계별 가이드.
