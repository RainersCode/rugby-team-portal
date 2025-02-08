import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminChampionshipClient from "./AdminChampionshipClient";

export default function AdminChampionshipPage() {
  return (
    <div className="container-width py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Championship</h1>
      </div>

      <Tabs defaultValue="standings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="seasons">Seasons</TabsTrigger>
        </TabsList>

        <TabsContent value="standings" className="space-y-4">
          <AdminChampionshipClient />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <AdminChampionshipClient activeTab="teams" />
        </TabsContent>

        <TabsContent value="seasons" className="space-y-4">
          <AdminChampionshipClient activeTab="seasons" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
