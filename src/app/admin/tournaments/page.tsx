"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminChampionshipClient from "./AdminChampionshipClient";
import AdminSevensClient from "./AdminSevensClient";
import AdminCupClient from "./AdminCupClient";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";

export default function AdminTournamentsPage() {
  const [activeTab, setActiveTab] = useState("championship");
  const [activeChampionshipTab, setActiveChampionshipTab] = useState("standings");
  const [activeSevensTab, setActiveSevensTab] = useState("standings");
  const [bypassMode, setBypassMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if bypass mode is requested in URL
  useState(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const bypass = url.searchParams.get('bypass');
      if (bypass === 'admin') {
        setBypassMode(true);
      }
    }
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  return (
    <div className="container-width py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Tournaments</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Page
        </Button>
      </div>

      {bypassMode && (
        <Alert className="mb-4" variant="warning">
          <AlertTitle>Bypass Mode Active</AlertTitle>
          <AlertDescription>
            You are viewing this page in bypass mode. Some features may not work correctly.
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal" 
              onClick={() => window.location.href = window.location.pathname}
            >
              Exit Bypass Mode
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        defaultValue="championship"
        className="space-y-4"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList>
          <TabsTrigger value="championship">Championship</TabsTrigger>
          <TabsTrigger value="sevens">Sevens</TabsTrigger>
          <TabsTrigger value="cup">Cup</TabsTrigger>
        </TabsList>

        <TabsContent value="championship" className="space-y-4">
          <Tabs 
            defaultValue="standings" 
            className="space-y-4"
            onValueChange={(value) => setActiveChampionshipTab(value)}
          >
            <TabsList>
              <TabsTrigger value="standings">Standings</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="seasons">Seasons</TabsTrigger>
            </TabsList>

            <TabsContent value="standings" className="space-y-4">
              <AdminChampionshipClient
                key={`championship-standings-${activeTab}-${activeChampionshipTab}`}
              />
            </TabsContent>

            <TabsContent value="teams" className="space-y-4">
              <AdminChampionshipClient
                key={`championship-teams-${activeTab}-${activeChampionshipTab}`}
                activeTab="teams"
              />
            </TabsContent>

            <TabsContent value="seasons" className="space-y-4">
              <AdminChampionshipClient
                key={`championship-seasons-${activeTab}-${activeChampionshipTab}`}
                activeTab="seasons"
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="sevens" className="space-y-4">
          <Tabs 
            defaultValue="standings" 
            className="space-y-4"
            onValueChange={(value) => setActiveSevensTab(value)}
          >
            <TabsList>
              <TabsTrigger value="standings">Standings</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="seasons">Seasons</TabsTrigger>
            </TabsList>

            <TabsContent value="standings" className="space-y-4">
              <AdminSevensClient 
                key={`sevens-standings-${activeTab}-${activeSevensTab}`}
              />
            </TabsContent>

            <TabsContent value="teams" className="space-y-4">
              <AdminSevensClient
                key={`sevens-teams-${activeTab}-${activeSevensTab}`}
                activeTab="teams"
              />
            </TabsContent>

            <TabsContent value="seasons" className="space-y-4">
              <AdminSevensClient
                key={`sevens-seasons-${activeTab}-${activeSevensTab}`}
                activeTab="seasons"
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="cup" className="space-y-4">
          <AdminCupClient key={`cup-${activeTab}`} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
