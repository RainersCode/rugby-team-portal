export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  image: string;
  date: string;
}

export const articles: Article[] = [
  {
    id: 1,
    title: 'Team Secures Victory in Season Opener',
    slug: 'team-secures-victory-season-opener',
    content: `
      <p>In a thrilling season opener, our team demonstrated their prowess on the field with a convincing victory. The match, played in front of a capacity crowd, showcased the results of months of intensive preparation and training.</p>

      <p>The first half saw our team dominate possession, with the forward pack providing a solid platform for the backs to execute their attacking plays. The breakthrough came in the 23rd minute when our fly-half orchestrated a brilliant move that resulted in the first try of the match.</p>

      <p>The second half continued in much the same vein, with our defense proving impenetrable and our attack clinical. The final score reflected the team's superiority and sets a positive tone for the season ahead.</p>

      <h2>Key highlights:</h2>
      <ul>
        <li>3 tries scored</li>
        <li>85% tackle success rate</li>
        <li>65% possession</li>
        <li>0 injuries</li>
      </ul>

      <p>The coaching staff expressed satisfaction with the performance while acknowledging there's still room for improvement. The team will now focus on preparing for next week's away fixture.</p>
    `,
    image: 'https://picsum.photos/seed/news1/1920/1080',
    date: '2024-01-28T10:00:00Z',
  },
  {
    id: 2,
    title: 'Youth Development Program Shows Promise',
    slug: 'youth-development-program-shows-promise',
    content: `
      <p>Our youth development program continues to show impressive results as several young players make significant strides in their rugby careers. The structured approach to player development is bearing fruit, with multiple academy graduates now pushing for first-team positions.</p>

      <p>The program, which focuses on both technical skills and character development, has been praised by rugby development officers and scouts from professional clubs. This season has seen a record number of youth players being selected for regional representative teams.</p>

      <h2>Program Highlights:</h2>
      <ul>
        <li>5 players selected for regional teams</li>
        <li>Improved training facilities</li>
        <li>New specialist coaching staff</li>
        <li>Enhanced player welfare support</li>
      </ul>

      <p>The success of the youth program is a testament to the club's long-term vision and commitment to developing local talent. We look forward to seeing these young players continue their development and potentially represent the first team in the future.</p>
    `,
    image: 'https://picsum.photos/seed/news2/1920/1080',
    date: '2024-01-25T14:30:00Z',
  },
]; 