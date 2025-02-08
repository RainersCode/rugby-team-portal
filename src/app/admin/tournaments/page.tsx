import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminChampionshipClient from "./AdminChampionshipClient";
import AdminSevensClient from "./AdminSevensClient";

export default function AdminTournamentsPage() {
  return (
    <div className="container-width py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Tournaments</h1>
      </div>

      <Tabs defaultValue="championship" className="space-y-4">
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
              <AdminChampionshipClient />
            </TabsContent>

            <TabsContent value="teams" className="space-y-4">
              <AdminChampionshipClient activeTab="teams" />
            </TabsContent>

            <TabsContent value="seasons" className="space-y-4">
              <AdminChampionshipClient activeTab="seasons" />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="sevens" className="space-y-4">
          <AdminSevensClient />
        </TabsContent>
      </Tabs>
    </div>
  );
}
