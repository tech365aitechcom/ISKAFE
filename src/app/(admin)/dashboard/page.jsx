"use client";
import React from "react";
import AnalyticsDashboard from "./_components/AnalyticsDashboard";
import DashboardStats from "./_components/DashboardStats";
import ReportsOverview from "./_components/ReportsOverview";
import UsersByCountry from "./_components/UsersByCountry";

const DashboardPage = () => {
  return (
    <div>
      <DashboardStats />
      <AnalyticsDashboard />
      <ReportsOverview />
      <UsersByCountry />
    </div>
  );
};

export default DashboardPage;
