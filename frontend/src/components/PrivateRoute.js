import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export default function PrivateRoute() {
  const { user } = useUser();
  // If no user, redirect to login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
