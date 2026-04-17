import {
  AddDonationToCampaignData,
  AnalyticsEvent,
  BatchUploadImagesData,
  BodyBatchUploadImages,
  BodySubmitSuccessStoryForm,
  BodyUploadImage,
  CampaignCreate,
  CampaignUpdate,
  CheckHealthData,
  ContactRequest,
  ContentType,
  CreateAlbumData,
  CreateAlbumRequest,
  CreateBlogPostData,
  CreateBlogPostRequest,
  CreateCampaignData,
  CreateDonationOrderData,
  CreateNotificationData,
  CreateNotificationRequest,
  CreateOrderData,
  CreatePaymentData,
  CreateSubmissionData,
  DeleteAlbumData,
  DeleteSubmissionData,
  DeleteSubscriberData,
  DeliverSubscriberReportData,
  DeliverSubscriberReportPayload,
  DonationUpdate,
  ExportSubmissionsData,
  FeedbackRequest,
  FormSubmissionCreate,
  FormSubmissionExport,
  FormSubmissionUpdate,
  GetAlbumData,
  GetAllSubmissionsData,
  GetAllSubscribersData,
  GetBlogPostsData,
  GetCampaignData,
  GetCommunityStatsData,
  GetCrmSubmissionsData,
  GetDonationOrderData,
  GetEventsSummaryData,
  GetFeedbackStatsData,
  GetNotificationsData,
  GetOrderData,
  GetPendingSubmissionsData,
  GetProcessedTranscriptData,
  GetStoryCommunityStatsData,
  GetSubmissionData,
  GetSubmissionsByTypeData,
  GetSuccessStoriesData,
  LegacySubscribeRouteData,
  ListAlbumsData,
  ListCampaignsData,
  ListDonationOrdersData,
  ListImagesData,
  ListOrdersData,
  MigrateFromLocalStorage2Data,
  MigrateFromLocalStorage2Payload,
  MigrateFromLocalStorageData,
  MigrateFromLocalStoragePayload,
  ModerationActionRequest,
  NewsletterSubscriptionRequest,
  OrderInput,
  OrderRequest,
  PaymentRequest,
  ProcessTranscriptData,
  ResetCampaignData,
  SubmitContactData,
  SubmitContentData,
  SubmitContentPayload,
  SubmitFeedbackData,
  SubmitSuccessStoryData,
  SubmitSuccessStoryFormData,
  SubmitVolunteerApplicationData,
  SubscribeToNewsletterData,
  SuccessStoryRequest,
  SyncVideoCategoriesData,
  SyncVideoCategoriesPayload,
  TakeModerationActionData,
  TestNotificationData,
  TrackEventData,
  TranscriptRequest,
  UnsubscribeUserData,
  UpdateAlbumData,
  UpdateAlbumRequest,
  UpdateCampaignData,
  UpdateSubmissionData,
  UploadImageData,
  ViewImageData,
  VolunteerRequest,
} from "./data-contracts";

export namespace Apiclient {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Track a user interaction event
   * @tags dbtn/module:analytics
   * @name track_event
   * @summary Track Event
   * @request POST:/routes/track-event
   */
  export namespace track_event {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AnalyticsEvent;
    export type RequestHeaders = {};
    export type ResponseBody = TrackEventData;
  }

  /**
   * @description Get a summary of tracked events
   * @tags dbtn/module:analytics
   * @name get_events_summary
   * @summary Get Events Summary
   * @request GET:/routes/events-summary
   */
  export namespace get_events_summary {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetEventsSummaryData;
  }

  /**
   * No description
   * @tags dbtn/module:crm
   * @name get_crm_submissions
   * @summary Get Crm Submissions
   * @request GET:/routes/crm/submissions
   */
  export namespace get_crm_submissions {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCrmSubmissionsData;
  }

  /**
   * @description Create a new payment and return the Cash App payment URL
   * @tags dbtn/module:payments
   * @name create_payment
   * @summary Create Payment
   * @request POST:/routes/payments/create
   */
  export namespace create_payment {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = PaymentRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreatePaymentData;
  }

  /**
   * @description Create a new form submission
   * @tags form-submissions, dbtn/module:form_submissions
   * @name create_submission
   * @summary Create Submission
   * @request POST:/routes/form-submissions/
   */
  export namespace create_submission {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FormSubmissionCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateSubmissionData;
  }

  /**
   * @description Get all form submissions with optional filtering
   * @tags form-submissions, dbtn/module:form_submissions
   * @name get_all_submissions
   * @summary Get All Submissions
   * @request GET:/routes/form-submissions/
   */
  export namespace get_all_submissions {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAllSubmissionsData;
  }

  /**
   * @description Get a single form submission by ID
   * @tags form-submissions, dbtn/module:form_submissions
   * @name get_submission
   * @summary Get Submission
   * @request GET:/routes/form-submissions/{submission_id}
   */
  export namespace get_submission {
    export type RequestParams = {
      /**
       * Submission Id
       * The ID of the form submission to get
       */
      submissionId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSubmissionData;
  }

  /**
   * @description Delete a form submission by ID
   * @tags form-submissions, dbtn/module:form_submissions
   * @name delete_submission
   * @summary Delete Submission
   * @request DELETE:/routes/form-submissions/{submission_id}
   */
  export namespace delete_submission {
    export type RequestParams = {
      /**
       * Submission Id
       * The ID of the form submission to delete
       */
      submissionId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteSubmissionData;
  }

  /**
   * @description Update a form submission by ID
   * @tags form-submissions, dbtn/module:form_submissions
   * @name update_submission
   * @summary Update Submission
   * @request PUT:/routes/form-submissions/{submission_id}
   */
  export namespace update_submission {
    export type RequestParams = {
      /**
       * Submission Id
       * The ID of the form submission to update
       */
      submissionId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = FormSubmissionUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateSubmissionData;
  }

  /**
   * @description Export form submissions as JSON or CSV
   * @tags form-submissions, dbtn/module:form_submissions
   * @name export_submissions
   * @summary Export Submissions
   * @request POST:/routes/form-submissions/export
   */
  export namespace export_submissions {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FormSubmissionExport;
    export type RequestHeaders = {};
    export type ResponseBody = ExportSubmissionsData;
  }

  /**
   * @description Migrate form submissions from localStorage to the centralized system
   * @tags form-submissions, dbtn/module:form_submissions
   * @name migrate_from_local_storage
   * @summary Migrate From Local Storage
   * @request POST:/routes/form-submissions/migrate-local-storage
   */
  export namespace migrate_from_local_storage {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MigrateFromLocalStoragePayload;
    export type RequestHeaders = {};
    export type ResponseBody = MigrateFromLocalStorageData;
  }

  /**
   * No description
   * @tags dbtn/module:feedback
   * @name submit_feedback
   * @summary Submit Feedback
   * @request POST:/routes/feedback
   */
  export namespace submit_feedback {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FeedbackRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SubmitFeedbackData;
  }

  /**
   * No description
   * @tags dbtn/module:feedback
   * @name get_feedback_stats
   * @summary Get Feedback Stats
   * @request GET:/routes/feedback/stats
   */
  export namespace get_feedback_stats {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFeedbackStatsData;
  }

  /**
   * @description Submit a contact form
   * @tags dbtn/module:contact
   * @name submit_contact
   * @summary Submit Contact
   * @request POST:/routes/contact
   */
  export namespace submit_contact {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ContactRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SubmitContactData;
  }

  /**
   * @description Create a new order and send notifications
   * @tags dbtn/module:orders
   * @name create_order
   * @summary Create Order
   * @request POST:/routes/create
   */
  export namespace create_order {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = OrderInput;
    export type RequestHeaders = {};
    export type ResponseBody = CreateOrderData;
  }

  /**
   * @description List all orders
   * @tags dbtn/module:orders
   * @name list_orders
   * @summary List Orders
   * @request GET:/routes/list
   */
  export namespace list_orders {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListOrdersData;
  }

  /**
   * @description Get a specific order
   * @tags dbtn/module:orders
   * @name get_order
   * @summary Get Order
   * @request GET:/routes/get/{order_id}
   */
  export namespace get_order {
    export type RequestParams = {
      /** Order Id */
      orderId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetOrderData;
  }

  /**
   * @description Test endpoint for email notifications (development only)
   * @tags admin, dbtn/module:email_notifications
   * @name test_notification
   * @summary Test Notification
   * @request POST:/routes/test-notification
   */
  export namespace test_notification {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Template Type */
      template_type:
        | "volunteer_application"
        | "contact_form"
        | "donation"
        | "feedback"
        | "success_story"
        | "newsletter";
      /** Recipient Email */
      recipient_email: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = TestNotificationData;
  }

  /**
   * @description Get all notifications
   * @tags dbtn/module:notifications
   * @name get_notifications
   * @summary Get Notifications
   * @request GET:/routes/notifications
   */
  export namespace get_notifications {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetNotificationsData;
  }

  /**
   * @description Create a new notification
   * @tags dbtn/module:notifications
   * @name create_notification
   * @summary Create Notification
   * @request POST:/routes/notifications
   */
  export namespace create_notification {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateNotificationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateNotificationData;
  }

  /**
   * No description
   * @tags images, dbtn/module:images
   * @name upload_image
   * @summary Upload Image
   * @request POST:/routes/images/upload
   */
  export namespace upload_image {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Title */
      title?: string | null;
      /** Category */
      category?: string | null;
      /** Description */
      description?: string | null;
    };
    export type RequestBody = BodyUploadImage;
    export type RequestHeaders = {};
    export type ResponseBody = UploadImageData;
  }

  /**
   * No description
   * @tags images, dbtn/module:images
   * @name batch_upload_images
   * @summary Batch Upload Images
   * @request POST:/routes/images/batch-upload
   */
  export namespace batch_upload_images {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyBatchUploadImages;
    export type RequestHeaders = {};
    export type ResponseBody = BatchUploadImagesData;
  }

  /**
   * @description Get an image by filename
   * @tags images, dbtn/module:images
   * @name view_image
   * @summary View Image
   * @request GET:/routes/images/view/{filename}
   */
  export namespace view_image {
    export type RequestParams = {
      /** Filename */
      filename: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ViewImageData;
  }

  /**
   * No description
   * @tags images, dbtn/module:images
   * @name list_images
   * @summary List Images
   * @request GET:/routes/images/list
   */
  export namespace list_images {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Category */
      category?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListImagesData;
  }

  /**
   * @description Submit content for moderation
   * @tags dbtn/module:moderation
   * @name submit_content
   * @summary Submit Content
   * @request POST:/routes/moderation/submit
   */
  export namespace submit_content {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Content types that require moderation */
      content_type: ContentType;
    };
    export type RequestBody = SubmitContentPayload;
    export type RequestHeaders = {};
    export type ResponseBody = SubmitContentData;
  }

  /**
   * @description Get all pending submissions
   * @tags dbtn/module:moderation
   * @name get_pending_submissions
   * @summary Get Pending Submissions
   * @request GET:/routes/moderation/pending
   */
  export namespace get_pending_submissions {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPendingSubmissionsData;
  }

  /**
   * @description Take action on a submission (approve/reject)
   * @tags dbtn/module:moderation
   * @name take_moderation_action
   * @summary Take Moderation Action
   * @request POST:/routes/moderation/action
   */
  export namespace take_moderation_action {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ModerationActionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = TakeModerationActionData;
  }

  /**
   * @description Get all submissions of a specific type
   * @tags dbtn/module:moderation
   * @name get_submissions_by_type
   * @summary Get Submissions By Type
   * @request GET:/routes/moderation/submissions/{content_type}
   */
  export namespace get_submissions_by_type {
    export type RequestParams = {
      /** Content types that require moderation */
      contentType: ContentType;
    };
    export type RequestQuery = {
      /** Status */
      status?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSubmissionsByTypeData;
  }

  /**
   * @description List all albums
   * @tags dbtn/module:albums
   * @name list_albums
   * @summary List Albums
   * @request GET:/routes/albums
   */
  export namespace list_albums {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListAlbumsData;
  }

  /**
   * @description Create a new album
   * @tags dbtn/module:albums
   * @name create_album
   * @summary Create Album
   * @request POST:/routes/albums
   */
  export namespace create_album {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateAlbumRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateAlbumData;
  }

  /**
   * @description Get a specific album
   * @tags dbtn/module:albums
   * @name get_album
   * @summary Get Album
   * @request GET:/routes/albums/{album_id}
   */
  export namespace get_album {
    export type RequestParams = {
      /** Album Id */
      albumId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAlbumData;
  }

  /**
   * @description Update an album
   * @tags dbtn/module:albums
   * @name update_album
   * @summary Update Album
   * @request PUT:/routes/albums/{album_id}
   */
  export namespace update_album {
    export type RequestParams = {
      /** Album Id */
      albumId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateAlbumRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateAlbumData;
  }

  /**
   * @description Delete an album
   * @tags dbtn/module:albums
   * @name delete_album
   * @summary Delete Album
   * @request DELETE:/routes/albums/{album_id}
   */
  export namespace delete_album {
    export type RequestParams = {
      /** Album Id */
      albumId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteAlbumData;
  }

  /**
   * @description Create albums based on video categories if they don't exist
   * @tags dbtn/module:albums
   * @name sync_video_categories
   * @summary Sync Video Categories
   * @request POST:/routes/albums/sync-video-categories
   */
  export namespace sync_video_categories {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SyncVideoCategoriesPayload;
    export type RequestHeaders = {};
    export type ResponseBody = SyncVideoCategoriesData;
  }

  /**
   * @description Generates a weekly summary of newsletter subscribers and emails it to the provided list of admin email addresses.
   * @tags scheduled-jobs, dbtn/module:scheduled_jobs
   * @name deliver_subscriber_report
   * @summary Generate and email the weekly subscriber report
   * @request POST:/routes/scheduled-jobs/deliver-subscriber-report
   */
  export namespace deliver_subscriber_report {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = DeliverSubscriberReportPayload;
    export type RequestHeaders = {};
    export type ResponseBody = DeliverSubscriberReportData;
  }

  /**
   * @description Get all newsletter subscribers for admin dashboard
   * @tags dbtn/module:newsletter
   * @name get_all_subscribers
   * @summary Get All Subscribers
   * @request GET:/routes/get-subscribers
   */
  export namespace get_all_subscribers {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAllSubscribersData;
  }

  /**
   * @description Legacy route for subscribing to the newsletter
   * @tags dbtn/module:newsletter
   * @name legacy_subscribe_route
   * @summary Legacy Subscribe Route
   * @request POST:/routes/routes/subscribe
   */
  export namespace legacy_subscribe_route {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = NewsletterSubscriptionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = LegacySubscribeRouteData;
  }

  /**
   * No description
   * @tags dbtn/module:newsletter
   * @name subscribe_to_newsletter
   * @summary Subscribe To Newsletter
   * @request POST:/routes/subscribe-to-newsletter
   */
  export namespace subscribe_to_newsletter {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = NewsletterSubscriptionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SubscribeToNewsletterData;
  }

  /**
   * @description Unsubscribe a user from the newsletter.
   * @tags dbtn/module:newsletter
   * @name unsubscribe_user
   * @summary Unsubscribe User
   * @request GET:/routes/unsubscribe/{subscriber_id}
   */
  export namespace unsubscribe_user {
    export type RequestParams = {
      /** Subscriber Id */
      subscriberId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = UnsubscribeUserData;
  }

  /**
   * @description Delete a newsletter subscriber by ID
   * @tags dbtn/module:newsletter
   * @name delete_subscriber
   * @summary Delete Subscriber
   * @request DELETE:/routes/subscriber/{subscriber_id}
   */
  export namespace delete_subscriber {
    export type RequestParams = {
      /** Subscriber Id */
      subscriberId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteSubscriberData;
  }

  /**
   * @description List all donation orders
   * @tags dbtn/module:order
   * @name list_donation_orders
   * @summary List Donation Orders
   * @request GET:/routes/orders
   */
  export namespace list_donation_orders {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListDonationOrdersData;
  }

  /**
   * @description Create a new donation order
   * @tags dbtn/module:order
   * @name create_donation_order
   * @summary Create Donation Order
   * @request POST:/routes/orders
   */
  export namespace create_donation_order {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = OrderRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateDonationOrderData;
  }

  /**
   * @description Get a specific donation order by ID
   * @tags dbtn/module:order
   * @name get_donation_order
   * @summary Get Donation Order
   * @request GET:/routes/orders/{order_id}
   */
  export namespace get_donation_order {
    export type RequestParams = {
      /** Order Id */
      orderId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDonationOrderData;
  }

  /**
   * @description Submit a volunteer application
   * @tags dbtn/module:volunteer
   * @name submit_volunteer_application
   * @summary Submit Volunteer Application
   * @request POST:/routes/volunteer
   */
  export namespace submit_volunteer_application {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = VolunteerRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SubmitVolunteerApplicationData;
  }

  /**
   * @description Get all blog posts
   * @tags dbtn/module:blog
   * @name get_blog_posts
   * @summary Get Blog Posts
   * @request GET:/routes/blog/posts
   */
  export namespace get_blog_posts {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBlogPostsData;
  }

  /**
   * @description Create a new blog post
   * @tags dbtn/module:blog
   * @name create_blog_post
   * @summary Create Blog Post
   * @request POST:/routes/blog/posts
   */
  export namespace create_blog_post {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateBlogPostRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateBlogPostData;
  }

  /**
   * @description Migrate form submissions from localStorage to the centralized system
   * @tags migration, dbtn/module:migration
   * @name migrate_from_local_storage2
   * @summary Migrate From Local Storage2
   * @request POST:/routes/migration/local-storage
   */
  export namespace migrate_from_local_storage2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MigrateFromLocalStorage2Payload;
    export type RequestHeaders = {};
    export type ResponseBody = MigrateFromLocalStorage2Data;
  }

  /**
   * No description
   * @tags dbtn/module:stories
   * @name get_success_stories
   * @summary Get Success Stories
   * @request GET:/routes/success-stories
   */
  export namespace get_success_stories {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSuccessStoriesData;
  }

  /**
   * No description
   * @tags dbtn/module:community
   * @name submit_success_story_form
   * @summary Submit Success Story Form
   * @request POST:/routes/success-stories
   */
  export namespace submit_success_story_form {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodySubmitSuccessStoryForm;
    export type RequestHeaders = {};
    export type ResponseBody = SubmitSuccessStoryFormData;
  }

  /**
   * No description
   * @tags dbtn/module:community
   * @name get_community_stats
   * @summary Get Community Stats
   * @request GET:/routes/community-stats
   */
  export namespace get_community_stats {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCommunityStatsData;
  }

  /**
   * No description
   * @tags dbtn/module:stories
   * @name submit_success_story
   * @summary Submit Success Story
   * @request POST:/routes/success-story
   */
  export namespace submit_success_story {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SuccessStoryRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SubmitSuccessStoryData;
  }

  /**
   * No description
   * @tags dbtn/module:stories
   * @name get_story_community_stats
   * @summary Get Story Community Stats
   * @request GET:/routes/story-community-stats
   */
  export namespace get_story_community_stats {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetStoryCommunityStatsData;
  }

  /**
   * @description Create a new fundraising campaign
   * @tags dbtn/module:campaigns
   * @name create_campaign
   * @summary Create Campaign
   * @request POST:/routes/campaigns
   */
  export namespace create_campaign {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CampaignCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateCampaignData;
  }

  /**
   * @description List all fundraising campaigns
   * @tags dbtn/module:campaigns
   * @name list_campaigns
   * @summary List Campaigns
   * @request GET:/routes/campaigns
   */
  export namespace list_campaigns {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Active Only
       * @default false
       */
      active_only?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListCampaignsData;
  }

  /**
   * @description Get a specific campaign by ID
   * @tags dbtn/module:campaigns
   * @name get_campaign
   * @summary Get Campaign
   * @request GET:/routes/campaigns/{campaign_id}
   */
  export namespace get_campaign {
    export type RequestParams = {
      /** Campaign Id */
      campaignId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCampaignData;
  }

  /**
   * @description Update a campaign's details
   * @tags dbtn/module:campaigns
   * @name update_campaign
   * @summary Update Campaign
   * @request PUT:/routes/campaigns/{campaign_id}
   */
  export namespace update_campaign {
    export type RequestParams = {
      /** Campaign Id */
      campaignId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = CampaignUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateCampaignData;
  }

  /**
   * @description Add a donation to a campaign
   * @tags dbtn/module:campaigns
   * @name add_donation_to_campaign
   * @summary Add Donation To Campaign
   * @request POST:/routes/campaigns/{campaign_id}/donate
   */
  export namespace add_donation_to_campaign {
    export type RequestParams = {
      /** Campaign Id */
      campaignId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = DonationUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = AddDonationToCampaignData;
  }

  /**
   * @description Reset a campaign's progress (for admin purposes)
   * @tags dbtn/module:campaigns
   * @name reset_campaign
   * @summary Reset Campaign
   * @request POST:/routes/campaigns/{campaign_id}/reset
   */
  export namespace reset_campaign {
    export type RequestParams = {
      /** Campaign Id */
      campaignId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ResetCampaignData;
  }

  /**
   * @description Process a transcript from Play.ai and create order if applicable
   * @tags dbtn/module:transcript
   * @name process_transcript
   * @summary Process Transcript
   * @request POST:/routes/process
   */
  export namespace process_transcript {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TranscriptRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ProcessTranscriptData;
  }

  /**
   * @description Get a processed transcript by session ID
   * @tags dbtn/module:transcript
   * @name get_processed_transcript
   * @summary Get Processed Transcript
   * @request GET:/routes/get/{session_id}
   */
  export namespace get_processed_transcript {
    export type RequestParams = {
      /** Session Id */
      sessionId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProcessedTranscriptData;
  }
}
