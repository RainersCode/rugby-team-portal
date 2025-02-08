import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, Award } from "lucide-react";

export default async function CupPage() {
  // Placeholder data - replace with actual data from your database
  const cupData = {
    currentStage: "Quarter Finals",
    matches: [
      {
        round: "Quarter Finals",
        date: "2024-03-20",
        homeTeam: "Team A",
        awayTeam: "Team B",
        venue: "Main Stadium",
        time: "15:00",
      },
      {
        round: "Quarter Finals",
        date: "2024-03-21",
        homeTeam: "Team C",
        awayTeam: "Team D",
        venue: "City Ground",
        time: "17:00",
      },
      // Add more matches as needed
    ],
    pastWinners: [
      { year: "2023", team: "Team A" },
      { year: "2022", team: "Team C" },
      { year: "2021", team: "Team B" },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 bg-rugby-teal overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute transform rotate-45 left-1/4 top-1/4">
            <div className="w-96 h-96 rounded-full bg-rugby-yellow"></div>
          </div>
        </div>
        <div className="relative container-width mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Rugby Cup
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            The most prestigious knockout competition in club rugby
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-width py-12">
        {/* Current Stage */}
        <section className="mb-12">
          <Card className="p-6 bg-white dark:bg-card-bg-dark shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-6 w-6 text-rugby-teal" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {cupData.currentStage}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Current stage of the Rugby Cup competition. Winners advance to the
              semi-finals.
            </p>
          </Card>
        </section>

        {/* Upcoming Matches */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Fixtures
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cupData.matches.map((match, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge
                    variant="outline"
                    className="bg-rugby-teal/10 text-rugby-teal"
                  >
                    {match.round}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-rugby-teal" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(match.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-center">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{match.venue}</span>
                    </div>
                    <span>{match.time}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Past Winners */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Past Winners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cupData.pastWinners.map((winner) => (
              <Card key={winner.year} className="p-6">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-rugby-teal" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {winner.year}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {winner.team}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
