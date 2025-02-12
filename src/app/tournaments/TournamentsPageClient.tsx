"use client";

import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Match } from "@/types";
import MatchCard from "@/components/features/Matches/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CupBracket from "@/components/features/Cup/CupBracket";
import { useLanguage } from "@/context/LanguageContext";

const tournamentTranslations = {
  en: {
    title: "Rugby Tournaments",
    subtitle: "Follow all our exciting rugby competitions",
    season: "Season",
    seasonDescription: "Current season featuring Championship, Sevens, and Cup competitions.",
    upcomingMatches: "Upcoming Matches",
    noUpcomingMatches: "No upcoming matches scheduled.",
    cupPlayoffBracket: "Cup Playoff Bracket",
    cupDescription: "Current cup competition playoff structure",
    tournaments: {
      championship: "Championship",
      sevens: "Sevens",
      cup: "Cup"
    },
    tableHeaders: {
      position: "Pos",
      team: "Team",
      played: "P",
      won: "W",
      drawn: "D",
      lost: "L",
      pointsFor: "PF",
      tryBonusPoints: "TBP",
      losingBonusPoints: "LBP",
      totalPoints: "PTS"
    }
  },
  lv: {
    title: "Regbija Turnīri",
    subtitle: "Seko līdzi mūsu aizraujošajām regbija sacensībām",
    season: "Sezona",
    seasonDescription: "Pašreizējā sezona, kurā ietilpst Čempionāts, Septiņi un Kauss.",
    upcomingMatches: "Gaidāmās Spēles",
    noUpcomingMatches: "Nav ieplānotu gaidāmo spēļu.",
    cupPlayoffBracket: "Kausa Izslēgšanas Spēļu Tabula",
    cupDescription: "Pašreizējā kausa sacensību izslēgšanas struktūra",
    tournaments: {
      championship: "Čempionāts",
      sevens: "Septiņi",
      cup: "Kauss"
    },
    tableHeaders: {
      position: "Poz",
      team: "Komanda",
      played: "S",
      won: "U",
      drawn: "N",
      lost: "Z",
      pointsFor: "PG",
      tryBonusPoints: "MBP",
      losingBonusPoints: "ZBP",
      totalPoints: "PKT"
    }
  }
};

interface TournamentsPageClientProps {
  championshipSeason: { name: string } | null;
  championshipStandings: any[];
  sevensStandings: any[];
  cupMatches: any[];
  upcomingMatches: Match[];
}

export default function TournamentsPageClient({
  championshipSeason,
  championshipStandings,
  sevensStandings,
  cupMatches,
  upcomingMatches
}: TournamentsPageClientProps) {
  const { language } = useLanguage();
  const t = tournamentTranslations[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 bg-rugby-teal overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Main large rugby ball */}
          <div className="absolute transform -rotate-45 left-1/4 top-1/4">
            <div className="w-[90px] h-[40px] md:w-[120px] md:h-[50px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Smaller rugby ball top right */}
          <div className="absolute transform rotate-12 right-1/4 top-8">
            <div className="w-[70px] h-[30px] md:w-[90px] md:h-[35px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Small rugby ball bottom left */}
          <div className="absolute transform -rotate-20 left-16 bottom-8">
            <div className="w-[50px] h-[22px] md:w-[60px] md:h-[25px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Extra small ball top left */}
          <div className="absolute transform rotate-45 hidden md:block left-16 top-12">
            <div className="w-[40px] h-[18px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Medium ball bottom right */}
          <div className="absolute transform -rotate-12 hidden md:block right-20 bottom-16">
            <div className="w-[100px] h-[40px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Small ball center right */}
          <div className="absolute transform rotate-30 hidden lg:block right-1/3 top-1/3">
            <div className="w-[70px] h-[28px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Tiny ball top center */}
          <div className="absolute transform -rotate-15 hidden lg:block left-1/2 top-8">
            <div className="w-[45px] h-[20px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
        </div>
        <div className="relative container-width mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-width py-12">
        {/* Season Overview */}
        <section className="mb-12">
          <Card className="p-6 bg-white dark:bg-card-bg-dark shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-6 w-6 text-rugby-teal" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t.season} {championshipSeason?.name || "2023/24"}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t.seasonDescription}
            </p>
          </Card>
        </section>

        {/* Tournament Tables */}
        <section className="mb-12">
          <Tabs defaultValue="championship" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="championship">{t.tournaments.championship}</TabsTrigger>
              <TabsTrigger value="sevens">{t.tournaments.sevens}</TabsTrigger>
              <TabsTrigger value="cup">{t.tournaments.cup}</TabsTrigger>
            </TabsList>

            <TabsContent value="championship">
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-rugby-teal/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-rugby-teal uppercase tracking-wider w-12">
                          {t.tableHeaders.position}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-rugby-teal uppercase tracking-wider">
                          {t.tableHeaders.team}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-rugby-teal uppercase tracking-wider w-12">
                          {t.tableHeaders.played}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-rugby-teal uppercase tracking-wider w-12">
                          {t.tableHeaders.won}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-rugby-teal uppercase tracking-wider w-12">
                          {t.tableHeaders.drawn}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-rugby-teal uppercase tracking-wider w-12">
                          {t.tableHeaders.lost}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-rugby-teal uppercase tracking-wider w-16">
                          {t.tableHeaders.pointsFor}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-rugby-teal uppercase tracking-wider w-12">
                          {t.tableHeaders.tryBonusPoints}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-rugby-teal uppercase tracking-wider w-12">
                          {t.tableHeaders.losingBonusPoints}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-rugby-teal uppercase tracking-wider w-16">
                          {t.tableHeaders.totalPoints}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-card-bg-dark divide-y divide-gray-200 dark:divide-gray-700">
                      {championshipStandings?.map((team, index) => (
                        <tr
                          key={team.team_name}
                          className={`
                            ${
                              index % 2 === 0
                                ? "bg-white dark:bg-gray-900"
                                : "bg-rugby-teal/5 dark:bg-gray-800/50"
                            } 
                            hover:bg-rugby-teal/10 dark:hover:bg-rugby-teal/10 transition-colors
                          `}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                            {team.position}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {team.team_name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                            {team.played}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                            {team.won}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                            {team.drawn}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                            {team.lost}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                            {team.points_for}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                            {team.try_bonus_points}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                            {team.losing_bonus_points}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-rugby-teal text-center">
                            {team.total_points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="sevens">
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-rugby-teal/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-rugby-teal uppercase tracking-wider w-12">
                          {t.tableHeaders.position}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-rugby-teal uppercase tracking-wider">
                          {t.tableHeaders.team}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-rugby-teal uppercase tracking-wider w-12">
                          {t.tableHeaders.played}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-rugby-teal uppercase tracking-wider w-12">
                          {t.tableHeaders.won}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-rugby-teal uppercase tracking-wider w-12">
                          {t.tableHeaders.drawn}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-rugby-teal uppercase tracking-wider w-12">
                          {t.tableHeaders.lost}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-rugby-teal uppercase tracking-wider w-16">
                          {t.tableHeaders.totalPoints}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-card-bg-dark divide-y divide-gray-200 dark:divide-gray-700">
                      {sevensStandings?.map((team, index) => (
                        <tr
                          key={team.team_name}
                          className={`
                            ${
                              index % 2 === 0
                                ? "bg-white dark:bg-gray-900"
                                : "bg-rugby-teal/5 dark:bg-gray-800/50"
                            } 
                            hover:bg-rugby-teal/10 dark:hover:bg-rugby-teal/10 transition-colors
                          `}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                            {team.position}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {team.team_name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                            {team.played}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                            {team.won}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                            {team.drawn}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                            {team.lost}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-rugby-teal text-center">
                            {team.total_points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="cup">
              <Card className="overflow-hidden p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {t.cupPlayoffBracket}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t.cupDescription}
                  </p>
                </div>
                <CupBracket matches={cupMatches || []} />
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Upcoming Matches */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t.upcomingMatches}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.map((match: Match, index: number) => (
              <MatchCard
                key={`upcoming_${match.id}_${index}`}
                match={match}
                isLocalMatch={true}
                variant="default"
              />
            ))}
            {upcomingMatches.length === 0 && (
              <p className="text-muted-foreground">
                {t.noUpcomingMatches}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
} 