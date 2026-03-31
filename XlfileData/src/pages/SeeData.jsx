import React from "react";
import PageLayout from "../Component/PageLayout";
import PendingInterestByDate from "../Component/SeeDataforUpdation/PendingInterestByDate";

function SeeData() {
  return (
    <PageLayout
      title="See data"
      subtitle="Pick a date, fetch assigned pending leads, and save interest updates in bulk."
      maxWidthClass="max-w-5xl"
    >
      <PendingInterestByDate />
    </PageLayout>
  );
}

export default SeeData;
