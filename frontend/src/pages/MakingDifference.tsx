import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This page now redirects to Impact page
export default function MakingDifference() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Impact page when this page is accessed directly
    navigate('/impact', { replace: true });
  }, [navigate]);

  // Render nothing while redirecting
  return null;
}