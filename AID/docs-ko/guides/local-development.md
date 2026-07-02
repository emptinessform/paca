> 📄 이 문서는 원문(docs/)의 한국어 번역입니다. 코드·명령·경로·링크는 원문 그대로 유지했습니다.

# 로컬 개발

## 빠른 시작

하나의 명령으로 로컬 소스 파일에서 핫 리로드되는 전체 스택을 시작합니다:

```bash
docker compose -f deploy/docker-compose.dev.yml up -d
```

`http://localhost:3000` 을 여세요. 모든 서비스가 소스 트리를 감시하고 자동으로 다시 로드합니다 — 수동으로 다시 빌드할 필요가 없습니다.

중지하려면:
```bash
docker compose -f deploy/docker-compose.dev.yml down
```

데이터 볼륨까지 제거하려면:
```bash
docker compose -f deploy/docker-compose.dev.yml down -v
```

---

## 런타임 스택

| 서비스 | 기술 | 포트 | 핫 리로드 |
|---|---|---|---|
| Gateway (Caddy) | caddy:2-alpine | **3000** (host) | — |
| `apps/web` | React + TanStack Start + shadcn/ui | 3000 (internal) | Vite HMR |
| `services/api` | Go + Gin | 8080 (internal) | [air](https://github.com/air-verse/air) |
| `services/realtime` | Node.js + Socket.IO | 3001 (internal) | `bun --watch` |
| `services/ai-agent` | Python + FastAPI + OpenHands SDK | 8080 (internal) | source volume |
| PostgreSQL | postgres:16-alpine | 5432 | — |
| Valkey | valkey/valkey:8-alpine | 6379 | — |
| MinIO S3 API | minio/minio | 9000 | — |
| MinIO Console | minio/minio | 9001 | http://localhost:9001 (user: `minioadmin`, pass: `minioadmin`) |

Caddy 게이트웨이(포트 3000)는 `/api/v1/…` 를 API로, 소켓 트래픽을 realtime으로, `/storage/…` 를 MinIO로 라우팅합니다. `apps/web` 은 루트에서 제공됩니다.

---

## 사전 요구 사항

- Compose 플러그인이 포함된 [Docker](https://docs.docker.com/get-docker/)

전체 컨테이너화 스택을 위한 유일한 필수 요구 사항입니다. 각 서비스는 해당 서비스 디렉터리의 `Dockerfile.dev` 에서 자체 이미지를 빌드합니다.

---

## 인프라만 실행

PostgreSQL과 Valkey만 실행하려면(서비스를 호스트에서 직접 실행하기 위해):

```bash
docker compose -f deploy/docker-compose.dev.yml up -d postgres valkey
```

---

## 호스트에서 서비스 실행하기

더 빠른 피드백 루프나 IDE 통합 디버깅을 위해, 개별 서비스를 호스트에서 직접 실행하고 컨테이너화된 인프라를 가리키도록 할 수 있습니다.

**호스트 측 개발을 위한 사전 요구 사항:**
- Go 1.23+ (`services/api` 용)
- Bun (`apps/web` 및 `services/realtime` 용)
- Python 3.12+ 와 [uv](https://docs.astral.sh/uv/) (`services/ai-agent` 용)

### API (`services/api`)

```bash
cd services/api
cp .env.example .env   # first time — credentials match docker-compose defaults
make run               # uses air for hot-reload
```

### Web (`apps/web`)

```bash
cd apps/web
bun install            # first time only
bun run dev            # Vite dev server at http://localhost:3000
```

### Realtime (`services/realtime`)

```bash
cd services/realtime
bun install            # first time only
bun run dev
```

### AI Agent (`services/ai-agent`)

```bash
cd services/ai-agent
uv sync                # first time only
uv run uvicorn src.main:app --reload --port 8000
```

---

## 마이그레이션

마이그레이션은 `services/api/migrations/` 아래에 사전순으로 명명된 일반 SQL 파일입니다. Postgres 컨테이너가 처음 시작될 때(`/docker-entrypoint-initdb.d` 에 마운트됨) 자동으로 실행됩니다.

실행 중인 인스턴스에 대해 마이그레이션을 수동으로 적용하려면:

```bash
cd services/api
make migrate-up   # requires DATABASE_URL to be set
```

---

## 기본 개발용 자격 증명

| 리소스 | 값 |
|---|---|
| 앱 로그인 | `admin` / `adminpassword` |
| PostgreSQL | `paca:paca@localhost:5432/paca` |
| MinIO 콘솔 | `minioadmin` / `minioadmin` at http://localhost:9001 |
| 에이전트 API 키 | `dev-agent-api-key-change-in-production` |

이 값들은 의도적으로 약하게 설정된 기본값입니다 — 프로덕션에서는 절대 사용하지 마세요.

---

## 아키텍처 참고 사항

- `services/api` 는 모든 영속적 상태 변경을 소유하며 도메인 이벤트를 Valkey Streams에 발행합니다.
- `services/realtime` 은 해당 이벤트를 소비하여 Socket.IO 클라이언트로 팬아웃합니다.
- `services/ai-agent` 는 별도의 Valkey Stream에서 에이전트 트리거 이벤트를 읽고 OpenHands 대화를 위한 Docker 컨테이너를 관리합니다.
- `apps/mcp` 는 상태를 저장하지 않습니다(stateless); 실행 중인 API를 가리키도록 `npx @paca-ai/paca-mcp` 로 실행하세요.
