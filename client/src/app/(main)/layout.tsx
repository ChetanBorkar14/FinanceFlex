import React, { ReactNode } from "react";

interface MainlayoutProps {
  children: ReactNode;
}

const Mainlayout: React.FC<MainlayoutProps> = ({ children }) => {
  return <div>{children}</div>;
};

export default Mainlayout;
