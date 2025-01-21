import React from "react";

type IErrorsUiProps = {
  errorMsg: string;
  errorNtk: string;
};

const defaultProps = {};

const ErrorsUi: React.FC<IErrorsUiProps> = (props) => {
  const { errorMsg, errorNtk } = props;

  return errorMsg ? (
    <div className="px-2 font-medium font-sans text-xs text-red-600">
      {"⚠️ "}
      {errorMsg}
    </div>
  ) : errorNtk ? (
    <div className="px-2 font-medium font-sans text-xs text-red-600">
      {"⚠️ "}
      {errorNtk}
    </div>
  ) : null;
};

ErrorsUi.defaultProps = defaultProps;

export default ErrorsUi;
