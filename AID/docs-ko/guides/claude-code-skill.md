> 📄 이 문서는 원문(docs/)의 한국어 번역입니다. 코드·명령·경로·링크는 원문 그대로 유지했습니다.

# Claude Code용 Paca 스킬

`/paca` 및 `/paca-setup` 슬래시 명령으로 Claude Code CLI에서 직접 Paca를 사용하세요. 설치되면 Claude는 로컬 파일을 생성하는 대신 작업, 문서화, 스프린트 관리에 여러분의 Paca 워크스페이스를 사용합니다.

## 설치

설치 프로그램을 실행하세요(macOS와 Linux에서 작동):

```bash
curl -fsSL https://raw.githubusercontent.com/Paca-AI/paca/master/scripts/install-claude-skill.sh | bash
```

> **보안 참고:** 실행하기 전에 스크립트를 검토하세요 — `curl | bash` 는 원격 코드를 직접 실행합니다. 위 URL에서 내용을 확인한 다음, 로컬 클론에서 `bash scripts/install-claude-skill.sh` 를 실행하는 방법도 있습니다.

또는, 이 저장소의 로컬 클론에서:

```bash
bash scripts/install-claude-skill.sh
```

설치 프로그램은 두 개의 스킬 파일을 `~/.claude/commands/` 에 복사하여, 모든 Claude Code 세션에서 `/paca` 와 `/paca-setup` 을 사용할 수 있게 합니다.

## MCP 서버 구성

이 스킬은 Paca MCP 서버가 연결되어 있어야 합니다. 스킬을 설치한 후, 대화형 설정 안내를 위해 Claude Code 세션 내에서 `/paca-setup` 을 실행하거나, 아래의 빠른 단계를 따르세요.

### 빠른 설정 — Claude Code CLI

```bash
claude mcp add paca \
  --env PACA_API_KEY=<your-api-key> \
  --env PACA_API_URL=<your-paca-url> \
  -- npx -y @paca-ai/paca-mcp
```

`<your-api-key>` (Paca → Settings → API Keys에서 발급)와 `<your-paca-url>` (예: `http://localhost:8080` 또는 호스팅된 URL)을 교체하세요.

### 프로젝트 수준 설정 (팀에 권장)

프로젝트 루트에 `.claude/mcp.json` 을 생성하세요:

```json
{
  "mcpServers": {
    "paca": {
      "command": "npx",
      "args": ["-y", "@paca-ai/paca-mcp"],
      "env": {
        "PACA_API_KEY": "<your-api-key>",
        "PACA_API_URL": "http://localhost:8080"
      }
    }
  }
}
```

> **보안:** API 키를 커밋하지 마세요. `.claude/mcp.json` 을 `.gitignore` 에 추가하거나 셸 환경에서 `PACA_API_KEY` 를 주입하세요.

### Claude Desktop

사용 중인 OS의 구성 파일에 추가하세요:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "paca": {
      "command": "npx",
      "args": ["-y", "@paca-ai/paca-mcp"],
      "env": {
        "PACA_API_KEY": "<your-api-key>",
        "PACA_API_URL": "http://localhost:8080"
      }
    }
  }
}
```

저장한 후 Claude Desktop을 다시 시작하세요.

## 명령어

모든 명령어는 먼저 여러분의 Paca 문서를 읽습니다 — 어떤 작업을 수행하기 전에 Claude는 `list_documents` 를 호출하고 관련 문서를 읽어 프로젝트 컨텍스트를 이해합니다. 문서 업데이트는 항상 `update_document` 또는 `create_document` 를 통해 Paca Docs에 다시 기록되며, 로컬 파일로는 저장되지 않습니다.

### `/paca <request>`

평이한 영어로 하는 범용 Paca 작업입니다. 의도에 따라 적절한 도구로 라우팅합니다.

```
/paca Fix the login redirect bug, assign to sprint 3
/paca What's in the current sprint?
/paca Mark task #42 as done
/paca ABC-17 is blocked — add a comment: needs design review
```

### `/paca-epic <requirements>`

요구 사항을 구조화된 에픽으로 변환합니다: 부모 작업을 생성하고, 이를 자식 스토리로 나누며, 사양 문서를 작성합니다 — 모두 Paca 내에서 이루어집니다.

```
/paca-epic As a user I want to reset my password via email
/paca-epic #12   ← turn an existing requirement task into a full epic
```

### `/paca-clarify <task-or-doc>`

작업 또는 문서를 읽고, 모호한 점(범위 누락, 누락된 엣지 케이스, 정의되지 않은 용어)을 식별하며, 목표 지향적인 질문을 한 다음, 해결된 내용으로 Paca의 사양을 업데이트합니다.

```
/paca-clarify #42
/paca-clarify ABC-17
/paca-clarify "OAuth Integration Spec"
```

### `/paca-breakdown <task>`

작업이나 에픽을 더 작고, 독립적이며, 추정 가능한 하위 작업으로 분해하고 Paca에 생성합니다.

```
/paca-breakdown #42
/paca-breakdown ABC-17
```

### `/paca-sprint`

스프린트를 계획합니다: 백로그와 프로젝트 로드맵을 읽고, 명시된 수용 능력에 맞는 작업 세트를 추천한 다음, 작업을 스프린트에 할당하고 스프린트 목표를 설정합니다.

```
/paca-sprint
/paca-sprint next sprint, 30 points capacity
/paca-sprint sprint 4, goal: ship the auth flow
```

### `/paca-estimate <task(s)>`

피보나치 척도를 사용하여 하나 이상의 작업에 대한 스토리 포인트를 근거와 함께 추정한 다음, 추정치를 작업에 다시 기록합니다.

```
/paca-estimate #42
/paca-estimate #42 #43 #44
/paca-estimate          ← estimates all unestimated tasks in the current sprint
```

### `/paca-prioritize`

비즈니스 가치, 긴급성, 노력, 의존성을 프로젝트 로드맵에 비추어 작업의 점수를 매긴 다음, 우선순위 필드를 업데이트합니다.

```
/paca-prioritize
/paca-prioritize #42 #43 #44
```

### `/paca-do <task>`

작업을 처음부터 끝까지 실행합니다: 진행 중으로 표시하고, 관련된 모든 문서를 읽으며, 작업(코드, 작성, 조사)을 수행한 다음, 완료로 표시하고 영향을 받는 Paca 문서를 업데이트합니다.

```
/paca-do #42
/paca-do ABC-17
```

### `/paca-test <task>`

수용 기준에서 테스트 케이스를 도출하고, 실행한 다음, 결과를 작업 댓글로 게시합니다. 통과 시 작업 상태를 진행시키고, 실패 시 진행 중으로 되돌립니다.

```
/paca-test #42
/paca-test ABC-17
```

### `/paca-doc <task-or-topic>`

Paca Docs에 문서를 작성하거나 업데이트합니다. 어조를 맞추고 중복을 피하기 위해 먼저 기존 문서를 읽습니다.

```
/paca-doc #42                          ← document the feature in task #42
/paca-doc "API Authentication Guide"   ← create a new guide
/paca-doc ABC-17 update                ← update an existing doc
```

### `/paca-setup`

대화형 설정 마법사입니다. Claude Code를 여러분의 Paca 인스턴스에 연결하고 연결을 확인하는 과정을 안내합니다.

```
/paca-setup
```

## 환경 변수

| 변수 | 필수 | 기본값 | 설명 |
|---|---|---|---|
| `PACA_API_KEY` | Yes | — | API 키 (Paca → Settings → API Keys) |
| `PACA_API_URL` | No | `http://localhost:8080` | Paca 인스턴스 URL |

## 프로젝트의 기본값으로 Paca 설정하기

(매번 `/paca` 를 입력할 필요 없이) 프로젝트에서 Claude가 항상 Paca 도구를 우선하도록 하려면, 프로젝트의 `CLAUDE.md` 에 다음을 추가하세요:

```markdown
## Project management

This project uses Paca for all project management. When working in this codebase:

- **Tasks and to-dos** → use `create_task` / `list_tasks` via the Paca MCP tools. Do not create local TODO files or add TODO comments.
- **Documentation** → use `create_document` / `update_document` via Paca MCP. Do not create standalone `.md` docs unless they belong in the repository (e.g. README, CONTRIBUTING).
- **Sprint planning** → use `create_sprint` / `list_sprints` via Paca MCP.

If Paca MCP tools are not available, say so and ask the user to run `/paca-setup`.
```

## 제거

```bash
rm ~/.claude/commands/paca.md ~/.claude/commands/paca-setup.md
```

## 사용 가능한 도구

전체 도구 레퍼런스는 [mcp-server-setup.md](mcp-server-setup.md)를 참고하세요.
