> 📄 이 문서는 원문(docs/)의 한국어 번역입니다. 코드·명령·경로·링크는 원문 그대로 유지했습니다.

# 디자인 시스템

이 문서는 Paca의 웹 인터페이스 전반에서 사용되는 시각 언어, 컴포넌트 패턴, 인터랙션 관례를 정의합니다. 일관성을 유지하기 위해 모든 페이지와 컴포넌트는 이 규칙을 따라야 합니다.

**참조 구현:** `apps/web/src/components/projects/interactions/task-detail/`

---

## 목차

- [Design Concept](#design-concept)
- [Color Philosophy](#color-philosophy)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Surfaces & Cards](#surfaces--cards)
- [Borders & Dividers](#borders--dividers)
- [Shadows & Depth](#shadows--depth)
- [Opacity & Text Hierarchy](#opacity--text-hierarchy)
- [Buttons & Interactive Elements](#buttons--interactive-elements)
- [Badges & Status Chips](#badges--status-chips)
- [Avatars](#avatars)
- [Forms & Inputs](#forms--inputs)
- [Checkboxes](#checkboxes)
- [Progress Bars](#progress-bars)
- [Tags / Pills](#tags--pills)
- [Popovers & Dropdowns](#popovers--dropdowns)
- [Section Headings](#section-headings)
- [Field Rows](#field-rows)
- [Empty States](#empty-states)
- [Modals & Dialogs](#modals--dialogs)
- [Side Panels](#side-panels)
- [Activity Feed](#activity-feed)
- [Scrollbars](#scrollbars)
- [Transitions & Animations](#transitions--animations)
- [File Patterns](#file-patterns)

---

## Design Concept

### 고대비 미니멀리즘 (High-Contrast Minimalism)

Paca의 시각 언어는 **고대비 미니멀리즘(High-Contrast Minimalism)** 입니다. 서로를 강화하는 두 가지 원칙 위에 세워진 미학입니다.

**미니멀리즘**은 잡음을 걷어냅니다. 그라디언트 메시도, 도트 그리드도, 겹겹의 반투명 효과도 없습니다. 표면은 평평하고, 순수하며, 의도적입니다. 모든 시각 요소는 그 존재 가치를 스스로 증명해야 합니다.

**고대비**는 위계를 명확하게 만듭니다. 순백 위의 짙은 검정 텍스트, 근검정 위의 순백 텍스트, 그리고 모호함 없이 액션과 포커스와 에너지를 알리는 단 하나의 일렉트릭 라임 강조색(`#9ed957`)입니다.

### 팔레트

| Token | Light | Dark | Role |
|---|---|---|---|
| `--background` | `#ffffff` | `#0a0a0a` | 페이지와 모달의 루트 — 완전히 순수함 |
| `--foreground` | `#111111` | `#f0f0f0` | 기본 텍스트 — 근검정 / 근백색 |
| `--primary` | `#9ed957` | `#9ed957` | 라임 강조색 — CTA, 활성 상태, 포커스 링 |
| `--primary-foreground` | `#0d0d0d` | `#0a0a0a` | 라임 버튼 위의 텍스트 — 항상 어두운 색 |
| `--card` | `#ffffff` | `#111111` | 컴포넌트 표면 |
| `--muted` | `#f5f5f5` | `#1a1a1a` | 은은한 배경 채움 |
| `--muted-foreground` | `#737373` | `#888888` | 레이블, 플레이스홀더, 보조 텍스트 |
| `--border` | `#d4d4d4` | `#2a2a2a` | 구조적 구분선 |
| `--sidebar` | `#fafafa` | `#0d0d0d` | 내비게이션 표면 |

### 디자인 규칙

1. **순수한 배경**: 라이트 모드는 `#ffffff`입니다 — 색조도, 그라디언트도 없습니다. 다크 모드는 `#0a0a0a`입니다. 루트 캔버스에는 절대 색조를 넣지 마세요.
2. **하나의 강조색을 일관되게 적용**: 라임(`#9ed957`)이 유일한 유채색 강조색입니다. 기본 액션, 활성 내비게이션 표시, 포커스 링, 키커(kicker) 레이블에 사용하세요.
3. **장식적 배경 금지**: 메시 그라디언트도, 도트 그리드도 없습니다. 대비는 장식적 텍스처가 아니라 콘텐츠 간의 관계에서 나옵니다.
4. **날카롭지만 은은한 반경**: 보더 반경은 `0.5rem`(8px)입니다 — 정교하게 다듬어졌다고 느껴질 만큼의 부드러움이되, 장난스러워 보일 정도로 둥글지는 않습니다.
5. **평평한 그림자**: 그림자는 최대 `0 1px 3px rgba(0,0,0,0.07)`입니다 — 높이(elevation)를 암시하기 위한 것이지 결코 장식용이 아닙니다.
6. **완료에는 에메랄드**: 에메랄드 그린(`bg-emerald-500`)은 오직 성공/완료 상태(체크박스, 100%인 진행 바)에만 사용됩니다.
7. **표준 타입 스케일만 사용**: 폰트 크기는 항상 Tailwind의 명명된 스케일(`text-xs` … `text-3xl`)을 사용합니다. `text-[13px]`, `text-[0.8rem]` 등 임의의 값은 절대 사용하지 마세요 — [Type Scale](#typography)을 참조하세요.

---

## Color Philosophy

우리는 **불투명도로 조절되는 시맨틱 토큰(opacity-modulated semantic tokens)** 을 사용하며, 컴포넌트 코드에서 원시 hex 값을 절대 쓰지 않습니다. 색상은 `token/opacity` 형태로 표현되며, 여기서 불투명도가 위계를 전달합니다.

| Layer | Token | Usage |
|---|---|---|
| Background | `bg-background` | 페이지/모달 루트 |
| Surface | `bg-card/50` to `bg-card/80` | 카드, 패널, 호버 상태 |
| Muted surface | `bg-muted/20` to `bg-muted/60` | 툴바, 칩 배경, 비활성 상태 |
| Primary | `bg-primary`, `text-primary` | CTA, 활성 표시, 링크 |
| Destructive | `text-destructive` | 삭제 버튼, 유효성 검사 오류 |
| Success | `bg-emerald-500` (via Tailwind) | 완료 상태, 체크마크, 확인 |

**핵심 규칙:** 모든 "보조" 또는 "은은한" 배경은 `muted` 또는 `card`에 10–50% 사이의 불투명도를 적용한 값을 사용합니다. `--muted`는 중립적인 회색(라이트 `#f5f5f5` / 다크 `#1a1a1a`)이므로, 불투명도 분수는 파란 색조나 색 번짐 없이 깔끔한 무채색 레이어를 만들어냅니다. 따라서 단 하나의 유채색 강조색(`--primary: #9ed957`)은 어디에 나타나든 온전한 임팩트로 자리 잡습니다.

---

## Typography

### 폰트 패밀리

| Role | Family | Tailwind class |
|---|---|---|
| Display / Headings | Syne | `font-[Syne]` |
| Body / UI text | DM Sans | default (`font-sans`) |
| Monospace / IDs | JetBrains Mono | `font-[JetBrains_Mono,monospace]` |

### 타입 스케일

**규칙: Tailwind의 표준 타입 스케일만 사용합니다.** `text-[13px]`나 `text-[0.8rem]` 같은 임의의 값은 절대 쓰지 말고, 항상 가장 가까운 표준 클래스(`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, …)를 사용하세요. 임의의 px/rem 값은 나머지 타입 시스템과 연동되지 않아 시간이 지나면서 어긋나고, 크기를 전역적으로 재조정하는 것을 불가능하게 만듭니다. 두 단계 사이의 무언가가 필요하다면, 값을 새로 만들지 말고 둘 중 하나를 고르세요.

이는 예전에 서로 달랐던 여러 마이크로 크기(10px / 11px / 12px)가 이제 `text-xs`를 공유하고, 13px / 14px가 이제 `text-sm`을 공유한다는 것을 의미합니다. 아래의 역할들은 일회성 픽셀 크기가 아니라 굵기, 자간(tracking), 색상을 통해 서로 시각적으로 구별됩니다.

| Role | Class | Rendered size | Weight | Tracking |
|---|---|---|---|---|
| **페이지 제목** | `text-xl lg:text-3xl` | 20px / 30px (desktop) | bold | tight |
| **섹션 헤딩** | `text-xs` | 12px | semibold | 0.08em uppercase |
| **본문 텍스트** | `text-sm` | 14px | normal | default |
| **필드 값** | `text-sm font-medium` | 14px | medium | default |
| **필드 레이블** | `text-sm font-medium text-muted-foreground` | 14px | medium | default |
| **작은 레이블** | `text-xs font-medium` | 12px | medium | default |
| **미니 텍스트 / ID** | `text-xs font-semibold tracking-wider` | 12px | semibold/bold | wider |
| **마이크로 텍스트** | `text-xs font-bold` | 12px | bold | default |

### 인라인 편집 패턴

텍스트가 클릭-투-에딧(click-to-edit) 방식일 때는, 레이아웃이 흔들리지 않도록 표시 모드와 편집 모드가 동일한 타이포그래피 클래스를 공유합니다.

```tsx
const TITLE_CLASSES = "font-[Syne] text-xl lg:text-3xl font-bold leading-snug text-foreground tracking-tight w-full";

// Display
<h1 className={cn(TITLE_CLASSES, canEdit && "cursor-text hover:bg-muted/15 rounded-md px-2 -ml-2 py-1")}>{title}</h1>

// Edit
<textarea className={cn(TITLE_CLASSES, "resize-none bg-transparent outline-none py-0")} />
```

---

## Spacing & Layout

### 콘텐츠 컨테이너

```tsx
<div className="px-8 py-7 space-y-8 max-w-3xl mx-auto">
```

- **가로 패딩:** `px-8` (32px)
- **세로 패딩:** `py-7` (28px)
- **섹션 간격:** `space-y-8` (주요 섹션 사이 32px)
- **최대 콘텐츠 너비:** `max-w-3xl` (768px), `mx-auto`로 가운데 정렬

### 컴포넌트 수준의 간격

| Context | Gap | Pattern |
|---|---|---|
| 섹션 사이 | 32px | `space-y-8` |
| 섹션 내부 | 12px | `space-y-3` |
| 필드 행 사이 | 10px | `py-2.5` |
| 인라인 항목 간격 | 8–12px | `gap-2` to `gap-3` |
| 아이콘-텍스트 간격 | 6px | `gap-1.5` |

---

## Surfaces & Cards

모든 컨테이너 표면은 매우 낮은 불투명도의 레이어 방식을 따릅니다.

### 기본 카드

```tsx
<div className="rounded-xl border border-border/30 bg-card/50 divide-y divide-border/20">
```

### 호버 시 부각되는 카드

```tsx
<div className="rounded-xl border border-border/25 bg-muted/15 hover:bg-muted/25 hover:border-border/35 transition-all duration-150">
```

### 툴바 / 헤더 표면

```tsx
<div className="bg-muted/20 border-b border-border/30">
```

### 사이드바 / 보조 표면

```tsx
<div className="bg-muted/10 border-l border-border/25">
```

### 드롭 존 (빈 상태)

```tsx
<div className="rounded-xl border-2 border-dashed border-border/25 bg-muted/5 hover:border-border/40 hover:bg-muted/10 transition-all duration-200">
```

**핵심 규칙:** 보더 불투명도는 `/15`(유령처럼 희미함)부터 `/50`(호버/강조)까지 범위를 가집니다. 기본 정지 상태는 `/25`–`/30`입니다.

---

## Borders & Dividers

### 두께

- 표준 보더: `border` (1px)
- 카드 내부 구분선: `divide-y divide-border/20`
- 분리 강조선: `h-px bg-gradient-to-r from-border/40 to-transparent`

### 섹션 헤딩용 구분선 패턴

모든 섹션 헤딩에는 투명하게 사라지는 가로 그라디언트 선이 있습니다.

```tsx
<h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground/70 flex items-center gap-2">
  <span>Section Name</span>
  <div className="flex-1 h-px bg-linear-to-r from-border/40 to-transparent" />
</h3>
```

---

## Shadows & Depth

그림자는 최소한으로 사용됩니다 — 고대비 미니멀리즘은 정교한 그림자 스택이 아니라 콘텐츠 관계와 보더로 깊이를 전달합니다.

| Context | Shadow |
|---|---|
| **모달** | `shadow-[0_8px_32px_-4px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.06)]` |
| **팝오버 / 드롭다운** | `shadow-md` |
| **전송 / CTA 버튼** | `shadow-sm` |
| **완료된 체크박스** | `shadow-sm shadow-emerald-500/20` |
| **진행 바 (100%)** | `shadow-sm shadow-emerald-500/30` |
| **포커스된 입력** | `shadow-sm shadow-primary/10` |
| **island-shell** | `0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)` |

**규칙:** 파란색이나 유채색이 도는 그림자는 절대 사용하지 마세요. 모든 그림자는 낮은 불투명도의 중립적인 검정입니다.

---

## Opacity & Text Hierarchy

텍스트는 시맨틱 색상 토큰에 `/opacity` 수정자를 붙여 위계를 확립합니다.

| Level | Token | Example |
|---|---|---|
| **기본 텍스트** | `text-foreground` | 제목, 값, 본문 텍스트, 담당자 이름, 설명 콘텐츠 |
| **보조 텍스트** | `text-foreground/80` | 다이얼로그 레이블, 태그 텍스트, 브레드크럼 현재 항목 |
| **뮤트 레이블** | `text-muted-foreground` | 필드 레이블, 날짜 필, 타입/스프린트 트리거, 액티비티 헤더 |
| **보조 뮤트** | `text-muted-foreground/80` | 하위 작업 상태 필, 카운트 배지, 서식 툴바 항목 |
| **3차 뮤트** | `text-muted-foreground/70` | 섹션 헤딩, "share" 버튼, 시간 기록, 관계, 드롭 존 텍스트 |
| **플레이스홀더 텍스트** | `text-muted-foreground/60` | 해시 아이콘, "created" 날짜, 닫기 버튼, 태그 추가 트리거 |
| **은은한 텍스트** | `text-muted-foreground/50` | 빈 필드 값, "unassigned"/"no sprint", textarea 플레이스홀더 |
| **고스트 텍스트** | `text-muted-foreground/45` to `/40` | 빈 상태, 경과 시간 레이블, 마이크로 힌트 |
| **비활성** | `disabled:opacity-40` | 비활성 요소 |

**핵심 규칙:** 가독성이 최우선입니다 — 특히 다크 모드에서 `--muted-foreground`(`#7a8db3`)는 근검정 배경(`#070c18`) 위에서 이미 뮤트된 파란색입니다. 사용자가 읽어야 할 수 있는 텍스트라면 절대 `/40` 아래로 내려가지 마세요. `/45`–`/40`은 장식용이나 타임스탬프 수준의 텍스트에만 남겨 두세요. 기본 콘텐츠(`text-foreground`)와 레이블(`text-muted-foreground`)은 전체 불투명도를 사용하거나 불투명도 수정자를 아예 붙이지 않습니다.

---

## Buttons & Interactive Elements

### 고스트 버튼 (패널 내 기본 액션)

```tsx
<button className="flex items-center gap-1.5 rounded-lg bg-primary/8 text-primary/80
  hover:bg-primary/15 hover:text-primary px-2.5 py-1.5 text-sm font-semibold
  transition-all duration-150">
  <Plus className="size-3" />
  Add Task
</button>
```

### 보조 버튼

```tsx
<button className="flex items-center gap-1.5 rounded-lg bg-muted/40 text-muted-foreground/80
  hover:bg-muted/60 hover:text-foreground px-2.5 py-1.5 text-xs font-semibold
  transition-all duration-150">
```

### 아이콘 버튼

```tsx
<button className="flex size-7 items-center justify-center rounded-md
  text-muted-foreground/60 hover:text-foreground hover:bg-muted/60
  transition-all duration-150">
  <X className="size-3.5" />
</button>
```

### CTA / 제출 버튼

```tsx
<button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold
  text-primary-foreground hover:bg-primary/90 shadow-sm transition-all duration-150">
  Create field
</button>
```

### 인라인 텍스트 버튼

```tsx
<button className="text-xs text-muted-foreground/70 hover:text-foreground
  transition-colors duration-150 font-medium">
```

---

## Badges & Status Chips

### 타입 배지 (동적 색상 포함)

```tsx
<span
  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1
    text-xs font-bold leading-tight tracking-wide border"
  style={{
    borderColor: color ? `${color}44` : "var(--border)",
    backgroundColor: color ? `${color}15` : "var(--muted)",
    color: color ?? "inherit",
  }}
>
  <TypeIcon className="size-3.5 opacity-70" />
  {name}
</span>
```

### 상태 칩

```tsx
<span className="inline-flex items-center gap-2 rounded-full border border-border/40
  bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground
  tracking-wide backdrop-blur-sm">
  <span className="size-1.75 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-background"
    style={{ background: color, boxShadow: `0 0 6px ${color}40` }} />
  {name}
</span>
```

### ID 칩

```tsx
<div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1
  border border-border/30">
  <Hash className="size-3 text-muted-foreground/60" />
  <span className="font-mono text-xs font-semibold text-muted-foreground tracking-wider">
    {shortId}
  </span>
</div>
```

### 카운트 배지

```tsx
<span className="rounded-full bg-muted/60 px-2 py-0.5 text-xs font-bold
  text-muted-foreground/70 tabular-nums">
  {count}
</span>
```

---

## Avatars

### 사용자 아바타

```tsx
<div className="flex size-6 items-center justify-center rounded-full
  bg-linear-to-br from-primary/20 to-primary/10 text-primary text-xs font-bold
  ring-1 ring-primary/20">
  {initial}
</div>
```

### 비활성 아바타

```tsx
<div className="flex size-6 items-center justify-center rounded-full
  bg-linear-to-br from-muted/80 to-muted/40 text-muted-foreground text-xs font-bold
  ring-1 ring-border/25">
  {initial}
</div>
```

---

## Forms & Inputs

### 텍스트 입력

```tsx
<input className="w-full rounded-lg border border-border/30 bg-muted/15
  px-3.5 py-2.5 text-sm outline-none
  focus:border-primary/40 focus:ring-2 focus:ring-primary/15
  placeholder:text-muted-foreground/50 transition-all duration-150" />
```

### 날짜 필 입력

```tsx
<label className="inline-flex items-center gap-1.5 rounded-lg border border-border/25
  bg-muted/25 px-2.5 py-1.5 text-xs text-muted-foreground/70
  hover:border-border/50 hover:bg-muted/40 transition-all duration-150
  cursor-pointer font-medium">
  <CalendarDays className="size-3 shrink-0 opacity-70" />
  <span>{displayDate(date) ?? "Start date"}</span>
  <input type="date" className="sr-only" />
</label>
```

### 숫자 입력

```tsx
<input type="number" className="w-16 rounded-lg border border-border/30 bg-muted/25
  px-2.5 py-1 text-sm text-center tabular-nums font-medium
  focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-150" />
```

---

## Checkboxes

### 표준 체크박스

```tsx
<button className={cn(
  "flex size-4.5 shrink-0 items-center justify-center rounded-[5px]
    border-2 transition-all duration-200",
  checked
    ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
    : "border-border/40 text-transparent hover:border-border/70 hover:bg-muted/40"
)}>
  <Check className="size-2.5" strokeWidth={3} />
</button>
```

### 점선 플레이스홀더 체크박스 ("항목 추가" 행용)

```tsx
<div className="size-4.5 shrink-0 rounded-[5px] border-2 border-dashed border-border/25" />
```

---

## Progress Bars

```tsx
<div className="h-1.5 rounded-full bg-border/25 overflow-hidden">
  <div className={cn(
    "h-full rounded-full transition-all duration-500 ease-out",
    pct === 100
      ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
      : "bg-primary/60"
  )} style={{ width: `${pct}%` }} />
</div>
```

---

## Tags / Pills

### 태그

```tsx
<span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5
  text-xs font-medium text-foreground/80 border border-border/20
  hover:border-border/40 transition-colors duration-150">
  {tag}
  <button className="text-muted-foreground/60 hover:text-destructive transition-colors duration-150">
    <X className="size-2.5" />
  </button>
</span>
```

### 태그 추가 트리거

```tsx
<button className="inline-flex items-center gap-1 rounded-md border border-dashed
  border-border/30 px-2 py-0.5 text-xs text-muted-foreground/60
  hover:border-border/60 hover:text-muted-foreground transition-all duration-150">
  <Plus className="size-2.5" />
  Add tag
</button>
```

---

## Popovers & Dropdowns

### 팝오버 컨테이너

```tsx
<PopoverContent className="w-52 p-1 rounded-xl border border-border/40 shadow-lg" align="start">
```

### 팝오버 항목

```tsx
<button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm
  hover:bg-muted/60 transition-colors duration-100">
  <Icon className="size-3.5 text-muted-foreground/80 shrink-0" />
  <span className="flex-1 text-left">{label}</span>
  {selected && <Check className="size-3.5 text-primary" />}
</button>
```

---

## Section Headings

모든 콘텐츠 섹션은 동일한 헤딩 패턴을 사용합니다 — 대문자 마이크로 텍스트와 뒤따르는 그라디언트 선입니다.

```tsx
<h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground/70
  mb-3 flex items-center gap-2">
  <span>Section Name</span>
  <div className="flex-1 h-px bg-linear-to-r from-border/40 to-transparent" />
</h3>
```

이 헤딩은 `primitives.tsx`의 `SectionHeading` 프리미티브가 렌더링합니다.

---

## Field Rows

속성 행은 고정 레이블 열과 유연한 값 열로 구성된 CSS 그리드를 사용합니다.

```tsx
<div className="grid grid-cols-[9.5rem_1fr] items-center gap-4 py-2.5 px-1
  group/field rounded-lg hover:bg-muted/30 transition-colors duration-150">
  <span className="text-sm font-medium text-muted-foreground leading-snug select-none">
    {label}
  </span>
  <div className="min-w-0">{children}</div>
</div>
```

빈 값: `<span className="text-sm text-muted-foreground/50 italic">Empty</span>`

---

## Empty States

빈 상태는 둥근 컨테이너 안의 아이콘과 가운데 정렬된 텍스트를 사용합니다.

```tsx
<div className="flex flex-col items-center py-8 text-muted-foreground/40">
  <Icon className="size-6 mb-2" />
  <p className="text-xs font-medium">No items yet</p>
</div>
```

인라인 빈 상태의 경우:

```tsx
<div className="flex items-center gap-3 px-1 py-3 text-muted-foreground/45">
  <ListChecks className="size-4 opacity-70" />
  <p className="text-sm italic">No subtasks yet</p>
</div>
```

### 클릭 가능한 빈 상태 (드롭 존 / 추가 플레이스홀더)

```tsx
<button className="w-full rounded-xl border-2 border-dashed p-8 text-center
  transition-all duration-200 cursor-pointer group/drop
  border-border/20 bg-muted/5 text-muted-foreground/50
  hover:border-border/40 hover:bg-muted/10">
  <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl
    bg-muted/30 text-muted-foreground/45 transition-all duration-200
    group-hover/drop:bg-muted/40 group-hover/drop:text-muted-foreground/70">
    <Paperclip className="size-5" />
  </div>
  <p className="text-sm font-medium text-muted-foreground/70 group-hover/drop:text-muted-foreground transition-colors">
    Drop your files here to upload
  </p>
  <p className="text-xs mt-1.5 text-muted-foreground/45 transition-colors">
    or click to browse
  </p>
</button>
```

드래그 활성 상태에서는 `border-primary/50 bg-primary/5 text-primary shadow-sm shadow-primary/10`으로 교체하세요.

---

## Modals & Dialogs

### 백드롭

```tsx
<div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[3px]
  transition-opacity duration-200" />
```

### 모달 패널

```tsx
<div role="dialog" aria-modal="true"
  className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2
    flex h-[90vh] w-[92vw] max-w-6xl flex-col overflow-hidden
    rounded-xl border border-border/50 bg-background
    shadow-[0_8px_32px_-4px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.06)]
    transition-all duration-200 origin-center">
```

### 진입 애니메이션

```tsx
// Open
"opacity-100 scale-100"
// Closed
"opacity-0 scale-[0.97] pointer-events-none"
```

### 다이얼로그 (중첩, 예: "Add Field")

```tsx
<div className="relative z-10 w-full max-w-sm rounded-xl border border-border/40
  bg-background p-6
  shadow-[0_8px_32px_-4px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.05)]">
```

---

## Side Panels

### 구조

```tsx
<div className="flex w-80 shrink-0 flex-col overflow-hidden border-l border-border/25 bg-muted/10">
  {/* Header */}
  <div className="flex shrink-0 items-center gap-2.5 border-b border-border/25 px-5 py-3 bg-muted/20">
    ...
  </div>

  {/* Scrollable content */}
  <ScrollArea className="flex-1 px-4 py-4">...</ScrollArea>

  {/* Fixed footer / input */}
  <div className="shrink-0 border-t border-border/25 p-3 bg-background/50">...</div>
</div>
```

---

## Activity Feed

### 액티비티 항목 (댓글 아님)

```tsx
<div className="flex gap-3">
  <div className="flex size-6 shrink-0 items-center justify-center rounded-full
    bg-muted/40 text-muted-foreground/80 ring-1 ring-border/20">
    {initial}
  </div>
  <div className="flex flex-wrap items-baseline gap-1.5 py-0.5">
    <span className="text-xs font-medium text-foreground/80">{author}</span>
    <span className="text-xs text-muted-foreground/70">{content}</span>
    <span className="text-xs text-muted-foreground/45">{timeAgo}</span>
  </div>
</div>
```

### 액티비티 항목 (댓글)

```tsx
<div className="flex gap-3">
  <div className="flex size-6 shrink-0 items-center justify-center rounded-full
    bg-linear-to-br from-primary/20 to-primary/10 text-primary ring-1 ring-primary/15">
    {initial}
  </div>
  <div className="rounded-xl rounded-tl-lg border border-border/25 bg-card/70 px-3.5 py-2.5">
    <div className="mb-1 flex items-center gap-2">
      <span className="text-xs font-semibold text-foreground">{author}</span>
      <span className="text-xs text-muted-foreground/50">{timeAgo}</span>
    </div>
    <p className="text-sm text-foreground leading-relaxed">{content}</p>
  </div>
</div>
```

### 댓글 입력

댓글은 일반 `<textarea>`가 아니라 리치 텍스트(BlockNote `CommentEditor`)입니다. 에디터는 자체 테두리가 있는 필드셋 안에 자리하며, 전송 버튼과 "⌘↵ to send" 힌트는 그 아래 행에 위치합니다.

```tsx
<fieldset className={cn(
  "rounded-xl border border-border/30 bg-card/80 transition-all duration-200 overflow-hidden",
  focused && "border-primary/25 shadow-sm shadow-primary/5",
  "[&_.bn-editor]:min-h-6 [&_.bn-editor]:max-h-48 [&_.bn-editor]:overflow-y-auto",
  "[&_.bn-editor]:py-1.5 [&_.bn-editor]:px-3 [&_.bn-editor]:text-sm [&_.bn-editor]:leading-relaxed",
)}>
  <CommentEditor ref={editorRef} initialBlocks={blocks} onSubmit={handleSend} />
</fieldset>
<div className="flex items-center justify-between">
  {focused && (
    <p className="text-xs text-muted-foreground/40 pl-1">⌘↵ to send</p>
  )}
  <button className="flex size-7 shrink-0 items-center justify-center rounded-lg
    bg-primary text-primary-foreground shadow-sm hover:bg-primary/90
    disabled:opacity-40 transition-all duration-150 ml-auto">
    <Send className="size-3" />
  </button>
</div>
```

---

## Scrollbars

콘텐츠 영역용 커스텀 표시 스크롤바:

```tsx
<div className="flex-1 overflow-y-auto [scrollbar-gutter:stable]
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-transparent
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-border/60
  [&::-webkit-scrollbar-thumb]:hover:bg-border">
```

자동 숨김이 허용되는 사이드 패널에는 `@/components/ui/scroll-area`의 `<ScrollArea>`를 사용하세요.

---

## Transitions & Animations

### 기본 트랜지션

```tsx
transition-all duration-150
```

호버 상태, 배경 변화, 보더 색상 전환에 사용하세요.

### 중간 트랜지션

```tsx
transition-all duration-200
```

모달 열기/닫기, 입력 포커스 링, 컴포넌트 가시성 변화에 사용하세요.

### 긴 트랜지션 (진행 바, 레이아웃 이동)

```tsx
transition-all duration-500 ease-out
```

### 호버 노출 패턴

호버 시 나타나야 하는 요소는 불투명도 트랜지션을 사용합니다.

```tsx
// The element
<span className="opacity-0 group-hover/parent:opacity-100 transition-opacity duration-200">

// The parent needs a group name
<div className="group/parent">
```

### 진입 애니메이션 (페이지 수준)

```tsx
<div className="rise-in">  // uses @keyframes rise-in from index.css
```

---

## File Patterns

### 컴포넌트 구조

각 주요 UI 섹션은 명확한 prop 인터페이스를 갖춘 자체 파일입니다.

```
section-name.tsx       → Main section component
section-name-row.tsx   → Repeated row item (if applicable)
primitives.tsx         → Shared layout primitives (FieldRow, FieldValue, SectionHeading)
helpers.ts             → Pure formatting/display functions
types.ts               → TypeScript interfaces
```

### 공유 프리미티브

일관된 레이아웃을 위해 항상 `primitives.tsx`의 프리미티브를 사용하세요.

- `FieldRow` — 레이블 + 값 그리드 행
- `FieldValue` — 빈 상태를 포함한 서식화된 값
- `SectionHeading` — 그라디언트 구분선이 있는 대문자 헤딩

### 호버 패턴

| Pattern | Class |
|---|---|
| **행 호버** | `hover:bg-muted/30` |
| **카드 호버** | `hover:bg-muted/25 hover:border-border/35` |
| **버튼 호버** | `hover:bg-muted/60 hover:text-foreground` |
| **텍스트 호버** | `hover:text-foreground` |
| **인터랙티브 노출** | `opacity-0 group-hover:opacity-100` |

### 아이콘 크기

| Context | Size |
|---|---|
| 텍스트와 인라인 | `size-3` (12px) |
| 표준 버튼 | `size-3.5` (14px) |
| 기능/빈 상태 | `size-4` to `size-5` (16–20px) |
| 대형 일러스트레이션 | `size-7` (28px) |
| 상태 점 | `size-[7px]` |
| 체크박스 체크마크 | `size-2.5` (10px) |
