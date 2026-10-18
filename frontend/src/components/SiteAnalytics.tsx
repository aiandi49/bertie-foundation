import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { startClickTracking, trackPageView } from "utils/siteAnalytics";

/* Records one page view per page change and every link or button click,
   for the Analytics tab in the admin dashboard. Renders nothing. */
export function SiteAnalytics() {
  const { pathname } = useLocation();

  useEffect(() => startClickTracking(), []);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
