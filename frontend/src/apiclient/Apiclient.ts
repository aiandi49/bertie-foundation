import {
  AddDonationToCampaignData,
  AddDonationToCampaignError,
  AddDonationToCampaignParams,
  AnalyticsEvent,
  BatchUploadImagesData,
  BatchUploadImagesError,
  BodyBatchUploadImages,
  BodySubmitSuccessStoryForm,
  BodyUploadImage,
  CampaignCreate,
  CampaignUpdate,
  CheckHealthData,
  ContactRequest,
  CreateAlbumData,
  CreateAlbumError,
  CreateAlbumRequest,
  CreateBlogPostData,
  CreateBlogPostError,
  CreateBlogPostRequest,
  CreateCampaignData,
  CreateCampaignError,
  CreateDonationOrderData,
  CreateDonationOrderError,
  CreateNotificationData,
  CreateNotificationError,
  CreateNotificationRequest,
  CreateOrderData,
  CreateOrderError,
  CreatePaymentData,
  CreatePaymentError,
  CreateSubmissionData,
  CreateSubmissionError,
  DeleteAlbumData,
  DeleteAlbumError,
  DeleteAlbumParams,
  DeleteSubmissionData,
  DeleteSubmissionError,
  DeleteSubmissionParams,
  DeleteSubscriberData,
  DeleteSubscriberError,
  DeleteSubscriberParams,
  DeliverSubscriberReportData,
  DeliverSubscriberReportError,
  DeliverSubscriberReportPayload,
  DonationUpdate,
  ExportSubmissionsData,
  ExportSubmissionsError,
  FeedbackRequest,
  FormSubmissionCreate,
  FormSubmissionExport,
  FormSubmissionUpdate,
  GetAlbumData,
  GetAlbumError,
  GetAlbumParams,
  GetAllSubmissionsData,
  GetAllSubmissionsError,
  GetAllSubmissionsParams,
  GetAllSubscribersData,
  GetBlogPostsData,
  GetCampaignData,
  GetCampaignError,
  GetCampaignParams,
  GetCommunityStatsData,
  GetCrmSubmissionsData,
  GetDonationOrderData,
  GetDonationOrderError,
  GetDonationOrderParams,
  GetEventsSummaryData,
  GetFeedbackStatsData,
  GetNotificationsData,
  GetOrderData,
  GetOrderError,
  GetOrderParams,
  GetPendingSubmissionsData,
  GetProcessedTranscriptData,
  GetProcessedTranscriptError,
  GetProcessedTranscriptParams,
  GetStoryCommunityStatsData,
  GetSubmissionData,
  GetSubmissionError,
  GetSubmissionParams,
  GetSubmissionsByTypeData,
  GetSubmissionsByTypeError,
  GetSubmissionsByTypeParams,
  GetSuccessStoriesData,
  LegacySubscribeRouteData,
  LegacySubscribeRouteError,
  ListAlbumsData,
  ListCampaignsData,
  ListCampaignsError,
  ListCampaignsParams,
  ListDonationOrdersData,
  ListImagesData,
  ListImagesError,
  ListImagesParams,
  ListOrdersData,
  MigrateFromLocalStorage2Data,
  MigrateFromLocalStorage2Error,
  MigrateFromLocalStorage2Payload,
  MigrateFromLocalStorageData,
  MigrateFromLocalStorageError,
  MigrateFromLocalStoragePayload,
  ModerationActionRequest,
  NewsletterSubscriptionRequest,
  OrderInput,
  OrderRequest,
  PaymentRequest,
  ProcessTranscriptData,
  ProcessTranscriptError,
  ResetCampaignData,
  ResetCampaignError,
  ResetCampaignParams,
  SubmitContactData,
  SubmitContactError,
  SubmitContentData,
  SubmitContentError,
  SubmitContentParams,
  SubmitContentPayload,
  SubmitFeedbackData,
  SubmitFeedbackError,
  SubmitSuccessStoryData,
  SubmitSuccessStoryError,
  SubmitSuccessStoryFormData,
  SubmitSuccessStoryFormError,
  SubmitVolunteerApplicationData,
  SubmitVolunteerApplicationError,
  SubscribeToNewsletterData,
  SubscribeToNewsletterError,
  SuccessStoryRequest,
  SyncVideoCategoriesData,
  SyncVideoCategoriesError,
  SyncVideoCategoriesPayload,
  TakeModerationActionData,
  TakeModerationActionError,
  TestNotificationData,
  TestNotificationError,
  TestNotificationParams,
  TrackEventData,
  TrackEventError,
  TranscriptRequest,
  UnsubscribeUserData,
  UnsubscribeUserError,
  UnsubscribeUserParams,
  UpdateAlbumData,
  UpdateAlbumError,
  UpdateAlbumParams,
  UpdateAlbumRequest,
  UpdateCampaignData,
  UpdateCampaignError,
  UpdateCampaignParams,
  UpdateSubmissionData,
  UpdateSubmissionError,
  UpdateSubmissionParams,
  UploadImageData,
  UploadImageError,
  UploadImageParams,
  ViewImageData,
  ViewImageError,
  ViewImageParams,
  VolunteerRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Apiclient<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Track a user interaction event
   *
   * @tags dbtn/module:analytics
   * @name track_event
   * @summary Track Event
   * @request POST:/routes/track-event
   */
  track_event = (data: AnalyticsEvent, params: RequestParams = {}) =>
    this.request<TrackEventData, TrackEventError>({
      path: `/routes/track-event`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a summary of tracked events
   *
   * @tags dbtn/module:analytics
   * @name get_events_summary
   * @summary Get Events Summary
   * @request GET:/routes/events-summary
   */
  get_events_summary = (params: RequestParams = {}) =>
    this.request<GetEventsSummaryData, any>({
      path: `/routes/events-summary`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:crm
   * @name get_crm_submissions
   * @summary Get Crm Submissions
   * @request GET:/routes/crm/submissions
   */
  get_crm_submissions = (params: RequestParams = {}) =>
    this.request<GetCrmSubmissionsData, any>({
      path: `/routes/crm/submissions`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new payment and return the Cash App payment URL
   *
   * @tags dbtn/module:payments
   * @name create_payment
   * @summary Create Payment
   * @request POST:/routes/payments/create
   */
  create_payment = (data: PaymentRequest, params: RequestParams = {}) =>
    this.request<CreatePaymentData, CreatePaymentError>({
      path: `/routes/payments/create`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a new form submission
   *
   * @tags form-submissions, dbtn/module:form_submissions
   * @name create_submission
   * @summary Create Submission
   * @request POST:/routes/form-submissions/
   */
  create_submission = (data: FormSubmissionCreate, params: RequestParams = {}) =>
    this.request<CreateSubmissionData, CreateSubmissionError>({
      path: `/routes/form-submissions/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all form submissions with optional filtering
   *
   * @tags form-submissions, dbtn/module:form_submissions
   * @name get_all_submissions
   * @summary Get All Submissions
   * @request GET:/routes/form-submissions/
   */
  get_all_submissions = (query: GetAllSubmissionsParams, params: RequestParams = {}) =>
    this.request<GetAllSubmissionsData, GetAllSubmissionsError>({
      path: `/routes/form-submissions/`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a single form submission by ID
   *
   * @tags form-submissions, dbtn/module:form_submissions
   * @name get_submission
   * @summary Get Submission
   * @request GET:/routes/form-submissions/{submission_id}
   */
  get_submission = ({ submissionId, ...query }: GetSubmissionParams, params: RequestParams = {}) =>
    this.request<GetSubmissionData, GetSubmissionError>({
      path: `/routes/form-submissions/${submissionId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Delete a form submission by ID
   *
   * @tags form-submissions, dbtn/module:form_submissions
   * @name delete_submission
   * @summary Delete Submission
   * @request DELETE:/routes/form-submissions/{submission_id}
   */
  delete_submission = ({ submissionId, ...query }: DeleteSubmissionParams, params: RequestParams = {}) =>
    this.request<DeleteSubmissionData, DeleteSubmissionError>({
      path: `/routes/form-submissions/${submissionId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Update a form submission by ID
   *
   * @tags form-submissions, dbtn/module:form_submissions
   * @name update_submission
   * @summary Update Submission
   * @request PUT:/routes/form-submissions/{submission_id}
   */
  update_submission = (
    { submissionId, ...query }: UpdateSubmissionParams,
    data: FormSubmissionUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateSubmissionData, UpdateSubmissionError>({
      path: `/routes/form-submissions/${submissionId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Export form submissions as JSON or CSV
   *
   * @tags form-submissions, dbtn/module:form_submissions
   * @name export_submissions
   * @summary Export Submissions
   * @request POST:/routes/form-submissions/export
   */
  export_submissions = (data: FormSubmissionExport, params: RequestParams = {}) =>
    this.request<ExportSubmissionsData, ExportSubmissionsError>({
      path: `/routes/form-submissions/export`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Migrate form submissions from localStorage to the centralized system
   *
   * @tags form-submissions, dbtn/module:form_submissions
   * @name migrate_from_local_storage
   * @summary Migrate From Local Storage
   * @request POST:/routes/form-submissions/migrate-local-storage
   */
  migrate_from_local_storage = (data: MigrateFromLocalStoragePayload, params: RequestParams = {}) =>
    this.request<MigrateFromLocalStorageData, MigrateFromLocalStorageError>({
      path: `/routes/form-submissions/migrate-local-storage`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:feedback
   * @name submit_feedback
   * @summary Submit Feedback
   * @request POST:/routes/feedback
   */
  submit_feedback = (data: FeedbackRequest, params: RequestParams = {}) =>
    this.request<SubmitFeedbackData, SubmitFeedbackError>({
      path: `/routes/feedback`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:feedback
   * @name get_feedback_stats
   * @summary Get Feedback Stats
   * @request GET:/routes/feedback/stats
   */
  get_feedback_stats = (params: RequestParams = {}) =>
    this.request<GetFeedbackStatsData, any>({
      path: `/routes/feedback/stats`,
      method: "GET",
      ...params,
    });

  /**
   * @description Submit a contact form
   *
   * @tags dbtn/module:contact
   * @name submit_contact
   * @summary Submit Contact
   * @request POST:/routes/contact
   */
  submit_contact = (data: ContactRequest, params: RequestParams = {}) =>
    this.request<SubmitContactData, SubmitContactError>({
      path: `/routes/contact`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Create a new order and send notifications
   *
   * @tags dbtn/module:orders
   * @name create_order
   * @summary Create Order
   * @request POST:/routes/create
   */
  create_order = (data: OrderInput, params: RequestParams = {}) =>
    this.request<CreateOrderData, CreateOrderError>({
      path: `/routes/create`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all orders
   *
   * @tags dbtn/module:orders
   * @name list_orders
   * @summary List Orders
   * @request GET:/routes/list
   */
  list_orders = (params: RequestParams = {}) =>
    this.request<ListOrdersData, any>({
      path: `/routes/list`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get a specific order
   *
   * @tags dbtn/module:orders
   * @name get_order
   * @summary Get Order
   * @request GET:/routes/get/{order_id}
   */
  get_order = ({ orderId, ...query }: GetOrderParams, params: RequestParams = {}) =>
    this.request<GetOrderData, GetOrderError>({
      path: `/routes/get/${orderId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Test endpoint for email notifications (development only)
   *
   * @tags admin, dbtn/module:email_notifications
   * @name test_notification
   * @summary Test Notification
   * @request POST:/routes/test-notification
   */
  test_notification = (query: TestNotificationParams, params: RequestParams = {}) =>
    this.request<TestNotificationData, TestNotificationError>({
      path: `/routes/test-notification`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description Get all notifications
   *
   * @tags dbtn/module:notifications
   * @name get_notifications
   * @summary Get Notifications
   * @request GET:/routes/notifications
   */
  get_notifications = (params: RequestParams = {}) =>
    this.request<GetNotificationsData, any>({
      path: `/routes/notifications`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new notification
   *
   * @tags dbtn/module:notifications
   * @name create_notification
   * @summary Create Notification
   * @request POST:/routes/notifications
   */
  create_notification = (data: CreateNotificationRequest, params: RequestParams = {}) =>
    this.request<CreateNotificationData, CreateNotificationError>({
      path: `/routes/notifications`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags images, dbtn/module:images
   * @name upload_image
   * @summary Upload Image
   * @request POST:/routes/images/upload
   */
  upload_image = (query: UploadImageParams, data: BodyUploadImage, params: RequestParams = {}) =>
    this.request<UploadImageData, UploadImageError>({
      path: `/routes/images/upload`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * No description
   *
   * @tags images, dbtn/module:images
   * @name batch_upload_images
   * @summary Batch Upload Images
   * @request POST:/routes/images/batch-upload
   */
  batch_upload_images = (data: BodyBatchUploadImages, params: RequestParams = {}) =>
    this.request<BatchUploadImagesData, BatchUploadImagesError>({
      path: `/routes/images/batch-upload`,
      method: "POST",
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * @description Get an image by filename
   *
   * @tags images, dbtn/module:images
   * @name view_image
   * @summary View Image
   * @request GET:/routes/images/view/{filename}
   */
  view_image = ({ filename, ...query }: ViewImageParams, params: RequestParams = {}) =>
    this.request<ViewImageData, ViewImageError>({
      path: `/routes/images/view/${filename}`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags images, dbtn/module:images
   * @name list_images
   * @summary List Images
   * @request GET:/routes/images/list
   */
  list_images = (query: ListImagesParams, params: RequestParams = {}) =>
    this.request<ListImagesData, ListImagesError>({
      path: `/routes/images/list`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Submit content for moderation
   *
   * @tags dbtn/module:moderation
   * @name submit_content
   * @summary Submit Content
   * @request POST:/routes/moderation/submit
   */
  submit_content = (query: SubmitContentParams, data: SubmitContentPayload, params: RequestParams = {}) =>
    this.request<SubmitContentData, SubmitContentError>({
      path: `/routes/moderation/submit`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all pending submissions
   *
   * @tags dbtn/module:moderation
   * @name get_pending_submissions
   * @summary Get Pending Submissions
   * @request GET:/routes/moderation/pending
   */
  get_pending_submissions = (params: RequestParams = {}) =>
    this.request<GetPendingSubmissionsData, any>({
      path: `/routes/moderation/pending`,
      method: "GET",
      ...params,
    });

  /**
   * @description Take action on a submission (approve/reject)
   *
   * @tags dbtn/module:moderation
   * @name take_moderation_action
   * @summary Take Moderation Action
   * @request POST:/routes/moderation/action
   */
  take_moderation_action = (data: ModerationActionRequest, params: RequestParams = {}) =>
    this.request<TakeModerationActionData, TakeModerationActionError>({
      path: `/routes/moderation/action`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all submissions of a specific type
   *
   * @tags dbtn/module:moderation
   * @name get_submissions_by_type
   * @summary Get Submissions By Type
   * @request GET:/routes/moderation/submissions/{content_type}
   */
  get_submissions_by_type = ({ contentType, ...query }: GetSubmissionsByTypeParams, params: RequestParams = {}) =>
    this.request<GetSubmissionsByTypeData, GetSubmissionsByTypeError>({
      path: `/routes/moderation/submissions/${contentType}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description List all albums
   *
   * @tags dbtn/module:albums
   * @name list_albums
   * @summary List Albums
   * @request GET:/routes/albums
   */
  list_albums = (params: RequestParams = {}) =>
    this.request<ListAlbumsData, any>({
      path: `/routes/albums`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new album
   *
   * @tags dbtn/module:albums
   * @name create_album
   * @summary Create Album
   * @request POST:/routes/albums
   */
  create_album = (data: CreateAlbumRequest, params: RequestParams = {}) =>
    this.request<CreateAlbumData, CreateAlbumError>({
      path: `/routes/albums`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a specific album
   *
   * @tags dbtn/module:albums
   * @name get_album
   * @summary Get Album
   * @request GET:/routes/albums/{album_id}
   */
  get_album = ({ albumId, ...query }: GetAlbumParams, params: RequestParams = {}) =>
    this.request<GetAlbumData, GetAlbumError>({
      path: `/routes/albums/${albumId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update an album
   *
   * @tags dbtn/module:albums
   * @name update_album
   * @summary Update Album
   * @request PUT:/routes/albums/{album_id}
   */
  update_album = ({ albumId, ...query }: UpdateAlbumParams, data: UpdateAlbumRequest, params: RequestParams = {}) =>
    this.request<UpdateAlbumData, UpdateAlbumError>({
      path: `/routes/albums/${albumId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete an album
   *
   * @tags dbtn/module:albums
   * @name delete_album
   * @summary Delete Album
   * @request DELETE:/routes/albums/{album_id}
   */
  delete_album = ({ albumId, ...query }: DeleteAlbumParams, params: RequestParams = {}) =>
    this.request<DeleteAlbumData, DeleteAlbumError>({
      path: `/routes/albums/${albumId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Create albums based on video categories if they don't exist
   *
   * @tags dbtn/module:albums
   * @name sync_video_categories
   * @summary Sync Video Categories
   * @request POST:/routes/albums/sync-video-categories
   */
  sync_video_categories = (data: SyncVideoCategoriesPayload, params: RequestParams = {}) =>
    this.request<SyncVideoCategoriesData, SyncVideoCategoriesError>({
      path: `/routes/albums/sync-video-categories`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generates a weekly summary of newsletter subscribers and emails it to the provided list of admin email addresses.
   *
   * @tags scheduled-jobs, dbtn/module:scheduled_jobs
   * @name deliver_subscriber_report
   * @summary Generate and email the weekly subscriber report
   * @request POST:/routes/scheduled-jobs/deliver-subscriber-report
   */
  deliver_subscriber_report = (data: DeliverSubscriberReportPayload, params: RequestParams = {}) =>
    this.request<DeliverSubscriberReportData, DeliverSubscriberReportError>({
      path: `/routes/scheduled-jobs/deliver-subscriber-report`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all newsletter subscribers for admin dashboard
   *
   * @tags dbtn/module:newsletter
   * @name get_all_subscribers
   * @summary Get All Subscribers
   * @request GET:/routes/get-subscribers
   */
  get_all_subscribers = (params: RequestParams = {}) =>
    this.request<GetAllSubscribersData, any>({
      path: `/routes/get-subscribers`,
      method: "GET",
      ...params,
    });

  /**
   * @description Legacy route for subscribing to the newsletter
   *
   * @tags dbtn/module:newsletter
   * @name legacy_subscribe_route
   * @summary Legacy Subscribe Route
   * @request POST:/routes/routes/subscribe
   */
  legacy_subscribe_route = (data: NewsletterSubscriptionRequest, params: RequestParams = {}) =>
    this.request<LegacySubscribeRouteData, LegacySubscribeRouteError>({
      path: `/routes/routes/subscribe`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:newsletter
   * @name subscribe_to_newsletter
   * @summary Subscribe To Newsletter
   * @request POST:/routes/subscribe-to-newsletter
   */
  subscribe_to_newsletter = (data: NewsletterSubscriptionRequest, params: RequestParams = {}) =>
    this.request<SubscribeToNewsletterData, SubscribeToNewsletterError>({
      path: `/routes/subscribe-to-newsletter`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Unsubscribe a user from the newsletter.
   *
   * @tags dbtn/module:newsletter
   * @name unsubscribe_user
   * @summary Unsubscribe User
   * @request GET:/routes/unsubscribe/{subscriber_id}
   */
  unsubscribe_user = ({ subscriberId, ...query }: UnsubscribeUserParams, params: RequestParams = {}) =>
    this.request<UnsubscribeUserData, UnsubscribeUserError>({
      path: `/routes/unsubscribe/${subscriberId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Delete a newsletter subscriber by ID
   *
   * @tags dbtn/module:newsletter
   * @name delete_subscriber
   * @summary Delete Subscriber
   * @request DELETE:/routes/subscriber/{subscriber_id}
   */
  delete_subscriber = ({ subscriberId, ...query }: DeleteSubscriberParams, params: RequestParams = {}) =>
    this.request<DeleteSubscriberData, DeleteSubscriberError>({
      path: `/routes/subscriber/${subscriberId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description List all donation orders
   *
   * @tags dbtn/module:order
   * @name list_donation_orders
   * @summary List Donation Orders
   * @request GET:/routes/orders
   */
  list_donation_orders = (params: RequestParams = {}) =>
    this.request<ListDonationOrdersData, any>({
      path: `/routes/orders`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new donation order
   *
   * @tags dbtn/module:order
   * @name create_donation_order
   * @summary Create Donation Order
   * @request POST:/routes/orders
   */
  create_donation_order = (data: OrderRequest, params: RequestParams = {}) =>
    this.request<CreateDonationOrderData, CreateDonationOrderError>({
      path: `/routes/orders`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a specific donation order by ID
   *
   * @tags dbtn/module:order
   * @name get_donation_order
   * @summary Get Donation Order
   * @request GET:/routes/orders/{order_id}
   */
  get_donation_order = ({ orderId, ...query }: GetDonationOrderParams, params: RequestParams = {}) =>
    this.request<GetDonationOrderData, GetDonationOrderError>({
      path: `/routes/orders/${orderId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Submit a volunteer application
   *
   * @tags dbtn/module:volunteer
   * @name submit_volunteer_application
   * @summary Submit Volunteer Application
   * @request POST:/routes/volunteer
   */
  submit_volunteer_application = (data: VolunteerRequest, params: RequestParams = {}) =>
    this.request<SubmitVolunteerApplicationData, SubmitVolunteerApplicationError>({
      path: `/routes/volunteer`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all blog posts
   *
   * @tags dbtn/module:blog
   * @name get_blog_posts
   * @summary Get Blog Posts
   * @request GET:/routes/blog/posts
   */
  get_blog_posts = (params: RequestParams = {}) =>
    this.request<GetBlogPostsData, any>({
      path: `/routes/blog/posts`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new blog post
   *
   * @tags dbtn/module:blog
   * @name create_blog_post
   * @summary Create Blog Post
   * @request POST:/routes/blog/posts
   */
  create_blog_post = (data: CreateBlogPostRequest, params: RequestParams = {}) =>
    this.request<CreateBlogPostData, CreateBlogPostError>({
      path: `/routes/blog/posts`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Migrate form submissions from localStorage to the centralized system
   *
   * @tags migration, dbtn/module:migration
   * @name migrate_from_local_storage2
   * @summary Migrate From Local Storage2
   * @request POST:/routes/migration/local-storage
   */
  migrate_from_local_storage2 = (data: MigrateFromLocalStorage2Payload, params: RequestParams = {}) =>
    this.request<MigrateFromLocalStorage2Data, MigrateFromLocalStorage2Error>({
      path: `/routes/migration/local-storage`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:stories
   * @name get_success_stories
   * @summary Get Success Stories
   * @request GET:/routes/success-stories
   */
  get_success_stories = (params: RequestParams = {}) =>
    this.request<GetSuccessStoriesData, any>({
      path: `/routes/success-stories`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:community
   * @name submit_success_story_form
   * @summary Submit Success Story Form
   * @request POST:/routes/success-stories
   */
  submit_success_story_form = (data: BodySubmitSuccessStoryForm, params: RequestParams = {}) =>
    this.request<SubmitSuccessStoryFormData, SubmitSuccessStoryFormError>({
      path: `/routes/success-stories`,
      method: "POST",
      body: data,
      type: ContentType.FormData,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:community
   * @name get_community_stats
   * @summary Get Community Stats
   * @request GET:/routes/community-stats
   */
  get_community_stats = (params: RequestParams = {}) =>
    this.request<GetCommunityStatsData, any>({
      path: `/routes/community-stats`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:stories
   * @name submit_success_story
   * @summary Submit Success Story
   * @request POST:/routes/success-story
   */
  submit_success_story = (data: SuccessStoryRequest, params: RequestParams = {}) =>
    this.request<SubmitSuccessStoryData, SubmitSuccessStoryError>({
      path: `/routes/success-story`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:stories
   * @name get_story_community_stats
   * @summary Get Story Community Stats
   * @request GET:/routes/story-community-stats
   */
  get_story_community_stats = (params: RequestParams = {}) =>
    this.request<GetStoryCommunityStatsData, any>({
      path: `/routes/story-community-stats`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new fundraising campaign
   *
   * @tags dbtn/module:campaigns
   * @name create_campaign
   * @summary Create Campaign
   * @request POST:/routes/campaigns
   */
  create_campaign = (data: CampaignCreate, params: RequestParams = {}) =>
    this.request<CreateCampaignData, CreateCampaignError>({
      path: `/routes/campaigns`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all fundraising campaigns
   *
   * @tags dbtn/module:campaigns
   * @name list_campaigns
   * @summary List Campaigns
   * @request GET:/routes/campaigns
   */
  list_campaigns = (query: ListCampaignsParams, params: RequestParams = {}) =>
    this.request<ListCampaignsData, ListCampaignsError>({
      path: `/routes/campaigns`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific campaign by ID
   *
   * @tags dbtn/module:campaigns
   * @name get_campaign
   * @summary Get Campaign
   * @request GET:/routes/campaigns/{campaign_id}
   */
  get_campaign = ({ campaignId, ...query }: GetCampaignParams, params: RequestParams = {}) =>
    this.request<GetCampaignData, GetCampaignError>({
      path: `/routes/campaigns/${campaignId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a campaign's details
   *
   * @tags dbtn/module:campaigns
   * @name update_campaign
   * @summary Update Campaign
   * @request PUT:/routes/campaigns/{campaign_id}
   */
  update_campaign = (
    { campaignId, ...query }: UpdateCampaignParams,
    data: CampaignUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateCampaignData, UpdateCampaignError>({
      path: `/routes/campaigns/${campaignId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Add a donation to a campaign
   *
   * @tags dbtn/module:campaigns
   * @name add_donation_to_campaign
   * @summary Add Donation To Campaign
   * @request POST:/routes/campaigns/{campaign_id}/donate
   */
  add_donation_to_campaign = (
    { campaignId, ...query }: AddDonationToCampaignParams,
    data: DonationUpdate,
    params: RequestParams = {},
  ) =>
    this.request<AddDonationToCampaignData, AddDonationToCampaignError>({
      path: `/routes/campaigns/${campaignId}/donate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Reset a campaign's progress (for admin purposes)
   *
   * @tags dbtn/module:campaigns
   * @name reset_campaign
   * @summary Reset Campaign
   * @request POST:/routes/campaigns/{campaign_id}/reset
   */
  reset_campaign = ({ campaignId, ...query }: ResetCampaignParams, params: RequestParams = {}) =>
    this.request<ResetCampaignData, ResetCampaignError>({
      path: `/routes/campaigns/${campaignId}/reset`,
      method: "POST",
      ...params,
    });

  /**
   * @description Process a transcript from Play.ai and create order if applicable
   *
   * @tags dbtn/module:transcript
   * @name process_transcript
   * @summary Process Transcript
   * @request POST:/routes/process
   */
  process_transcript = (data: TranscriptRequest, params: RequestParams = {}) =>
    this.request<ProcessTranscriptData, ProcessTranscriptError>({
      path: `/routes/process`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a processed transcript by session ID
   *
   * @tags dbtn/module:transcript
   * @name get_processed_transcript
   * @summary Get Processed Transcript
   * @request GET:/routes/get/{session_id}
   */
  get_processed_transcript = ({ sessionId, ...query }: GetProcessedTranscriptParams, params: RequestParams = {}) =>
    this.request<GetProcessedTranscriptData, GetProcessedTranscriptError>({
      path: `/routes/get/${sessionId}`,
      method: "GET",
      ...params,
    });
}
