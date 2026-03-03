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
    flowRate,
    totalVolume,
    valveState,
    leakDetected,
    anomalyScore,
    sendValveCommand,
    sendAnomalyScan,
  } = useMQTT();

  return (
    <div className="min-h-screen pb-10">
      <Navbar isConnected={isConnected} />

      <Hero
        value={revenueTarget}
        flowRate={flowRate}
        valveState={valveState}
        leakDetected={leakDetected}
      />

      <main className="px-16 mt-20 grid grid-cols-[280px_1fr_340px] gap-8 items-start max-[1200px]:grid-cols-1">
        <MetricsSidebar
          households={households}
          anomalies={anomalies}
          anomalyScore={anomalyScore}
          leakDetected={leakDetected}
          onScanAnomalies={() => sendAnomalyScan('TRIGGER')}
          onAcknowledgeSafe={() => sendAnomalyScan('ACKNOWLEDGE')}
        />

        <div className="flex flex-col gap-8">
          <EnvironmentalChart
            revenue={revenue}
            flowRate={flowRate}
            totalVolume={totalVolume}
          />
          <EventFeed
            lastHeartbeat={lastHeartbeat}
            mqttMessage={mqttMessage}
            flowRate={flowRate}
            valveState={valveState}
          />
        </div>

        <AnalyticsSidebar />
      </main>

      <LeakAlertBanner
        hardwareLeakDetected={leakDetected}
        anomalyScore={anomalyScore}
        onBlockWater={() => sendValveCommand('CLOSED')}
      />
    </div>
  );
}
