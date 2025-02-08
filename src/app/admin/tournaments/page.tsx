"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminChampionshipClient from "./AdminChampionshipClient";
import AdminSevensClient from "./AdminSevensClient";
import { useEffect, useState } from "react";

export default function AdminTournamentsPage() {
  const [activeTab, setActiveTab] = useState("championship");

  return (
    <div className="container-width py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Tournaments</h1>
      </div>

      <Tabs
        defaultValue="championship"
        className="space-y-4"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList>
          <TabsTrigger value="championship">Championship</TabsTrigger>
          <TabsTrigger value="sevens">Sevens</TabsTrigger>
        </TabsList>

        <TabsContent value="championship" className="space-y-4">
          <Tabs defaultValue="standings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="standings">Standings</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="seasons">Seasons</TabsTrigger>
            </TabsList>

            <TabsContent value="standings" className="space-y-4">
              <AdminChampionshipClient
                key={`championship-standings-${activeTab}`}
              />
            </TabsContent>

            <TabsContent value="teams" className="space-y-4">
              <AdminChampionshipClient
                key={`championship-teams-${activeTab}`}
                activeTab="teams"
              />
            </TabsContent>

            <TabsContent value="seasons" className="space-y-4">
              <AdminChampionshipClient
                key={`championship-seasons-${activeTab}`}
                activeTab="seasons"
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="sevens" className="space-y-4">
          <AdminSevensClient key={`sevens-${activeTab}`} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
