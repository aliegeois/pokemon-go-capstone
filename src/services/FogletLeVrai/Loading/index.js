import React from "react";
import Alert from "shared/components/Alert";

const Loading = ({ loading, message }) => {
  if (loading)
    return <Alert message={message} variant="info" handleClose={() => {}} />;
  else return "";
};

export default Loading;
