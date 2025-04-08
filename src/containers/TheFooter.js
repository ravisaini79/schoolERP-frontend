import React from "react";
import { CFooter } from "@coreui/react";

const TheFooter = () => {
  let year = new Date();

  return (
    <CFooter fixed={false}>
      <p className="text-center  w-100 mt-3">
        © {year.getFullYear()} ISchool | All Rights Reserved. Website Designed & Developed By Green Wheels
      </p>
    </CFooter>
  );
};

export default React.memo(TheFooter);
