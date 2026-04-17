import { apiClient } from "app";

export const ANALYTICS_EVENTS = {
  USER_INTERACTION: {
    BUTTON_CLICK: "button_click",
    LINK_CLICK: "link_click",
    VIEW: "view"
  },
  NAVIGATION: {
    PAGE_VIEW: "page_view",
    CLICK: "navigation_click"
  },
  FEEDBACK: {
    SUBMIT: "feedback_submit",
    SUBMIT_SUCCESS: "feedback_submit_success",
    SUBMIT_ERROR: "feedback_submit_error",
    RATE: "feedback_rate",
    CATEGORY_SELECT: "feedback_category_select"
  },
  TESTIMONIAL: {
    VIEW: "testimonial_view",
    NAVIGATE: "testimonial_navigate",
    SHARE: "testimonial_share"
  },
  IMPACT: {
    VIEW: "impact_stats_view"
  }
} as const;

interface TrackEventParams {
  event_type: string;
  component: string;
  action: string;
  metadata?: Record<string, any>;
}

export const trackEvent = async (params: TrackEventParams) => {
  // Validate required fields
  if (!params || !params.event_type || !params.component || !params.action) {
    console.error('Missing required fields for tracking event:', params);
    return;
  }

  try {
    await apiClient.track_event({
      event_type: params.event_type,
      component: params.component,
      action: params.action,
      metadata: params.metadata || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error tracking event:", error);
  }
};
