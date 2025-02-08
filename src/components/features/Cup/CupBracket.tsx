"use client";

import { Card } from "@/components/ui/card";

interface Match {
  id: number;
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  date?: string;
  round: "final" | "semi" | "quarter";
}

interface CupBracketProps {
  matches: Match[];
}

export default function CupBracket({ matches }: CupBracketProps) {
  const finals = matches.filter((match) => match.round === "final");
  const semis = matches.filter((match) => match.round === "semi");
  const quarters = matches.filter((match) => match.round === "quarter");

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] p-8">
        <div className="flex justify-center items-center h-full">
          <div className="flex flex-col space-y-8">
            {/* Quarter Finals */}
            <div className="flex space-x-8">
              <div className="flex flex-col space-y-16">
                {quarters.slice(0, 2).map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
              <div className="flex flex-col space-y-16">
                {quarters.slice(2, 4).map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>

            {/* Semi Finals */}
            <div className="flex justify-center space-x-32">
              {semis.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>

            {/* Final */}
            <div className="flex justify-center">
              {finals.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  return (
    <Card className="w-64 p-4 bg-white dark:bg-card-bg-dark border border-rugby-teal/20">
      <div className="flex flex-col space-y-2">
        <div className="text-sm font-medium text-rugby-teal uppercase tracking-wider mb-2">
          {match.round === "final"
            ? "Final"
            : match.round === "semi"
            ? "Semi Final"
            : "Quarter Final"}
        </div>
        <div className="flex justify-between items-center py-2 border-b border-rugby-teal/10">
          <span className="font-medium">{match.team1 || "TBD"}</span>
          <span className="text-rugby-teal font-semibold">{match.score1}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="font-medium">{match.team2 || "TBD"}</span>
          <span className="text-rugby-teal font-semibold">{match.score2}</span>
        </div>
        {match.date && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {new Date(match.date).toLocaleDateString()}
          </div>
        )}
      </div>
    </Card>
  );
}
