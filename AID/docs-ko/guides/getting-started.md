> 📄 이 문서는 원문(docs/)의 한국어 번역입니다. 코드·명령·경로·링크는 원문 그대로 유지했습니다.

# 시작하기

## 방법 1 — 설치 스크립트 (권장)

Docker가 설치된 모든 Linux 서버에서 실행됩니다. 릴리스 자산을 다운로드하고, 대화형으로 구성을 안내하며, 전체 스택을 시작합니다.

```bash
curl -fsSL https://github.com/Paca-AI/paca/releases/latest/download/install.sh | bash
```

완료되면 `http://your-server-ip` 을 여세요.

---

## 방법 2 — Docker Compose (수동)

사전 빌드된 이미지를 가져옵니다. 저장소를 복제할 필요가 없습니다.

```bash
# Download compose file and Caddyfile
mkdir paca && cd paca
curl -fsSL https://github.com/Paca-AI/paca/releases/latest/download/docker-compose.yml -o docker-compose.yml
mkdir -p caddy
curl -fsSL https://github.com/Paca-AI/paca/releases/latest/download/Caddyfile -o caddy/Caddyfile

# Create an environment file
cat > .env <<'EOF'
JWT_SECRET=<run: openssl rand -hex 32>
ADMIN_PASSWORD=<your-admin-password>
POSTGRES_PASSWORD=<run: openssl rand -hex 32>
AGENT_API_KEY=<run: openssl rand -hex 32>
INTERNAL_API_KEY=<run: openssl rand -hex 32>
ENCRYPTION_KEY=<run: openssl rand -hex 32>
PUBLIC_URL=http://localhost
EOF

# Start the stack
docker compose --env-file .env up -d
```

`http://localhost` 을 열고 `admin` 과 설정한 비밀번호로 로그인하세요.

HTTPS를 사용하시겠습니까? `SITE_ADDRESS` 를 도메인 또는 IP 주소로 설정하고, 이에 맞춰
`PUBLIC_URL=https://…` 와 `COOKIE_SECURE=true` 를 함께 설정하세요. DNS가 여기를 가리키는
실제 도메인은 신뢰할 수 있는 Let's Encrypt 인증서를 받고, IP 주소나 `localhost` 는 대신
Caddy 자체의 로컬 CA에서 인증서를 받습니다(브라우저는 신뢰 경고를 표시하지만, 연결은
여전히 암호화됩니다). [설치 스크립트](#option-1--install-script-recommended)는 이를 기본으로
활성화하고 주소를 입력하도록 안내합니다. 자세한 내용은
[../../deploy/README.md](../../deploy/README.md#production-deployment)를 참고하세요.

---

## 방법 3 — 로컬 개발

기여자를 위한 방법입니다. 저장소를 복제한 다음, 하나의 명령으로 모든 것을 시작하세요.

```bash
git clone https://github.com/Paca-AI/paca.git && cd paca
docker compose -f deploy/docker-compose.dev.yml up -d
```

모든 서비스가 핫 리로드로 시작됩니다 — API, 웹 앱, 실시간 서비스가 모두 로컬 소스 파일을 감시하고 자동으로 다시 빌드합니다. 스택이 정상 상태가 되면 `http://localhost:3000` 을 여세요.

개발 스택과 호스트에서 서비스를 실행하는 방법에 대한 자세한 내용은 [local-development.md](local-development.md)를 참고하세요.

---

## 새 버전으로 업그레이드하기

`docker-compose.yml` 과 `.env` 가 있는 디렉터리에서 업그레이드 스크립트를 실행하세요.
이 스크립트는 기존 파일을 먼저 백업한 후 `docker-compose.yml` 과 Caddyfile을 새로 고치고,
스택을 가져와서 다시 시작합니다.

```bash
curl -fsSL https://github.com/Paca-AI/paca/releases/latest/download/upgrade.sh -o upgrade.sh
bash upgrade.sh
```

데이터베이스 마이그레이션은 API 시작 시 자동으로 실행됩니다 — 수동 단계가 필요하지 않습니다.
특정 버전 고정, `--scale` 플래그 전달, 수동 업그레이드에 대해서는
[../../deploy/README.md](../../deploy/README.md#upgrading-to-a-new-version)를
참고하세요.

---

## MCP를 통해 AI 에이전트 연결하기

Paca가 실행된 후:

1. API 키를 생성합니다: **Settings → API Keys → New Key**
2. 에이전트 구성에 Paca MCP 서버를 추가합니다(Claude Desktop 예시):

```json
{
  "mcpServers": {
    "paca": {
      "command": "npx",
      "args": ["-y", "@paca-ai/paca-mcp"],
      "env": {
        "PACA_API_KEY": "your-api-key-here",
        "PACA_API_URL": "http://localhost:8080"
      }
    }
  }
}
```

플랫폼별 안내 및 고급 구성에 대해서는 [mcp-server-setup.md](mcp-server-setup.md)를 참고하세요.

---

## 다음으로 읽을 문서

| 문서 | 언제 읽어야 하나 |
|---|---|
| [local-development.md](local-development.md) | 기여자 환경을 설정할 때 |
| [mcp-server-setup.md](mcp-server-setup.md) | MCP를 통해 AI 에이전트를 연결할 때 |
| [../architecture/overview.md](../architecture/overview.md) | 시스템 아키텍처를 이해할 때 |
| [../plugins/overview.md](../plugins/overview.md) | 플러그인을 작성하거나 설치할 때 |
| [../../deploy/README.md](../../deploy/README.md) | 프로덕션 배포 레퍼런스 |
| [../../CHANGELOG.md](../../CHANGELOG.md) | 릴리스 이력 |
