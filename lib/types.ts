// Shared API response types used across server components and client components.

export type AEFIAlert = {
  id: string;
  patient_name: string;
  patient_phone_masked: string;
  patient_phone_unmasked: string;
  facility_name: string;
  vaccine_name: string;
  dose_number: number;
  symptoms: string[];
  severity: "mild" | "moderate" | "critical";
  status: "open" | "resolved";
  created_at: string;
  resolved_at: string | null;
  resolution_note: string | null;
};

export type OverviewSummary = {
  total_users: {
    total_count: number;
    active_count: number;
    breakdown: {
      implementors: number;
      health_workers: number;
      facilities: number;
    };
  };
  facilities: { total_count: number; regions_count: number };
  children_enrolled: {
    total_count: number;
    male_count: number;
    female_count: number;
  };
  national_coverage: { current_pct: number; target_pct: number };
  open_se_alerts: { total_open: number; scope: string };
};

export type OverviewTrendPoint = {
  month: string;
  coverage_pct: number;
  adherence_pct: number;
};

export type ImplementorListItem = {
  id: string;
  name: string;
  lead: { name: string; email: string; phone: string | null };
  region: string;
  facilities_count: number;
  programs_count: number;
  children_enrolled: number;
  coverage_pct: number;
  adherence_pct: number;
  open_se_alerts: number;
  status: "active" | "onboarding" | "suspended";
};

export type ImplementorDetail = {
  id: string;
  name: string;
  lead: { name: string; email: string; phone: string | null };
  region: string;
  status: string;
  metrics: {
    facilities_count: number;
    programs_count: number;
    children_enrolled: number;
    coverage_pct: number;
    adherence_pct: number;
    open_se_alerts: number;
  };
  subscription: {
    account_id: string;
    plan: string;
    seats_licensed: number;
    billing_cycle: string;
    status: string;
  };
};

export type FacilityListItem = {
  id: string;
  name: string;
  type: string;
  region: string;
  district: string;
  implementor: string;
  plan: string;
  seats: number;
  completion_pct: number;
  renews_on: string | null;
  status: string;
};

export type ProgramListItem = {
  id: string;
  name: string;
  implementor: string;
  cohorts_count: number;
  children_enrolled: number;
  completion_pct: number;
  status: string;
};

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  facility_scope: string;
  organisation: string;
  status: string;
  last_active: string;
};

export type BillingMetrics = {
  mrr_usd: number;
  total_accounts: number;
  active_accounts: number;
  licensed_seats: number;
  past_due_accounts: number;
};

export type BillingPlanItem = {
  plan: string;
  price_per_month: number;
  seats_included: number;
  description: string;
};

export type BillingAccountItem = {
  id: string;
  account_name: string;
  subscriber_type: string;
  plan: string;
  facilities_count: number;
  seats: number;
  amount: number;
  billing_cycle: string;
  next_invoice: string | null;
  status: string;
};

export type MessageLogMetrics = {
  total_sent_4_weeks: number;
  delivery_rate_pct: number;
  failed_count: number;
  opted_out_count: number;
  channel_breakdown_30d: {
    delivered_pct: number;
    read_pct: number;
    failed_pct: number;
    opted_out_pct: number;
  };
};

export type MessageLogEntry = {
  id: string;
  sent_at: string;
  recipient_id: string;
  facility: string;
  channel: string;
  template: string;
  status: string;
  detail: string;
};

export type InsightsResponse = {
  headline_metrics: {
    mau: { value: number; change_pct: number; since: string };
    confirmation_rate: { value_pct: number; label: string };
    avg_adherence: { value_pct: number; total_users: number };
  };
  portal_engagement: Array<{
    portal: string;
    total: number;
    active: number;
    new_this_month: number;
  }>;
  coverage_gaps: Array<{
    antigen: string;
    coverage_pct: number;
    target_pct: number;
    gap_pts: number;
  }>;
  recommended_actions: Array<{
    id: string;
    title: string;
    impact: string;
    detail: string;
  }>;
};

export type CoverageSummary = {
  avg_antigen_coverage_pct: number;
  target_pct: number;
  avg_vaccine_completion_pct: number;
  vaccines_tracked: number;
  vaccines_on_target: Record<string, unknown>;
  highest_dropout: Record<string, unknown>;
};

export type CoverageAntigenItem = {
  antigen: string;
  coverage_pct: number;
  dropout_trend_pct: number;
  trend_direction: string;
};

export type AuditLogEntry = {
  id: string;
  user_name: string;
  user_role: string;
  timestamp: string;
  action: string;
  target_record: string | null;
};

export type AuditLogGroup = {
  date_group: string;
  items: AuditLogEntry[];
};
