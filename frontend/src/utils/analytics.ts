import { supabase } from "./supabaseClient";

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
    VIEW: "impact_stats_view",
    REFRESH: "impact_stats_refresh"
  }
} as const;

interface TrackEventParams {
  event_type: string;
  component: string;
  action: string;
  metadata?: Record<string, any>;
}

// Supports BOTH call signatures used across the codebase:
//   trackEvent({ event_type, component, action, metadata })  — object form
//   trackEvent("component", "action", metadata)              — legacy 3-arg form
export const trackEvent = async (
  paramsOrComponent: TrackEventParams | string,
  action?: string,
  metadata?: Record<string, any>
): Promise<void> => {
  let event_type: string;
  let component: string;
  let act: string;
  let meta: Record<string, any>;

  if (typeof paramsOrComponent === "string") {
    // Legacy 3-arg form: trackEvent("component", "action", metadata)
    component = paramsOrComponent;
    act = action || "";
    event_type = "user_interaction";
    meta = metadata || {};
  } else {
    // Object form
    const p = paramsOrComponent;
    if (!p?.event_type || !p?.component || !p?.action) return;
    event_type = p.event_type;
    component = p.component;
    act = p.action;
    meta = p.metadata || {};
  }

  if (!component || !act) return;

  try {
    await supabase.from("analytics_events").insert({
      event_type,
      component,
      action: act,
      metadata: meta,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Non-fatal — analytics should never break the app
  }
};
