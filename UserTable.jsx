import React from "react";
import UserOvertimeTable from "./UserOvertimeTable";
import UserTravelcostTable from "./UserTravelcostTable"; 

const UserTable = () => {

  return (
      <>
        <UserOvertimeTable />
        <br></br>
        <br></br>
        <UserTravelcostTable />
      </> 
  );
};

export default UserTable;
