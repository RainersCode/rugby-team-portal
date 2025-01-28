Set up the page structure according to the following prompt:
   
<page-structure-prompt>
Next.js route structure based on navigation menu items (excluding main route). Make sure to wrap all routes with the component:

Routes:
- /news
- /team
- /shop
- /matches
- /members
- /club

Page Implementations:
/news:
Core Purpose: Display latest news, updates, and articles about the club
Key Components
- NewsGrid: Grid of news article cards
- FeaturedNews: Highlighted stories carousel
- NewsFilter: Category and date filters
- NewsSearch: Search functionality
Layout Structure
- Header with featured news
- Filter bar
- Main content grid (3 columns desktop, 2 tablet, 1 mobile)
- Pagination footer

/team:
Core Purpose: Showcase current squad and staff
Key Components
- PlayerGrid: Display of player cards
- PlayerFilter: Position

/role filters
- PlayerDetails: Individual player stats
- StaffSection: Technical staff listing
Layout Structure:
- Squad overview header
- Filter options
- Player grid (4 columns desktop, 3 tablet, 2 mobile)
- Staff section below

/shop:
Core Purpose: E-commerce platform for club merchandise
Key Components
- ProductGrid: Product display
- ShoppingCart: Cart management
- ProductFilters: Category

/price filters
- CheckoutFlow: Purchase process
Layout Structure:
- Shop categories header
- Sidebar filters (collapsible on mobile)
- Product grid (4 columns desktop, 3 tablet, 2 mobile)
- Floating cart

/matches:
Core Purpose: Display fixture list and match results
Key Components
- FixtureList: Upcoming matches
- ResultsTable: Past match results
- MatchStats: Detailed match statistics
- Calendar: Match schedule view
Layout Structure
- Toggle between fixtures

/members:
Core Purpose: Member portal and benefits information
Key Components
- MembershipTiers: Available plans
- BenefitsTable: Membership perks
- SignupForm: Registration
- MemberDashboard: For logged-in users
Layout Structure
- Benefits overview
- Membership options (cards)
- Sign-up section
- Member-only content area

/club:
Core Purpose: Club information and history
Key Components
- Timeline: Historical milestones
- TrophyCase: Awards showcase
- ClubInfo: About section
- StadiumInfo: Venue details
Layout Structure
- Hero section with club motto
- History timeline
- Info sections in cards
- Stadium virtual tour

Layouts:
MainLayout:
- Applicable routes: All routes
- Core components
  - Navigation header
  - Footer
  - Sidebar (where applicable)
  - Breadcrumbs
- Responsive behavior
  - Collapsible menu on mobile
  - Fluid container widths
  - Sticky header
  - Mobile-first approach

ShopLayout
- Applicable routes: /shop
- Core components
  - Cart sidebar
  - Category navigation
  - Search bar
- Responsive behavior
  - Floating cart on desktop
  - Bottom sheet cart on mobile
  - Collapsible filters

MemberLayout
- Applicable routes: /members
- Core components
  - Member navigation
  - Profile section
  - Notifications
- Responsive behavior
  - Dashboard sidebar on desktop
  - Bottom navigation on mobile
  - Responsive forms
</page-structure-prompt>