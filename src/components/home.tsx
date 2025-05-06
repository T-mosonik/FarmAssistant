import WeatherSection from "./home/WeatherSection";
import MarketWatch from "./home/MarketWatch";
import TaskSummary from "./dashboard/TaskSummary";

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="p-2 sm:p-4 md:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 md:mb-6">
          Farm Dashboard
        </h1>
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-3 sm:space-y-4 md:space-y-6">
            <WeatherSection />
            <MarketWatch />
          </div>
          <div className="lg:col-span-2">
            <TaskSummary />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
