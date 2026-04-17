import { apiClient } from "app";
import { FormServiceFallback } from "./formServiceFallback";

// Form submission types
export type FormType = 
  | "contact" 
  | "volunteer" 
  | "newsletter" 
  | "success_stories" 
  | "feedback" 
  | "donations";

export interface FormSubmission {
  id: string;
  form_type: FormType;
  timestamp: string;
  data: Record<string, any>;
}

export interface FormSubmissionFilter {
  form_types?: FormType[];
  start_date?: string;
  end_date?: string;
  search_term?: string;
}

export interface FormSubmissionsList {
  submissions: FormSubmission[];
}

export interface FormSubmissionResponse {
  success: boolean;
  message: string;
  submission_id?: string;
}

export interface FormSubmissionExportOptions {
  format: "json" | "csv";
  filter?: FormSubmissionFilter;
}

export interface FormSubmissionExportResponse {
  success: boolean;
  format: "json" | "csv";
  data: any;
}

/**
 * FormSubmissionsService - centralized service for managing form submissions
 */
export class FormSubmissionsService {
  /**
   * Get all form submissions with optional filtering
   */
  static async getSubmissions(filter?: FormSubmissionFilter): Promise<FormSubmission[]> {
    try {
      // Prepare query params
      const params: Record<string, string> = {};
      
      if (filter?.form_types && filter.form_types.length > 0) {
        filter.form_types.forEach((type, index) => {
          params[`form_types=${type}`] = "";
        });
      }
      
      if (filter?.search_term) {
        params['search'] = filter.search_term;
      }
      
      if (filter?.start_date) {
        params['start_date'] = filter.start_date;
      }
      
      if (filter?.end_date) {
        params['end_date'] = filter.end_date;
      }
      
      // Call the API
      const response = await apiClient.get_all_submissions(params);
      const data: FormSubmissionsList = await response.json();
      return data.submissions;
    } catch (error) {
      console.error("Error fetching form submissions:", error);
      return [];
    }
  }
  
  /**
   * Delete a form submission
   */
  static async deleteSubmission(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete_submission({ submission_id: id });
      const data: FormSubmissionResponse = await response.json();
      return data.success;
    } catch (error) {
      console.error("Error deleting form submission:", error);
      return false;
    }
  }
  
  /**
   * Export form submissions
   */
  static async exportSubmissions(options: FormSubmissionExportOptions): Promise<FormSubmissionExportResponse | null> {
    try {
      const response = await apiClient.export_submissions(options);
      const data: FormSubmissionExportResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error exporting form submissions:", error);
      return null;
    }
  }
  
  /**
   * Migrate data from localStorage to centralized storage
   */
  static async migrateFromLocalStorage(): Promise<boolean> {
    try {
      // Get all data from local storage
      const localStorageData = FormServiceFallback.exportAllData();
      
      // Send to migration endpoint
      const response = await apiClient.migrate_from_local_storage(localStorageData);
      const data: FormSubmissionResponse = await response.json();
      
      return data.success;
    } catch (error) {
      console.error("Error migrating from localStorage:", error);
      return false;
    }
  }
}
