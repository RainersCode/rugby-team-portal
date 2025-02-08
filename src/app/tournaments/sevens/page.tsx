import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, Medal, MapPin } from "lucide-react";

export default async function SevensPage() {
  // Placeholder data - replace with actual data from your database
  const sevensData = {
    upcomingTournament: {
      name: "Spring Sevens Series",
      date: "2024-04-15",
      venue: "City Sports Complex",
      teams: 16,
      poolStage: true,
    },
    tournaments: [
      {
        name: "Summer Sevens Cup",
        date: "2024-06-20",
        venue: "Beach Arena",
        status: "Registration Open",
      },
      {
        name: "Regional Sevens",
        date: "2024-07-15",
        venue: "University Ground",
        status: "Coming Soon",
      },
    ],
    rankings: [
      { position: 1, team: "Team A", points: 85 },
      { position: 2, team: "Team B", points: 72 },
      { position: 3, team: "Team C", points: 68 },
      // Add more teams as needed
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
            Rugby Sevens
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Fast-paced, exciting seven-a-side rugby tournaments
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-width py-12">
        {/* Next Tournament */}
        <section className="mb-12">
          <Card className="p-6 bg-white dark:bg-card-bg-dark shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-6 w-6 text-rugby-teal" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Next Tournament
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {sevensData.upcomingTournament.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(
                        sevensData.upcomingTournament.date
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{sevensData.upcomingTournament.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>{sevensData.upcomingTournament.teams} Teams</span>
                  </div>
                </div>
              </div>
              <div className="bg-rugby-teal/5 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Tournament Format
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Pool stage followed by knockouts</li>
                  <li>• 7 players per team</li>
                  <li>• 7-minute halves</li>
                  <li>• Fast-paced action</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Upcoming Tournaments */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Tournament Calendar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sevensData.tournaments.map((tournament) => (
              <Card key={tournament.name} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge
                    variant="outline"
                    className="bg-rugby-teal/10 text-rugby-teal"
                  >
                    {tournament.status}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-rugby-teal" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(tournament.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {tournament.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{tournament.venue}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Rankings */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Current Rankings
          </h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-card-bg-dark divide-y divide-gray-200 dark:divide-gray-700">
                  {sevensData.rankings.map((team) => (
                    <tr key={team.team}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {team.position}
                          </span>
                          {team.position <= 3 && (
                            <Medal className="h-4 w-4 ml-2 text-rugby-teal" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {team.team}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {team.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
