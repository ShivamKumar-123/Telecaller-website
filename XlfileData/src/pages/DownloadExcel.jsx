import React from "react";
import PageLayout from "../Component/PageLayout";
import TakeExcel from "../Component/TakeExcelFile/TakeExcel";

function DownloadExcel() {
  return (
    <PageLayout
      title="Download Excel data"
      subtitle="Export leads for a specific upload date, or download the full dataset (admin)."
      maxWidthClass="max-w-lg"
    >
      <TakeExcel />
    </PageLayout>
  );
}

export default DownloadExcel;
