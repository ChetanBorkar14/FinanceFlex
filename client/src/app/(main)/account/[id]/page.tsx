"use client";

import React from "react";
import { useParams } from "next/navigation";
const page = () => {
  const params = useParams();
  return <div>Hello from account page Your Account Id is {params.id}</div>;
};

export default page;
