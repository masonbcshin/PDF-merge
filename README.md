# PDF Merger Pro

무료 온라인 PDF 병합 도구입니다. 모든 파일이 브라우저에서만 처리되어 100% 안전합니다.

![PDF Merger Pro](./public/og-image.png)

## 주요 기능

- **100% 클라이언트 사이드 처리**: 파일이 서버에 업로드되지 않습니다
- **Web Worker 기반 병합**: UI가 멈추지 않고 부드러운 사용자 경험 제공
- **드래그 앤 드롭**: 직관적인 파일 순서 변경
- **페이지 선택 병합**: 특정 페이지만 선택하여 병합 가능
- **템플릿 시스템**: 자주 사용하는 문서 조합을 빠르게 선택
- **반응형 디자인**: 모바일/데스크톱 모두 지원

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: TailwindCSS
- **PDF 처리**: pdf-lib
- **드래그 앤 드롭**: @dnd-kit/core, @dnd-kit/sortable
- **파일 업로드**: react-dropzone
- **아이콘**: lucide-react

## 시작하기

### 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

### 환경 변수 (선택사항)

`.env.local` 파일을 생성하고 필요한 환경 변수를 설정하세요:

```env
# 카카오 공유 기능 (선택)
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_app_key

# Google Analytics (선택)
NEXT_PUBLIC_GA_ID=your_ga_measurement_id
```

## Vercel 배포

1. GitHub에 코드를 push합니다
2. [Vercel](https://vercel.com)에서 프로젝트를 Import합니다
3. 환경 변수를 설정합니다 (선택사항)
4. Deploy 버튼을 클릭합니다

### 배포 후 테스트 체크리스트

- [ ] PDF 파일 업로드 가능 확인
- [ ] 여러 파일 드래그 앤 드롭 동작 확인
- [ ] 파일 순서 변경 동작 확인
- [ ] PDF 병합 및 다운로드 정상 동작 확인
- [ ] 모바일 반응형 레이아웃 확인
- [ ] 프라이버시 배지 모달 동작 확인

## 프라이버시 안내

**이 서비스는 모든 파일을 브라우저에서만 처리합니다.**

- 파일이 서버로 전송되지 않습니다
- 네트워크 탭에서 파일 업로드 요청이 없음을 확인할 수 있습니다
- pdf-lib 라이브러리를 사용한 클라이언트 사이드 처리
- Web Worker로 메인 스레드와 분리하여 UI 블로킹 방지

## 보안 및 운영 주의사항

### localStorage 기반 프리미엄 시스템

- 공유 보상으로 제공되는 프리미엄 크레딧은 localStorage에 저장됩니다
- **경고**: 클라이언트에서 조작이 가능하므로 프로덕션 환경에서는 서버 측 검증을 권장합니다
- 현재 구현은 데모/MVP 목적으로만 사용하세요

### 메모리 제한

- 대용량 PDF 파일 병합 시 브라우저 메모리 한계에 도달할 수 있습니다
- 권장 최대 총 파일 크기: 무료 50MB, 프리미엄 200MB
- 파일 수 제한: 최대 50개
- 메모리 부족 시 브라우저 탭이 충돌할 수 있습니다

### 민감한 문서 처리

- 의료, 법률, 금융 등 민감한 문서는 로컬 전용 아키텍처를 권장합니다
- 본 서비스는 문서 내용을 서버로 전송하지 않지만, 추가적인 보안이 필요한 경우 오프라인 도구 사용을 고려하세요

## 테스트

### 유닛 테스트

```bash
npm run test
```

주요 테스트 대상:
- `pdfUtils.getPDFPageCount`: PDF 페이지 수 확인
- `pdfUtils.formatFileSize`: 파일 크기 포맷팅
- `errorHandler.getErrorMessage`: 에러 메시지 변환

### E2E 테스트 (권장)

Playwright를 사용한 E2E 테스트 권장:

```bash
npx playwright test
```

테스트 시나리오:
1. 파일 업로드
2. 파일 순서 변경
3. PDF 병합
4. 다운로드 확인

## 프로젝트 구조

```
pdf-merger-pro/
├── app/
│   ├── globals.css         # 전역 스타일
│   ├── layout.tsx          # 레이아웃 및 메타데이터
│   ├── page.tsx            # 메인 페이지
│   ├── pdf-worker.ts       # Web Worker
│   └── sitemap.ts          # 사이트맵 생성
├── components/
│   ├── FileUploader.tsx    # 파일 업로드 컴포넌트
│   ├── PDFList.tsx         # 파일 목록 (드래그 정렬)
│   ├── PrivacyBadge.tsx    # 프라이버시 배지
│   ├── ShareModal.tsx      # 공유 모달
│   └── TemplateSelector.tsx # 템플릿 선택
├── lib/
│   ├── errorHandler.ts     # 에러 처리 유틸
│   ├── pdfUtils.ts         # PDF 처리 유틸
│   ├── shareTracking.ts    # 공유 추적 (localStorage)
│   └── templates.ts        # 템플릿 데이터
├── types/
│   └── pdf.ts              # TypeScript 타입 정의
├── public/
│   └── robots.txt          # 크롤러 설정
├── next.config.js          # Next.js 설정
├── tailwind.config.ts      # TailwindCSS 설정
└── tsconfig.json           # TypeScript 설정
```

## OG 이미지 추가

`public/og-image.png` 위치에 1200x630 픽셀의 이미지를 추가하세요.

권장 내용:
- 로고
- "PDF Merger Pro" 텍스트
- "무료 온라인 PDF 병합" 서브 텍스트
- 프라이버시 아이콘

## 라이선스

MIT License

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 문의

이슈나 제안사항이 있으시면 GitHub Issues를 이용해주세요.
