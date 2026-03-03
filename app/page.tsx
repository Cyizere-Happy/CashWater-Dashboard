"use client";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MetricsSidebar from "./components/MetricsSidebar";
import EnvironmentalChart from "./components/EnvironmentalChart";
import EventFeed from "./components/EventFeed";
import AnalyticsSidebar from "./components/AnalyticsSidebar";
import LeakAlertBanner from "./components/LeakAlertBanner";
import { useMQTT } from "./hooks/useMQTT";

export default function Home() {
  const {
    isConnected,
    revenueTarget,
    households,
    revenue,
    anomalies,
    mqttMessage,
    lastHeartbeat,
    sendLedCommand,
  } = useMQTT();

  return (
    <div className="min-h-screen pb-10">
      <Navbar isConnected={isConnected} />

      <Hero value={revenueTarget} />

      <main className="px-16 mt-20 grid grid-cols-[280px_1fr_340px] gap-8 items-start max-[1200px]:grid-cols-1">
        <MetricsSidebar
          households={households}
          anomalies={anomalies}
          onSyncAI={sendLedCommand}
        />

        <div className="flex flex-col gap-8">
          <EnvironmentalChart revenue={revenue} consumption={null} />
          <EventFeed lastHeartbeat={lastHeartbeat} mqttMessage={mqttMessage} />
        </div>

        <AnalyticsSidebar />
      </main>

      <LeakAlertBanner />
    </div>
  );
}
