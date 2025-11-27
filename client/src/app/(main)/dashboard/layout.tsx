import React, { Suspense } from "react";
import DashboardPage from "./page";
import { BarLoader } from "react-spinners";

const DashboardLayout = () => {
  return (
    <div>
      <Suspense fallback={<BarLoader>Loading dashboard...</BarLoader>}>
        <DashboardPage />
      </Suspense>
    </div>
  );
};

export default DashboardLayout;
