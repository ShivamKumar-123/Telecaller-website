import React from "react";
import PageLayout from "../Component/PageLayout";
import AddExcelFile from "../Component/AddExcel.jsx/AddExcelFile";

function AddExcelPage() {
  return (
    <PageLayout
      title="Upload Excel"
      subtitle="Import lead rows from a spreadsheet (.xls or .xlsx). File is sent securely with your session."
      maxWidthClass="max-w-lg"
    >
      <AddExcelFile />
    </PageLayout>
  );
}

export default AddExcelPage;
