import React, { useState } from "react";
import MonthlySalesChart from "../../../components/ecommerce/MonthlyReportChart";
import EcommerceMetrics from "../../../components/ecommerce/EcommerceMetrics";
import WelcomeCard from "../../../components/ecommerce/WelcomeCard";
import MetrikPendapatan from "../../../components/ecommerce/MetrikPendapatan";

export default function DashboardHome() {
  const [userName] = useState("");

  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-5 row-span-2">
          <WelcomeCard userName={userName} />
        </div>
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <MetrikPendapatan />
          <EcommerceMetrics />
        </div>
        <div className="col-span-12 space-y-6 xl:col-span-12">
          <MonthlySalesChart />
        </div>
      </div>
    </>
  );
}
