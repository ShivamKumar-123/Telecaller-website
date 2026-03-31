import React from "react";
import PageLayout from "../Component/PageLayout";
import Form from "../Component/Form/Form";

function UpdateInterest() {
  return (
    <PageLayout
      title="Update customer interest"
      subtitle="Record interest for leads assigned to you for the selected date."
      maxWidthClass="max-w-2xl"
    >
      <Form />
    </PageLayout>
  );
}

export default UpdateInterest;
