/** Album */
export interface Album {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Description */
  description?: string | null;
  /** Cover Image Url */
  cover_image_url?: string | null;
  /** Created At */
  created_at: string;
  /** Updated At */
  updated_at: string;
  /**
   * Image Count
   * @default 0
   */
  image_count?: number;
}

/** AnalyticsEvent */
export interface AnalyticsEvent {
  /** Event Type */
  event_type: string;
  /** Component */
  component: string;
  /** Action */
  action: string;
  /**
   * Timestamp
   * @format date-time
   */
  timestamp?: string;
  /** Metadata */
  metadata?: Record<string, any>;
}

/** AnalyticsResponse */
export interface AnalyticsResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
}

/** AppointmentInfo */
export interface AppointmentInfo {
  /** Requested Date */
  requested_date?: string | null;
  /** Requested Time */
  requested_time?: string | null;
  /** Service Type */
  service_type?: string | null;
  /** Notes */
  notes?: string | null;
}

/** BatchImageUploadResponse */
export interface BatchImageUploadResponse {
  /** Message */
  message: string;
  /** Images */
  images: ImageMetadata[];
  /** Success Count */
  success_count: number;
  /** Failed Count */
  failed_count: number;
}

/** BlogPost */
export interface BlogPost {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Content */
  content: string;
  /** Author */
  author: string;
  /** Image Url */
  image_url?: string | null;
  /** Category */
  category: string;
  /**
   * Published At
   * @format date-time
   */
  published_at: string;
  /**
   * Tags
   * @default []
   */
  tags?: string[];
}

/** Body_batch_upload_images */
export interface BodyBatchUploadImages {
  /** Files */
  files: File[];
  /** Title */
  title?: string | null;
  /** Category */
  category?: string | null;
  /** Description */
  description?: string | null;
}

/** Body_submit_success_story_form */
export interface BodySubmitSuccessStoryForm {
  /** Title */
  title: string;
  /** Story */
  story: string;
  /** Program */
  program: string;
  /** Impact */
  impact: string;
  /** Name */
  name: string;
  /** Email */
  email: string;
  /** Image */
  image?: File | null;
}

/** Body_upload_image */
export interface BodyUploadImage {
  /**
   * File
   * @format binary
   */
  file: File;
}

/** CRMResponse */
export interface CRMResponse {
  /** Submissions */
  submissions: CRMSubmission[];
}

/** CRMSubmission */
export interface CRMSubmission {
  /** Id */
  id: string;
  /** Type */
  type: string;
  /** Name */
  name: string;
  /** Email */
  email?: string | null;
  /** Phone */
  phone?: string | null;
  /** Submitted At */
  submitted_at: string;
  /** Status */
  status: string;
  /** Data */
  data: Record<string, any>;
}

/** CampaignCreate */
export interface CampaignCreate {
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Goal Amount */
  goal_amount: number;
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
  /**
   * Impact Metrics
   * @default {}
   */
  impact_metrics?: Record<string, string>;
}

/** CampaignUpdate */
export interface CampaignUpdate {
  /** Title */
  title?: string | null;
  /** Description */
  description?: string | null;
  /** Goal Amount */
  goal_amount?: number | null;
  /** Current Amount */
  current_amount?: number | null;
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
  /** Is Active */
  is_active?: boolean | null;
  /** Impact Metrics */
  impact_metrics?: Record<string, string> | null;
}

/** CommunityStats */
export interface CommunityStats {
  /** Total Stories */
  total_stories: number;
  /** Total Volunteers */
  total_volunteers: number;
  /** Active Programs */
  active_programs: number;
  /** Total Hours */
  total_hours: number;
  /** Total Beneficiaries */
  total_beneficiaries: number;
  /** Avg Satisfaction */
  avg_satisfaction: number;
  /** Funds Raised */
  funds_raised: number;
  /** Program Distribution */
  program_distribution: Record<string, number>;
  /** Program Impacts */
  program_impacts: ProgramImpact[];
  /** Recent Stories */
  recent_stories: SuccessStory[];
}

/** ContactRequest */
export interface ContactRequest {
  /** Name */
  name: string;
  /**
   * Email
   * @format email
   */
  email: string;
  /** Subject */
  subject: string;
  /** Message */
  message: string;
  /** Category */
  category: string;
}

/** ContactResponse */
export interface ContactResponse {
  /** Id */
  id: string;
  /** Status */
  status: string;
  /**
   * Submitted At
   * @format date-time
   */
  submitted_at: string;
}

/**
 * ContentStatus
 * Status of moderated content
 */
export enum ContentStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

/**
 * ContentSubmission
 * Base model for content submissions
 */
export interface ContentSubmission {
  /** Id */
  id: string;
  /** Content types that require moderation */
  content_type: ContentType;
  /** Status of moderated content */
  status: ContentStatus;
  /** Created At */
  created_at: string;
  /** Email */
  email?: string | null;
  /** Name */
  name?: string | null;
  /**
   * Data
   * @default {}
   */
  data?: Record<string, any>;
}

/**
 * ContentType
 * Content types that require moderation
 */
export enum ContentType {
  Feedback = "feedback",
  SuccessStory = "success-story",
  Volunteer = "volunteer",
  Contact = "contact",
}

/** CreateAlbumRequest */
export interface CreateAlbumRequest {
  /** Title */
  title: string;
  /** Description */
  description?: string | null;
}

/** CreateBlogPostRequest */
export interface CreateBlogPostRequest {
  /** Title */
  title: string;
  /** Content */
  content: string;
  /** Author */
  author: string;
  /** Image Url */
  image_url?: string | null;
  /** Category */
  category: string;
  /**
   * Tags
   * @default []
   */
  tags?: string[];
}

/** CreateNotificationRequest */
export interface CreateNotificationRequest {
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Type */
  type: string;
  /** Date */
  date: string;
}

/** CustomerInfo */
export interface CustomerInfo {
  /** Name */
  name: string;
  /**
   * Email
   * @format email
   */
  email: string;
  /** Phone */
  phone?: string | null;
  /** Preferred Contact */
  preferred_contact?: string | null;
}

/** DonationUpdate */
export interface DonationUpdate {
  /** Amount */
  amount: number;
  /** Donor Name */
  donor_name?: string | null;
  /** Donor Email */
  donor_email?: string | null;
  /** Timestamp */
  timestamp?: string | null;
}

/** FeedbackRequest */
export interface FeedbackRequest {
  /** Rating */
  rating: number;
  /** Comment */
  comment: string;
  /** Category */
  category: string;
  /** Email */
  email?: string | null;
}

/** FeedbackResponse */
export interface FeedbackResponse {
  /** Message */
  message: string;
  /** Id */
  id: string;
}

/** FormSubmission */
export interface FormSubmission {
  /** Id */
  id: string;
  /** Form Type */
  form_type: "contact" | "volunteer" | "newsletter" | "success_stories" | "feedback" | "donations";
  /**
   * Timestamp
   * @format date-time
   */
  timestamp: string;
  /** Data */
  data: Record<string, any>;
}

/** FormSubmissionCreate */
export interface FormSubmissionCreate {
  /** Form Type */
  form_type: "contact" | "volunteer" | "newsletter" | "success_stories" | "feedback" | "donations";
  /** Data */
  data: Record<string, any>;
}

/** FormSubmissionExport */
export interface FormSubmissionExport {
  /** Format */
  format: "json" | "csv";
  filter?: FormSubmissionFilter | null;
}

/** FormSubmissionFilter */
export interface FormSubmissionFilter {
  /** Form Types */
  form_types?: ("contact" | "volunteer" | "newsletter" | "success_stories" | "feedback" | "donations")[] | null;
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
  /** Search Term */
  search_term?: string | null;
}

/** FormSubmissionResponse */
export interface FormSubmissionResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Submission Id */
  submission_id?: string | null;
}

/** FormSubmissionUpdate */
export interface FormSubmissionUpdate {
  /** Data */
  data: Record<string, any>;
}

/** FormSubmissionsList */
export interface FormSubmissionsList {
  /** Submissions */
  submissions: FormSubmission[];
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** ImageMetadata */
export interface ImageMetadata {
  /** Id */
  id: string;
  /** Filename */
  filename: string;
  /** Category */
  category: string;
  /** Title */
  title: string;
  /** Description */
  description?: string | null;
  /** Uploaded At */
  uploaded_at: string;
  /** Url */
  url: string;
  /** Album Id */
  album_id?: string | null;
}

/** ImageUploadResponse */
export interface ImageUploadResponse {
  /** Message */
  message: string;
  image: ImageMetadata;
}

/** ImagesListResponse */
export interface ImagesListResponse {
  /** Images */
  images: ImageMetadata[];
}

/** MigrationResponse */
export interface MigrationResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
}

/**
 * ModerationAction
 * Actions that can be taken on content
 */
export enum ModerationAction {
  Approve = "approve",
  Reject = "reject",
}

/**
 * ModerationActionRequest
 * Request to take action on content
 */
export interface ModerationActionRequest {
  /** Content Id */
  content_id: string;
  /** Actions that can be taken on content */
  action: ModerationAction;
  /**
   * Notify User
   * @default true
   */
  notify_user?: boolean;
  /** Message */
  message?: string | null;
  /** Admin Notes */
  admin_notes?: string | null;
}

/**
 * ModerationResponse
 * Response for moderation actions
 */
export interface ModerationResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Content Id */
  content_id?: string | null;
}

/** NewsletterSubscriptionRequest */
export interface NewsletterSubscriptionRequest {
  /**
   * Name
   * Name of the subscriber
   */
  name?: string | null;
  /**
   * Email
   * @format email
   */
  email: string;
  /**
   * Source
   * Source of the subscription
   * @default "website"
   */
  source?: string;
}

/** NewsletterSubscriptionResponse */
export interface NewsletterSubscriptionResponse {
  /** Status */
  status: string;
  /** Message */
  message: string;
}

/** Notification */
export interface Notification {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Type */
  type: string;
  /** Date */
  date: string;
  /** Created At */
  created_at: string;
}

/** Order */
export interface OrderInput {
  /** Order Id */
  order_id: string;
  customer: CustomerInfo;
  /** Items */
  items: AppApisOrdersOrderItem[];
  /** Total Amount */
  total_amount: number;
  appointment?: AppointmentInfo | null;
  /**
   * Status
   * @default "pending"
   */
  status?: string;
  /** Created At */
  created_at: string;
  /** Conversation Id */
  conversation_id: string;
}

/** Order */
export interface OrderOutput {
  /** Order Id */
  order_id: string;
  customer: CustomerInfo;
  /** Items */
  items: OrderItemOutput[];
  /** Total Amount */
  total_amount: number;
  appointment?: AppointmentInfo | null;
  /**
   * Status
   * @default "pending"
   */
  status?: string;
  /** Created At */
  created_at: string;
  /** Conversation Id */
  conversation_id: string;
}

/** OrderItem */
export interface OrderItemOutput {
  /** Product Id */
  product_id: string;
  /** Product Name */
  product_name: string;
  /** Quantity */
  quantity: number;
  /** Price */
  price: number;
  /** Special Instructions */
  special_instructions?: string | null;
}

/** OrderRequest */
export interface OrderRequest {
  /** Customer Name */
  customer_name: string;
  /**
   * Customer Email
   * @format email
   */
  customer_email: string;
  /** Items */
  items: AppApisOrderOrderItem[];
  /**
   * Donation Type
   * @default "one-time"
   */
  donation_type?: string;
  /** Message */
  message?: string | null;
  /**
   * Payment Method
   * @default "card"
   */
  payment_method?: string;
}

/** OrderResponse */
export interface OrderResponse {
  /** Order Id */
  order_id: string;
  /** Total Amount */
  total_amount: number;
  /** Status */
  status: string;
  /** Created At */
  created_at: string;
}

/** PaymentRequest */
export interface PaymentRequest {
  /** Amount */
  amount: number;
  /**
   * Currency
   * @default "USD"
   */
  currency?: string;
  /** Description */
  description?: string | null;
  /** Customer Email */
  customer_email?: string | null;
}

/** PaymentResponse */
export interface PaymentResponse {
  /** Payment Url */
  payment_url: string;
}

/**
 * PendingSubmissionsResponse
 * Response containing pending submissions
 */
export interface PendingSubmissionsResponse {
  /** Pending Submissions */
  pending_submissions: ContentSubmission[];
  /** Counts */
  counts: Record<string, number>;
}

/** ProcessedTranscript */
export interface ProcessedTranscript {
  /** Session Id */
  session_id: string;
  /** Summary */
  summary: string;
  /** Categories */
  categories: string[];
  /** Sentiment */
  sentiment: string;
  customer_info?: CustomerInfo | null;
  /** Order Details */
  order_details?: OrderItemOutput[] | null;
  appointment_info?: AppointmentInfo | null;
  /** Processed At */
  processed_at: string;
}

/** ProgramImpact */
export interface ProgramImpact {
  /** Program Name */
  program_name: string;
  /** Beneficiaries */
  beneficiaries: number;
  /** Success Rate */
  success_rate: number;
  /** Key Achievement */
  key_achievement: string;
}

/** SubscriberResponse */
export interface SubscriberResponse {
  /**
   * Id
   * Unique identifier for the subscriber
   */
  id: string;
  /**
   * Name
   * Name of the subscriber
   */
  name?: string | null;
  /**
   * Email
   * Email address of the subscriber
   */
  email: string;
  /**
   * Source
   * Source of the subscription
   * @default "website"
   */
  source?: string;
  /**
   * Status
   * Status of the subscription
   * @default "active"
   */
  status?: string;
  /**
   * Subscribed At
   * Date and time of subscription
   */
  subscribed_at: string;
}

/** SubscribersListResponse */
export interface SubscribersListResponse {
  /**
   * Subscribers
   * List of subscribers
   * @default []
   */
  subscribers?: SubscriberResponse[];
}

/** SuccessStory */
export interface SuccessStory {
  /** Title */
  title: string;
  /** Story */
  story: string;
  /** Program */
  program: string;
  /** Impact */
  impact: string;
  /** Name */
  name: string;
  /** Email */
  email: string;
  /** Image Url */
  image_url?: string | null;
}

/** SuccessStoryRequest */
export interface SuccessStoryRequest {
  /** Title */
  title: string;
  /** Story */
  story: string;
  /** Program */
  program: string;
  /** Impact */
  impact: string;
  /** Name */
  name: string;
  /** Email */
  email: string;
  /** Imageurl */
  imageUrl?: string | null;
  /** Tags */
  tags?: string[] | null;
}

/** SuccessStoryResponse */
export interface SuccessStoryResponse {
  /** Message */
  message: string;
  /** Id */
  id: string;
}

/** SyncVideoCategoriesResponse */
export interface SyncVideoCategoriesResponse {
  /** Created Albums */
  created_albums: Album[];
  /** Updated Albums */
  updated_albums: Album[];
  /** Message */
  message: string;
}

/** TranscriptRequest */
export interface TranscriptRequest {
  /** Session Id */
  session_id: string;
  /** Transcript */
  transcript: string;
}

/** UpdateAlbumRequest */
export interface UpdateAlbumRequest {
  /** Title */
  title?: string | null;
  /** Description */
  description?: string | null;
  /** Cover Image Url */
  cover_image_url?: string | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** VideoCategory */
export interface VideoCategory {
  /** Category */
  category: string;
  /** Title */
  title?: string | null;
  /** Description */
  description?: string | null;
}

/** VolunteerRequest */
export interface VolunteerRequest {
  /** Name */
  name: string;
  /**
   * Email
   * @format email
   */
  email: string;
  /** Message */
  message: string;
  /**
   * Interests
   * @default []
   */
  interests?: string[];
  /**
   * Skills
   * @default []
   */
  skills?: string[];
  /**
   * Availability
   * @default "To be discussed"
   */
  availability?: string;
}

/** VolunteerResponse */
export interface VolunteerResponse {
  /** Id */
  id: string;
  /** Status */
  status: string;
  /**
   * Submitted At
   * @format date-time
   */
  submitted_at: string;
}

/** OrderItem */
export interface AppApisOrderOrderItem {
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Amount */
  amount: number;
  /**
   * Quantity
   * @default 1
   */
  quantity?: number;
}

/** OrderItem */
export interface AppApisOrdersOrderItem {
  /** Product Id */
  product_id: string;
  /** Product Name */
  product_name: string;
  /** Quantity */
  quantity: number;
  /** Price */
  price: number;
  /** Special Instructions */
  special_instructions?: string | null;
}

export type CheckHealthData = HealthResponse;

export type TrackEventData = AnalyticsResponse;

export type TrackEventError = HTTPValidationError;

/** Response Get Events Summary */
export type GetEventsSummaryData = Record<string, any>;

export type GetCrmSubmissionsData = CRMResponse;

export type CreatePaymentData = PaymentResponse;

export type CreatePaymentError = HTTPValidationError;

export type CreateSubmissionData = FormSubmissionResponse;

export type CreateSubmissionError = HTTPValidationError;

export interface GetAllSubmissionsParams {
  /**
   * Form Types
   * Filter by form types
   */
  form_types?: ("contact" | "volunteer" | "newsletter" | "success_stories" | "feedback" | "donations")[] | null;
  /**
   * Search
   * Search term to filter submissions
   */
  search?: string | null;
  /**
   * Start Date
   * Start date for filtering (ISO format)
   */
  start_date?: string | null;
  /**
   * End Date
   * End date for filtering (ISO format)
   */
  end_date?: string | null;
}

export type GetAllSubmissionsData = FormSubmissionsList;

export type GetAllSubmissionsError = HTTPValidationError;

export interface GetSubmissionParams {
  /**
   * Submission Id
   * The ID of the form submission to get
   */
  submissionId: string;
}

export type GetSubmissionData = FormSubmission;

export type GetSubmissionError = HTTPValidationError;

export interface DeleteSubmissionParams {
  /**
   * Submission Id
   * The ID of the form submission to delete
   */
  submissionId: string;
}

export type DeleteSubmissionData = FormSubmissionResponse;

export type DeleteSubmissionError = HTTPValidationError;

export interface UpdateSubmissionParams {
  /**
   * Submission Id
   * The ID of the form submission to update
   */
  submissionId: string;
}

export type UpdateSubmissionData = FormSubmissionResponse;

export type UpdateSubmissionError = HTTPValidationError;

/** Response Export Submissions */
export type ExportSubmissionsData = Record<string, any>;

export type ExportSubmissionsError = HTTPValidationError;

/** Local Storage Data */
export type MigrateFromLocalStoragePayload = Record<string, any>;

export type MigrateFromLocalStorageData = FormSubmissionResponse;

export type MigrateFromLocalStorageError = HTTPValidationError;

export type SubmitFeedbackData = FeedbackResponse;

export type SubmitFeedbackError = HTTPValidationError;

export type GetFeedbackStatsData = any;

export type SubmitContactData = ContactResponse;

export type SubmitContactError = HTTPValidationError;

export type CreateOrderData = OrderOutput;

export type CreateOrderError = HTTPValidationError;

/** Response List Orders */
export type ListOrdersData = OrderOutput[];

export interface GetOrderParams {
  /** Order Id */
  orderId: string;
}

export type GetOrderData = OrderOutput;

export type GetOrderError = HTTPValidationError;

export interface TestNotificationParams {
  /** Template Type */
  template_type: "volunteer_application" | "contact_form" | "donation" | "feedback" | "success_story" | "newsletter";
  /** Recipient Email */
  recipient_email: string;
}

export type TestNotificationData = any;

export type TestNotificationError = HTTPValidationError;

/** Response Get Notifications */
export type GetNotificationsData = Notification[];

export type CreateNotificationData = Notification;

export type CreateNotificationError = HTTPValidationError;

export interface UploadImageParams {
  /** Title */
  title?: string | null;
  /** Category */
  category?: string | null;
  /** Description */
  description?: string | null;
}

export type UploadImageData = ImageUploadResponse;

export type UploadImageError = HTTPValidationError;

export type BatchUploadImagesData = BatchImageUploadResponse;

export type BatchUploadImagesError = HTTPValidationError;

export interface ViewImageParams {
  /** Filename */
  filename: string;
}

export type ViewImageData = any;

export type ViewImageError = HTTPValidationError;

export interface ListImagesParams {
  /** Category */
  category?: string | null;
}

export type ListImagesData = ImagesListResponse;

export type ListImagesError = HTTPValidationError;

/** Content */
export type SubmitContentPayload = Record<string, any>;

export interface SubmitContentParams {
  /** Content types that require moderation */
  content_type: ContentType;
}

export type SubmitContentData = ModerationResponse;

export type SubmitContentError = HTTPValidationError;

export type GetPendingSubmissionsData = PendingSubmissionsResponse;

export type TakeModerationActionData = ModerationResponse;

export type TakeModerationActionError = HTTPValidationError;

export interface GetSubmissionsByTypeParams {
  /** Status */
  status?: string | null;
  /** Content types that require moderation */
  contentType: ContentType;
}

/** Response Get Submissions By Type */
export type GetSubmissionsByTypeData = ContentSubmission[];

export type GetSubmissionsByTypeError = HTTPValidationError;

/** Response List Albums */
export type ListAlbumsData = Album[];

export type CreateAlbumData = Album;

export type CreateAlbumError = HTTPValidationError;

export interface GetAlbumParams {
  /** Album Id */
  albumId: string;
}

export type GetAlbumData = Album;

export type GetAlbumError = HTTPValidationError;

export interface UpdateAlbumParams {
  /** Album Id */
  albumId: string;
}

export type UpdateAlbumData = Album;

export type UpdateAlbumError = HTTPValidationError;

export interface DeleteAlbumParams {
  /** Album Id */
  albumId: string;
}

export type DeleteAlbumData = any;

export type DeleteAlbumError = HTTPValidationError;

/** Categories */
export type SyncVideoCategoriesPayload = VideoCategory[];

export type SyncVideoCategoriesData = SyncVideoCategoriesResponse;

export type SyncVideoCategoriesError = HTTPValidationError;

/** Admin Emails */
export type DeliverSubscriberReportPayload = string[] | null;

export type DeliverSubscriberReportData = any;

export type DeliverSubscriberReportError = HTTPValidationError;

export type GetAllSubscribersData = SubscribersListResponse;

export type LegacySubscribeRouteData = NewsletterSubscriptionResponse;

export type LegacySubscribeRouteError = HTTPValidationError;

export type SubscribeToNewsletterData = NewsletterSubscriptionResponse;

export type SubscribeToNewsletterError = HTTPValidationError;

export interface UnsubscribeUserParams {
  /** Subscriber Id */
  subscriberId: string;
}

export type UnsubscribeUserData = string;

export type UnsubscribeUserError = HTTPValidationError;

export interface DeleteSubscriberParams {
  /** Subscriber Id */
  subscriberId: string;
}

/** Response Delete Subscriber */
export type DeleteSubscriberData = Record<string, any>;

export type DeleteSubscriberError = HTTPValidationError;

export type ListDonationOrdersData = any;

export type CreateDonationOrderData = OrderResponse;

export type CreateDonationOrderError = HTTPValidationError;

export interface GetDonationOrderParams {
  /** Order Id */
  orderId: string;
}

export type GetDonationOrderData = any;

export type GetDonationOrderError = HTTPValidationError;

export type SubmitVolunteerApplicationData = VolunteerResponse;

export type SubmitVolunteerApplicationError = HTTPValidationError;

/** Response Get Blog Posts */
export type GetBlogPostsData = BlogPost[];

export type CreateBlogPostData = BlogPost;

export type CreateBlogPostError = HTTPValidationError;

/** Local Storage Data */
export type MigrateFromLocalStorage2Payload = Record<string, any>;

export type MigrateFromLocalStorage2Data = MigrationResponse;

export type MigrateFromLocalStorage2Error = HTTPValidationError;

export type GetSuccessStoriesData = any;

export type SubmitSuccessStoryFormData = SuccessStoryResponse;

export type SubmitSuccessStoryFormError = HTTPValidationError;

export type GetCommunityStatsData = CommunityStats;

export type SubmitSuccessStoryData = SuccessStoryResponse;

export type SubmitSuccessStoryError = HTTPValidationError;

export type GetStoryCommunityStatsData = any;

export type CreateCampaignData = any;

export type CreateCampaignError = HTTPValidationError;

export interface ListCampaignsParams {
  /**
   * Active Only
   * @default false
   */
  active_only?: boolean;
}

export type ListCampaignsData = any;

export type ListCampaignsError = HTTPValidationError;

export interface GetCampaignParams {
  /** Campaign Id */
  campaignId: string;
}

export type GetCampaignData = any;

export type GetCampaignError = HTTPValidationError;

export interface UpdateCampaignParams {
  /** Campaign Id */
  campaignId: string;
}

export type UpdateCampaignData = any;

export type UpdateCampaignError = HTTPValidationError;

export interface AddDonationToCampaignParams {
  /** Campaign Id */
  campaignId: string;
}

export type AddDonationToCampaignData = any;

export type AddDonationToCampaignError = HTTPValidationError;

export interface ResetCampaignParams {
  /** Campaign Id */
  campaignId: string;
}

export type ResetCampaignData = any;

export type ResetCampaignError = HTTPValidationError;

export type ProcessTranscriptData = ProcessedTranscript;

export type ProcessTranscriptError = HTTPValidationError;

export interface GetProcessedTranscriptParams {
  /** Session Id */
  sessionId: string;
}

export type GetProcessedTranscriptData = ProcessedTranscript;

export type GetProcessedTranscriptError = HTTPValidationError;
