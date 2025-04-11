import WeatherSection from "./home/WeatherSection";
import MarketWatch from "./home/MarketWatch";
import NavigationDrawer from "./navigation/NavigationDrawer";
import TaskSummary from "./dashboard/TaskSummary";

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <NavigationDrawer />
        <main className="flex-1 p-4 md:p-6">
          <h1 className="text-2xl font-bold mb-6">Farm Dashboard</h1>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-6">
              <WeatherSection />
              <MarketWatch />
            </div>
            <div className="lg:col-span-2">
              <TaskSummary />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
