> 📄 이 문서는 원문(docs/)의 한국어 번역입니다. 코드·명령·경로·링크는 원문 그대로 유지했습니다.

# MCP 서버 설정 가이드

이 가이드는 Paca MCP(Model Context Protocol) 서버를 설정하여 AI 에이전트와 통합하고, 에이전트가 Paca 프로젝트, 태스크, 스프린트, 문서와 상호작용할 수 있도록 하는 과정을 단계별로 안내합니다.

## 사전 준비 사항

MCP 서버를 설정하기 전에 다음 사항을 확인하세요.

- 실행 중인 Paca API 인스턴스(로컬 또는 배포된 환경)
- Paca 인스턴스에서 발급한 API 키(사용자 설정에서 생성)
- 설치된 Node.js 18 이상(MCP 클라이언트에 필요)

## 빠른 시작

Paca MCP 서버는 GitHub 패키지로 제공되며, 별도의 설치나 빌드 단계가 필요하지 않습니다. MCP 클라이언트가 `npx`를 사용하여 서버를 직접 가져와 실행하도록 구성하기만 하면 됩니다.

### 패키지 정보

- **Package**: `@paca-ai/paca-mcp`
- **Repository**: [github.com/paca-ai/paca](https://github.com/paca-ai/paca) (MCP 서버 소스는 `apps/mcp` 아래에 있습니다)

### 패키지 확인

MCP 패키지의 최신 버전을 확인하려면 다음을 실행하세요.

```bash
npx @paca-ai/paca-mcp --version
```

## 에이전트별 설정

MCP 서버는 다양한 AI 에이전트 및 플랫폼과 통합할 수 있습니다. 아래는 널리 사용되는 옵션에 대한 구성 가이드입니다.

### Claude Desktop (권장)

Claude Desktop은 Paca MCP 서버와 가장 매끄러운 통합을 제공합니다.

**구성 단계:**

1. Claude Desktop 설정 파일의 위치를 찾습니다.
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. 다음 구성을 추가합니다.

```json
{
  "mcpServers": {
    "paca": {
      "command": "npx",
      "args": [
        "-y",
        "@paca-ai/paca-mcp"
      ],
      "env": {
        "PACA_API_KEY": "your-api-key-here",
        "PACA_API_URL": "http://localhost:8080"
      }
    }
  }
}
```

3. 자리 표시자 값을 교체합니다.
   - `your-api-key-here`를 실제 Paca API 키로 교체합니다.
   - `http://localhost:8080`을 다른 경우 실제 Paca API URL로 교체합니다.

4. Claude Desktop을 다시 시작합니다.

**참고**: `npx -y @paca-ai/paca-mcp` 명령은 npm에서 최신 버전의 Paca MCP 서버를 자동으로 다운로드하여 실행합니다.

**Claude Desktop에서의 사용:**

구성이 완료되면 Claude는 81개의 모든 Paca 도구에 자동으로 접근할 수 있습니다. Claude에게 다음과 같이 요청할 수 있습니다.

- "List all projects in my Paca workspace"
- "Create a new task for user authentication"
- "Create a sprint for the next 2 weeks"
- "Update the task status to in progress"
- "Add a comment to the design document"

### 기타 MCP 호환 클라이언트

Paca MCP 서버는 표준 MCP 프로토콜을 따르며, 모든 MCP 호환 클라이언트와 함께 사용할 수 있습니다.

**필수 구성:**

1. **Command**: `npx -y @paca-ai/paca-mcp`를 사용하여 최신 버전을 자동으로 다운로드하고 실행합니다.
2. **환경 변수**:
   - `PACA_API_KEY` (필수): Paca API 키
   - `PACA_API_URL` (선택): Paca API URL (기본값: `http://localhost:8080`)

**클라이언트 구성 예시:**

대부분의 MCP 클라이언트는 다음 형식의 구성을 허용합니다.

```json
{
  "name": "paca",
  "command": "npx",
  "args": [
    "-y",
    "@paca-ai/paca-mcp"
  ],
  "env": {
    "PACA_API_KEY": "your-api-key-here",
    "PACA_API_URL": "http://localhost:8080"
  }
}
```

### 커스텀 AI 에이전트

커스텀 AI 에이전트나 애플리케이션의 경우, MCP 서버를 프로그래밍 방식으로 사용할 수 있습니다.

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@paca-ai/paca-mcp"],
  env: {
    PACA_API_KEY: "your-api-key-here",
    PACA_API_URL: "http://localhost:8080"
  }
});

const client = new Client({
  name: "my-agent",
  version: "1.0.0"
}, {
  capabilities: {}
});

await client.connect(transport);

// List available tools
const tools = await client.listTools();
console.log("Available tools:", tools.tools);

// Call a tool
const result = await client.callTool({
  name: "list_projects",
  arguments: {}
});
console.log("Projects:", result.content);
```

## 제공되는 도구

Paca MCP 서버는 **16개 카테고리**에 걸쳐 **81개의 도구**를 제공합니다.

- 📁 **프로젝트 관리** (5개 도구): 프로젝트 생성, 조회, 수정, 삭제
- ✅ **태스크 관리** (6개 도구): 전체 태스크 라이프사이클 관리
- 🏃 **스프린트 관리** (6개 도구): 완전한 스프린트 워크플로우
- 📄 **문서 관리** (5개 도구): 문서 CRUD 작업
- 👥 **프로젝트 멤버** (5개 도구): 팀 및 역할 관리
- 🎭 **프로젝트 역할** (4개 도구): 커스텀 역할 정의
- 🏷️ **태스크 타입** (5개 도구): 태스크 타입 구성
- 📊 **태스크 상태** (4개 도구): 워크플로우 상태 관리
- 🎯 **뷰** (9개 도구): 스프린트, 백로그, 타임라인 뷰
- 🔧 **커스텀 필드** (5개 도구): 커스텀 필드 정의
- 📎 **첨부 파일** (3개 도구): 파일 첨부 관리
- 📁 **문서 폴더** (4개 도구): 문서 정리
- 📸 **문서 스냅샷** (2개 도구): 문서 버전 관리
- 🔗 **GitHub 통합** (7개 도구): 저장소 및 PR 연결
- 💬 **태스크 활동** (4개 도구): 댓글 및 활동 추적
- 🔀 **태스크 GitHub** (5개 도구): 브랜치 및 PR 관리

자세한 설명이 포함된 전체 도구 목록은 [MCP README](../../apps/mcp/README.md)를 참조하세요.

## Markdown/BlockNote 변환

MCP 서버는 콘텐츠 변환을 자동으로 처리합니다.

- **읽기**: 콘텐츠를 BlockNote JSON으로 가져와 가독성을 위해 Markdown으로 변환합니다.
- **쓰기**: Markdown 입력을 받아 저장을 위해 BlockNote JSON으로 변환합니다.

이를 통해 AI 에이전트는 익숙한 Markdown 형식으로 작업하는 한편, Paca는 콘텐츠를 리치 텍스트 형식으로 저장합니다.

## 에이전트 상호작용 예시

### 예시 1: 완전한 스프린트 워크플로우 생성

```
User: "Create a new sprint for next week and add these tasks: 
1. Implement authentication 
2. Set up database 
3. Create user API"

Agent: (uses MCP tools)
1. create_sprint - Creates sprint "Sprint 1" with dates
2. create_task - Creates "Implement authentication" task
3. create_task - Creates "Set up database" task  
4. create_task - Creates "Create user API" task
5. bulk_move_tasks - Moves all tasks to the new sprint
```

### 예시 2: 태스크 상태 검토 및 업데이트

```
User: "Review all in-progress tasks and update their status based on completion"

Agent: (uses MCP tools)
1. list_tasks - Gets all tasks with "in_progress" status
2. get_task - Retrieves details for each task
3. update_task - Updates status to "done" or "blocked" based on analysis
```

### 예시 3: 문서 관리

```
User: "Create a system design document for the authentication module"

Agent: (uses MCP tools)
1. create_document - Creates "Authentication System Design" document
2. update_document - Adds Markdown content with architecture diagrams
3. create_doc_folder - Optionally organizes in "Architecture" folder
```

## MCP 서버 테스트

구성이 완료되면 MCP 클라이언트를 통해 MCP 서버를 직접 테스트할 수 있습니다.

### Claude Desktop으로 테스트

Claude Desktop을 다시 시작한 후, Claude에게 간단히 요청해 보세요.
- "What Paca tools are available?"
- "List all my projects"
- "Create a test task"

### 커스텀 클라이언트로 테스트

클라이언트의 내장 테스트 도구를 사용하여 다음을 수행합니다.
- 제공되는 도구 목록 조회
- 샘플 도구 호출
- API 인증 확인

### 컨트리뷰터 / 고급 테스트

MCP Inspector로 테스트하려면 저장소를 클론하여 로컬에서 실행하세요.

```bash
git clone https://github.com/paca-ai/paca.git
cd paca/apps/mcp
npm install
npm run inspector
```

## 문제 해결

### 자주 발생하는 문제

**문제**: "Connection refused" 오류
- **해결 방법**: Paca API가 실행 중이고 `PACA_API_URL`이 올바른지 확인하세요.

**문제**: "Unauthorized" 오류
- **해결 방법**: `PACA_API_KEY`가 유효하고 적절한 권한을 가지고 있는지 확인하세요.

**문제**: "npx: command not found" 오류
- **해결 방법**: Node.js 18 이상이 설치되어 있고 npx가 PATH에 있는지 확인하세요.

**문제**: Claude Desktop에 Paca 도구가 표시되지 않음
- **해결 방법**: 설정 파일 경로를 확인하고, JSON 문법을 검증한 후 Claude Desktop을 다시 시작하세요.

**문제**: "Cannot find package '@paca-ai/paca-mcp'" 오류
- **해결 방법**: 인터넷 연결과 npm 레지스트리 접근이 가능한지 확인하세요.

### 디버그 모드

다음을 설정하여 디버그 로깅을 활성화합니다.

```bash
export DEBUG="*"
```

그런 다음 MCP 서버를 실행하면 상세 로그를 확인할 수 있습니다.

## 보안 모범 사례

1. **API 키를 절대 버전 관리에 커밋하지 마세요**.
2. 민감한 구성에는 **환경 변수를 사용**하세요.
3. **API 키 권한을** 에이전트에 필요한 수준으로만 **제한**하세요.
4. **API 키를** 정기적으로 **교체**하세요.
5. 프로덕션 배포에는 **HTTPS를 사용**하세요.

## 다음 단계

- [전체 도구 문서](../../apps/mcp/ALL_TOOLS.md)를 살펴보세요.
- [MCP 서버 아키텍처](../../apps/mcp/ARCHITECTURE.md)에 대해 알아보세요.
- 더 깊은 통합을 위해 [Paca API 문서](../api/README.md)를 검토하세요.
- 개발 가이드는 [메인 MCP README](../../apps/mcp/README.md)를 확인하세요.

## 도움 받기

- 이슈 신고: [GitHub Issues](https://github.com/paca-ai/paca/issues)
- 문서: [docs/README.md](../README.md)
- 기여하기: [CONTRIBUTING.md](../../CONTRIBUTING.md)
