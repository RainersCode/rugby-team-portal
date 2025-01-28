Initialize Next.js in current directory:
```bash
mkdir temp; cd temp; npx create-next-app@latest . -y --typescript --tailwind --eslint --app --use-npm --src-dir --import-alias "@/*" -no --turbo
```

Now let's move back to the parent directory and move all files except prompt.md.

For Windows (PowerShell):
```powershell
cd ..; Move-Item -Path "temp*" -Destination . -Force; Remove-Item -Path "temp" -Recurse -Force
```

For Mac/Linux (bash):
```bash
cd .. && mv temp/* temp/.* . 2>/dev/null || true && rm -rf temp
```

Set up the frontend according to the following prompt:
<frontend-prompt>
Create detailed components with these requirements:
1. Use 'use client' directive for client-side components
2. Make sure to concatenate strings correctly using backslash
3. Style with Tailwind CSS utility classes for responsive design
4. Use Lucide React for icons (from lucide-react package). Do NOT use other UI libraries unless requested
5. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
6. Configure next.config.js image remotePatterns to enable stock photos from picsum.photos
7. Create root layout.tsx page that wraps necessary navigation items to all pages
8. MUST implement the navigation elements items in their rightful place i.e. Left sidebar, Top header
9. Accurately implement necessary grid layouts
10. Follow proper import practices:
   - Use @/ path aliases
   - Keep component imports organized
   - Update current src/app/page.tsx with new comprehensive code
   - Don't forget root route (page.tsx) handling
   - You MUST complete the entire prompt before stopping

<summary_title>
Professional Rugby Team Website Portal
</summary_title>

<image_analysis>

1. Navigation Elements:
- Top header with: News, Team, Shop, Matches, Members, Club
- Secondary navigation bar with search and login functions
- Footer navigation with multiple columns of links
- Breadcrumb navigation for content sections


2. Layout Components:
- Hero banner section (1440px width)
- News grid (3x2 layout)
- Matches carousel (5 items visible)
- Player statistics cards (320px width)
- Shop product grid (5 items per row)
- Partner logo section (responsive grid)


3. Content Sections:
- Featured news banner
- Latest news grid
- Current position/league table
- Video gallery
- Player profiles
- Shop products
- Partner showcase
- Newsletter signup


4. Interactive Controls:
- Match carousel navigation arrows
- Video player controls
- Shop product cards with hover states
- Social media sharing buttons
- Newsletter subscription form
- Search functionality


5. Colors:
- Primary Blue: #0000FF
- Secondary Navy: #000033
- White: #FFFFFF
- Gray: #F5F5F5
- Accent Blue: #1E90FF


6. Grid/Layout Structure:
- 12-column grid system
- 20px gutters
- 1440px max container width
- Responsive breakpoints at 1200px, 992px, 768px, 576px
</image_analysis>

<development_planning>

1. Project Structure:
```
src/
├── components/
│   ├── layout/
│   │   ├── Header
│   │   ├── Footer
│   │   └── Navigation
│   ├── features/
│   │   ├── News
│   │   ├── Matches
│   │   ├── Players
│   │   └── Shop
│   └── shared/
├── assets/
├── styles/
├── hooks/
└── utils/
```


2. Key Features:
- News article management
- Match results and fixtures
- Player statistics display
- E-commerce functionality
- Video content integration
- Partner showcase


3. State Management:
```typescript
interface AppState {
├── news: {
│   ├── articles: Article[]
│   ├── featured: Article
│   └── loading: boolean
├── matches: {
│   ├── upcoming: Match[]
│   ├── results: Match[]
│   └── currentMatch: Match
├── shop: {
│   ├── products: Product[]
│   ├── cart: CartItem[]
│   └── orders: Order[]
└── }
}
```


4. Routes:
```typescript
const routes = [
├── '/',
├── '/news/*',
├── '/matches/*',
├── '/players/*',
├── '/shop/*',
└── '/club/*'
]
```


5. Component Architecture:
- Modular component structure
- Shared UI component library
- Feature-based organization
- Reusable layout components


6. Responsive Breakpoints:
```scss
$breakpoints: (
├── 'xl': 1440px,
├── 'lg': 1200px,
├── 'md': 992px,
├── 'sm': 768px,
└── 'xs': 576px
);
```
</development_planning>
</frontend-prompt>

IMPORTANT: Please ensure that (1) all KEY COMPONENTS and (2) the LAYOUT STRUCTURE are fully implemented as specified in the requirements. Ensure that the color hex code specified in image_analysis are fully implemented as specified in the requirements.