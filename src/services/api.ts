/**
 * Frontend API Client Foundation
 *
 * Provides a typed, reusable API request abstraction for the React frontend
 * to communicate with the Express backend, with automatic Firebase Bearer token injection.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface HealthCheckData {
  status: "healthy" | "degraded";
  environment: string;
  uptime: number;
  timestamp: string;
  database: {
    status: "connected" | "disconnected" | "error";
    provider: "sqlite" | "postgresql";
    latencyMs?: number;
    error?: string;
  };
}

export interface AuthUserData {
  id: string;
  firebase_uid: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  profile_photo_url: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthProfileResponse {
  user: AuthUserData;
  roles: string[];
  permissions: string[];
}

export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type WorkplaceType = "REMOTE" | "HYBRID" | "ONSITE";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

export interface Job {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  requirements: string | null;
  location: string | null;
  workplace_type: WorkplaceType;
  employment_type: EmploymentType;
  application_deadline: string | null;
  status: JobStatus;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  category: JobCategory | null;
  skills: Skill[];
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  private readonly baseUrl: string;
  private tokenGetter: (() => Promise<string | null>) | null = null;
  private staticToken: string | null = null;

  constructor(baseUrl: string = (import.meta.env?.VITE_API_URL as string) || "/api") {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Configure dynamic Firebase token provider
   */
  setTokenGetter(getter: () => Promise<string | null>): void {
    this.tokenGetter = getter;
  }

  /**
   * Set a static token (useful for scripts or tests)
   */
  setAuthToken(token: string | null): void {
    this.staticToken = token;
  }

  /**
   * Generic request wrapper with type safety and centralized error handling
   */
  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Inject Bearer token if not already explicitly provided in headers
    if (!headers.Authorization && !headers.authorization) {
      let token = this.staticToken;
      if (!token && this.tokenGetter) {
        try {
          token = await this.tokenGetter();
        } catch {
          // Ignore token fetch error for public endpoints
        }
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = (await response.json()) as ApiResponse<T>;

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `Request failed with status ${response.status}`,
          error: data.error,
        };
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network request failed";
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  }

  /**
   * Health Check: GET /api/health
   */
  async checkHealth(): Promise<ApiResponse<HealthCheckData>> {
    return this.request<HealthCheckData>("/health", {
      method: "GET",
    });
  }

  /**
   * User Synchronization: POST /api/auth/sync
   */
  async syncUser(
    profileData?: { full_name?: string; phone?: string; profile_photo_url?: string },
    explicitToken?: string
  ): Promise<ApiResponse<AuthProfileResponse>> {
    const headers: Record<string, string> = {};
    if (explicitToken) {
      headers.Authorization = `Bearer ${explicitToken}`;
    }

    return this.request<AuthProfileResponse>("/auth/sync", {
      method: "POST",
      headers,
      body: JSON.stringify(profileData || {}),
    });
  }

  /**
   * Get Current Authenticated Profile: GET /api/auth/me
   */
  async getMe(explicitToken?: string): Promise<ApiResponse<AuthProfileResponse>> {
    const headers: Record<string, string> = {};
    if (explicitToken) {
      headers.Authorization = `Bearer ${explicitToken}`;
    }

    return this.request<AuthProfileResponse>("/auth/me", {
      method: "GET",
      headers,
    });
  }

  // ==========================================
  // Public Careers & Jobs Endpoints
  // ==========================================

  /**
   * Get Published Jobs: GET /api/jobs
   */
  async getPublicJobs(params?: {
    search?: string;
    category?: string;
    workplace_type?: WorkplaceType;
    employment_type?: EmploymentType;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Job[]> & { pagination?: PaginatedResult<Job>["pagination"] }> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    if (params?.workplace_type) query.set("workplace_type", params.workplace_type);
    if (params?.employment_type) query.set("employment_type", params.employment_type);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());

    const queryString = query.toString();
    return this.request<Job[]>(`/jobs${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    }) as any;
  }

  /**
   * Get Single Published Job by Slug: GET /api/jobs/:slug
   */
  async getPublicJobBySlug(slug: string): Promise<ApiResponse<Job>> {
    return this.request<Job>(`/jobs/${slug}`, {
      method: "GET",
    });
  }

  /**
   * Get Active Job Categories: GET /api/job-categories
   */
  async getPublicCategories(): Promise<ApiResponse<JobCategory[]>> {
    return this.request<JobCategory[]>("/job-categories", {
      method: "GET",
    });
  }

  /**
   * Get Active Skills: GET /api/skills
   */
  async getPublicSkills(): Promise<ApiResponse<Skill[]>> {
    return this.request<Skill[]>("/skills", {
      method: "GET",
    });
  }

  // ==========================================
  // Protected Admin Jobs Endpoints
  // ==========================================

  /**
   * Admin List Jobs: GET /api/admin/jobs
   */
  async getAdminJobs(params?: {
    status?: JobStatus;
    category_id?: string;
    workplace_type?: WorkplaceType;
    employment_type?: EmploymentType;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Job[]> & { pagination?: PaginatedResult<Job>["pagination"] }> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.category_id) query.set("category_id", params.category_id);
    if (params?.workplace_type) query.set("workplace_type", params.workplace_type);
    if (params?.employment_type) query.set("employment_type", params.employment_type);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());

    const queryString = query.toString();
    return this.request<Job[]>(`/admin/jobs${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    }) as any;
  }

  /**
   * Admin Get Job By ID: GET /api/admin/jobs/:id
   */
  async getAdminJobById(id: string): Promise<ApiResponse<Job>> {
    return this.request<Job>(`/admin/jobs/${id}`, {
      method: "GET",
    });
  }

  /**
   * Admin Create Job: POST /api/admin/jobs
   */
  async createAdminJob(data: {
    title: string;
    category_id?: string | null;
    description?: string | null;
    requirements?: string | null;
    location?: string | null;
    workplace_type: WorkplaceType;
    employment_type: EmploymentType;
    application_deadline?: string | null;
    status?: JobStatus;
    skill_ids?: string[];
  }): Promise<ApiResponse<Job>> {
    return this.request<Job>("/admin/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Admin Update Job: PUT /api/admin/jobs/:id
   */
  async updateAdminJob(
    id: string,
    data: Partial<{
      title: string;
      category_id: string | null;
      description: string | null;
      requirements: string | null;
      location: string | null;
      workplace_type: WorkplaceType;
      employment_type: EmploymentType;
      application_deadline: string | null;
      status: JobStatus;
      skill_ids: string[];
    }>
  ): Promise<ApiResponse<Job>> {
    return this.request<Job>(`/admin/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Admin Publish Job: POST /api/admin/jobs/:id/publish
   */
  async publishAdminJob(id: string): Promise<ApiResponse<Job>> {
    return this.request<Job>(`/admin/jobs/${id}/publish`, {
      method: "POST",
    });
  }

  /**
   * Admin Close Job: POST /api/admin/jobs/:id/close
   */
  async closeAdminJob(id: string): Promise<ApiResponse<Job>> {
    return this.request<Job>(`/admin/jobs/${id}/close`, {
      method: "POST",
    });
  }

  /**
   * Admin Archive Job: POST /api/admin/jobs/:id/archive
   */
  async archiveAdminJob(id: string): Promise<ApiResponse<Job>> {
    return this.request<Job>(`/admin/jobs/${id}/archive`, {
      method: "POST",
    });
  }

  /**
   * Admin Delete Job: DELETE /api/admin/jobs/:id
   */
  async deleteAdminJob(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/jobs/${id}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // Protected Admin Categories & Skills
  // ==========================================

  async getAdminCategories(): Promise<ApiResponse<JobCategory[]>> {
    return this.request<JobCategory[]>("/admin/job-categories", {
      method: "GET",
    });
  }

  async createAdminCategory(data: {
    name: string;
    slug?: string;
    description?: string | null;
    is_active?: boolean;
    display_order?: number;
  }): Promise<ApiResponse<JobCategory>> {
    return this.request<JobCategory>("/admin/job-categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAdminCategory(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string | null;
      is_active: boolean;
      display_order: number;
    }>
  ): Promise<ApiResponse<JobCategory>> {
    return this.request<JobCategory>(`/admin/job-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAdminCategory(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/job-categories/${id}`, {
      method: "DELETE",
    });
  }

  async getAdminSkills(): Promise<ApiResponse<Skill[]>> {
    return this.request<Skill[]>("/admin/skills", {
      method: "GET",
    });
  }

  async createAdminSkill(data: {
    name: string;
    slug?: string;
    is_active?: boolean;
  }): Promise<ApiResponse<Skill>> {
    return this.request<Skill>("/admin/skills", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAdminSkill(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      is_active: boolean;
    }>
  ): Promise<ApiResponse<Skill>> {
    return this.request<Skill>(`/admin/skills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAdminSkill(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/skills/${id}`, {
      method: "DELETE",
    });
  }

  // Applications
  async submitApplication(
    jobSlug: string,
    formData: FormData,
    explicitToken?: string
  ): Promise<ApiResponse<{ application: PublicApplicationSubmissionResponse }>> {
    const url = `${this.baseUrl}/jobs/${encodeURIComponent(jobSlug)}/applications`;
    const headers: Record<string, string> = {};

    let token = explicitToken || this.staticToken;
    if (!token && this.tokenGetter) {
      try {
        token = await this.tokenGetter();
      } catch {
        // Token retrieval failure
      }
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await response.json();
    return data;
  }

  async getAdminApplications(params?: {
    job_id?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ApplicationListItem[]>> {
    const query = new URLSearchParams();
    if (params?.job_id) query.append("job_id", params.job_id);
    if (params?.status && params.status !== "ALL") query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    return this.request<ApplicationListItem[]>(
      `/admin/applications${query.toString() ? `?${query.toString()}` : ""}`
    );
  }

  async getAdminApplicationById(id: string): Promise<ApiResponse<ApplicationDetail>> {
    return this.request<ApplicationDetail>(`/admin/applications/${id}`);
  }

  async updateAdminApplicationStatus(
    id: string,
    status: ApplicationStatus
  ): Promise<ApiResponse<ApplicationDetail>> {
    return this.request<ApplicationDetail>(`/admin/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async deleteAdminApplication(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/applications/${id}`, {
      method: "DELETE",
    });
  }

  async getDocumentDownloadUrl(
    applicationId: string,
    documentId: string
  ): Promise<ApiResponse<{ downloadUrl: string; fileName: string; expiresIn: number }>> {
    return this.request<{ downloadUrl: string; fileName: string; expiresIn: number }>(
      `/admin/applications/${applicationId}/documents/${documentId}`
    );
  }

  // ==========================================
  // Interviews & Feedback Endpoints
  // ==========================================

  async scheduleApplicationInterview(
    applicationId: string,
    payload: ScheduleInterviewPayload
  ): Promise<ApiResponse<InterviewItem>> {
    return this.request<InterviewItem>(`/admin/applications/${applicationId}/interviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getApplicationInterviews(
    applicationId: string
  ): Promise<ApiResponse<InterviewItem[]>> {
    return this.request<InterviewItem[]>(`/admin/applications/${applicationId}/interviews`);
  }

  async getAdminInterviews(params?: {
    application_id?: string;
    interviewer_id?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<InterviewItem[]> & { meta?: { total: number; page: number; limit: number; totalPages: number } }> {
    const query = new URLSearchParams();
    if (params?.application_id) query.append("application_id", params.application_id);
    if (params?.interviewer_id) query.append("interviewer_id", params.interviewer_id);
    if (params?.status && params.status !== "ALL") query.append("status", params.status);
    if (params?.from_date) query.append("from_date", params.from_date);
    if (params?.to_date) query.append("to_date", params.to_date);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    return this.request<InterviewItem[]>(
      `/admin/interviews${query.toString() ? `?${query.toString()}` : ""}`
    ) as any;
  }

  async getInterviewById(id: string): Promise<ApiResponse<InterviewItem>> {
    return this.request<InterviewItem>(`/admin/interviews/${id}`);
  }

  async updateInterview(
    id: string,
    payload: UpdateInterviewPayload
  ): Promise<ApiResponse<InterviewItem>> {
    return this.request<InterviewItem>(`/admin/interviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async deleteInterview(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/interviews/${id}`, {
      method: "DELETE",
    });
  }

  async getActiveInterviewers(): Promise<ApiResponse<ActiveInterviewer[]>> {
    return this.request<ActiveInterviewer[]>("/admin/interviews/interviewers");
  }

  async submitInterviewFeedback(
    interviewId: string,
    payload: SubmitFeedbackPayload
  ): Promise<ApiResponse<InterviewFeedback>> {
    return this.request<InterviewFeedback>(`/admin/interviews/${interviewId}/feedback`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getInterviewFeedback(
    interviewId: string
  ): Promise<ApiResponse<InterviewFeedback[]>> {
    return this.request<InterviewFeedback[]>(`/admin/interviews/${interviewId}/feedback`);
  }

  async updateInterviewFeedback(
    interviewId: string,
    feedbackId: string,
    payload: UpdateFeedbackPayload
  ): Promise<ApiResponse<InterviewFeedback>> {
    return this.request<InterviewFeedback>(
      `/admin/interviews/${interviewId}/feedback/${feedbackId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  }

  async deleteInterviewFeedback(
    interviewId: string,
    feedbackId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      `/admin/interviews/${interviewId}/feedback/${feedbackId}`,
      {
        method: "DELETE",
      }
    );
  }

  // --- Phase 6: Application Internal Notes ---

  async getApplicationNotes(
    applicationId: string
  ): Promise<ApiResponse<ApplicationNoteItem[]>> {
    return this.request<ApplicationNoteItem[]>(
      `/admin/applications/${applicationId}/notes`
    );
  }

  async createApplicationNote(
    applicationId: string,
    note: string
  ): Promise<ApiResponse<ApplicationNoteItem>> {
    return this.request<ApplicationNoteItem>(
      `/admin/applications/${applicationId}/notes`,
      {
        method: "POST",
        body: JSON.stringify({ note }),
      }
    );
  }

  async updateApplicationNote(
    applicationId: string,
    noteId: string,
    note: string
  ): Promise<ApiResponse<ApplicationNoteItem>> {
    return this.request<ApplicationNoteItem>(
      `/admin/applications/${applicationId}/notes/${noteId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ note }),
      }
    );
  }

  async deleteApplicationNote(
    applicationId: string,
    noteId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      `/admin/applications/${applicationId}/notes/${noteId}`,
      {
        method: "DELETE",
      }
    );
  }

  // --- Phase 7 & 8: Blog & SEO ---

  async getPublicBlogPosts(params?: {
    category?: string;
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<BlogPost[]> & { pagination: any }> {
    const query = new URLSearchParams();
    if (params?.category) query.append("category", params.category);
    if (params?.tag) query.append("tag", params.tag);
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    const qs = query.toString();
    return (await this.request<any>(`/blog/posts${qs ? `?${qs}` : ""}`)) as ApiResponse<BlogPost[]> & { pagination: any };
  }

  async getPublicBlogPostBySlug(slug: string): Promise<ApiResponse<BlogPost>> {
    return this.request<BlogPost>(`/blog/posts/${slug}`);
  }

  async getAdminBlogPosts(params?: {
    status?: string;
    category_id?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<BlogPost[]> & { pagination: any }> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.category_id) query.append("category_id", params.category_id);
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    const qs = query.toString();
    return (await this.request<any>(`/admin/blog/posts${qs ? `?${qs}` : ""}`)) as ApiResponse<BlogPost[]> & { pagination: any };
  }

  async getAdminBlogPostById(id: string): Promise<ApiResponse<BlogPost>> {
    return this.request<BlogPost>(`/admin/blog/posts/${id}`);
  }

  async createAdminBlogPost(payload: any): Promise<ApiResponse<BlogPost>> {
    return this.request<BlogPost>("/admin/blog/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateAdminBlogPost(id: string, payload: any): Promise<ApiResponse<BlogPost>> {
    return this.request<BlogPost>(`/admin/blog/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async deleteAdminBlogPost(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/blog/posts/${id}`, {
      method: "DELETE",
    });
  }

  async publishAdminBlogPost(id: string): Promise<ApiResponse<BlogPost>> {
    return this.request<BlogPost>(`/admin/blog/posts/${id}/publish`, {
      method: "POST",
    });
  }

  async archiveAdminBlogPost(id: string): Promise<ApiResponse<BlogPost>> {
    return this.request<BlogPost>(`/admin/blog/posts/${id}/archive`, {
      method: "POST",
    });
  }

  // SEO Endpoints (Phase 8)
  async getBlogPostSeo(blogPostId: string): Promise<ApiResponse<SeoMetadata | null>> {
    return this.request<SeoMetadata | null>(`/admin/blog/${blogPostId}/seo`);
  }

  async upsertBlogPostSeo(
    blogPostId: string,
    payload: {
      meta_title: string;
      meta_description: string;
      og_title?: string | null;
      og_description?: string | null;
      og_image_url?: string | null;
      canonical_url?: string | null;
    }
  ): Promise<ApiResponse<SeoMetadata>> {
    return this.request<SeoMetadata>(`/admin/blog/${blogPostId}/seo`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteBlogPostSeo(blogPostId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/blog/${blogPostId}/seo`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // User Management Endpoints (Phase 9.5B)
  // ==========================================

  async getAdminUsers(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<AdminUserItem[]> & { pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.status && params.status !== "ALL") query.append("status", params.status);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    const qs = query.toString();
    return (await this.request<any>(`/admin/users${qs ? `?${qs}` : ""}`)) as any;
  }

  async getAdminUserById(id: string): Promise<ApiResponse<AdminUserDetail>> {
    return this.request<AdminUserDetail>(`/admin/users/${id}`);
  }

  async updateAdminUserProfile(
    id: string,
    data: { full_name?: string | null; phone?: string | null; profile_photo_url?: string | null }
  ): Promise<ApiResponse<AdminUserItem>> {
    return this.request<AdminUserItem>(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async updateAdminUserStatus(
    id: string,
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  ): Promise<ApiResponse<AdminUserItem>> {
    return this.request<AdminUserItem>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async updateAdminUserRoles(
    id: string,
    roles: string[]
  ): Promise<ApiResponse<AdminUserItem>> {
    return this.request<AdminUserItem>(`/admin/users/${id}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roles }),
    });
  }

  async deleteAdminUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/users/${id}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // Role & Permission Management (Phase 9.5B)
  // ==========================================

  async getAdminRoles(): Promise<ApiResponse<AdminRoleItem[]>> {
    return this.request<AdminRoleItem[]>("/admin/roles");
  }

  async getAdminPermissions(): Promise<
    ApiResponse<{ all: AdminPermissionItem[]; grouped: Record<string, AdminPermissionItem[]> }>
  > {
    return this.request<{ all: AdminPermissionItem[]; grouped: Record<string, AdminPermissionItem[]> }>(
      "/admin/permissions"
    );
  }

  async updateAdminRolePermissions(
    roleId: string,
    permissions: string[]
  ): Promise<ApiResponse<AdminRoleItem>> {
    return this.request<AdminRoleItem>(`/admin/roles/${roleId}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    });
  }

  // ==========================================
  // Audit Logs (Phase 9 / 9.5B)
  // ==========================================

  async getAdminAuditLogs(params?: {
    module?: string;
    action?: string;
    entity_type?: string;
    entity_id?: string;
    user_id?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<AdminAuditLogItem[]> & { pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const query = new URLSearchParams();
    if (params?.module && params.module !== "ALL") query.append("module", params.module);
    if (params?.action && params.action !== "ALL") query.append("action", params.action);
    if (params?.entity_type) query.append("entity_type", params.entity_type);
    if (params?.entity_id) query.append("entity_id", params.entity_id);
    if (params?.user_id) query.append("user_id", params.user_id);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    const qs = query.toString();
    return (await this.request<any>(`/admin/audit-logs${qs ? `?${qs}` : ""}`)) as any;
  }

  async getAdminAuditLogById(id: string): Promise<ApiResponse<AdminAuditLogItem>> {
    return this.request<AdminAuditLogItem>(`/admin/audit-logs/${id}`);
  }
}

export interface AdminUserItem {
  id: string;
  firebase_uid: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  profile_photo_url: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  roles: string[];
}

export interface AdminUserDetail extends AdminUserItem {
  permissions: string[];
}

export interface AdminRoleItem {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
  permissions: string[];
}

export interface AdminPermissionItem {
  id: string;
  name: string;
  description: string | null;
  module: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLogItem {
  id: string;
  user_id: string | null;
  action: string;
  module: string;
  entity_type: string;
  entity_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_email?: string | null;
  user_name?: string | null;
}

export type ApplicationStatus =
  | "NEW"
  | "SCREENING"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "SELECTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface ApplicationDocument {
  id: string;
  application_id: string;
  document_type: "RESUME" | "OTHER";
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface ApplicationListItem {
  id: string;
  application_number: string;
  job_id: string;
  job_title?: string;
  job_slug?: string;
  full_name: string;
  email: string;
  phone: string;
  current_location: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface ApplicationDetail extends ApplicationListItem {
  cover_letter: string | null;
  job?: Partial<Job> | null;
  documents: ApplicationDocument[];
}

export interface PublicApplicationSubmissionResponse {
  application_number: string;
  job_title: string;
  full_name: string;
  email: string;
  status: ApplicationStatus;
  submitted_at: string;
}

export type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
export type InterviewRecommendation = "HIRE" | "NO_HIRE" | "FURTHER_INTERVIEW";

export interface InterviewFeedback {
  id: string;
  interview_id: string;
  interviewer_id: string;
  rating: number;
  strengths: string | null;
  weaknesses: string | null;
  feedback: string | null;
  recommendation: InterviewRecommendation;
  created_at: string;
  updated_at: string;
  interviewer?: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

export interface InterviewItem {
  id: string;
  application_id: string;
  interview_type: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link: string | null;
  location: string | null;
  interviewer_id: string;
  status: InterviewStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  interviewer?: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
  application?: {
    id: string;
    application_number: string;
    full_name: string;
    email: string;
    job_id: string;
  } | null;
  feedback?: InterviewFeedback[];
}

export interface ScheduleInterviewPayload {
  interview_type: string;
  scheduled_at: string;
  duration_minutes: number;
  interviewer_id: string;
  meeting_link?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface UpdateInterviewPayload {
  interview_type?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  interviewer_id?: string;
  meeting_link?: string | null;
  location?: string | null;
  status?: InterviewStatus;
  notes?: string | null;
}

export interface SubmitFeedbackPayload {
  rating: number;
  strengths?: string | null;
  weaknesses?: string | null;
  feedback?: string | null;
  recommendation: InterviewRecommendation;
}

export interface UpdateFeedbackPayload {
  rating?: number;
  strengths?: string | null;
  weaknesses?: string | null;
  feedback?: string | null;
  recommendation?: InterviewRecommendation;
}

export interface ActiveInterviewer {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
}

export interface ApplicationNoteAuthor {
  id: string;
  full_name: string | null;
  email: string;
}

export interface ApplicationNoteItem {
  id: string;
  application_id: string;
  user_id: string;
  note: string;
  created_at: string;
  updated_at: string;
  author: ApplicationNoteAuthor;
}

export interface SeoMetadata {
  id?: string;
  blog_post_id?: string;
  blogPostId?: string;
  meta_title: string;
  metaTitle?: string;
  meta_description: string;
  metaDescription?: string;
  og_title?: string | null;
  ogTitle?: string | null;
  og_description?: string | null;
  ogDescription?: string | null;
  og_image_url?: string | null;
  ogImageUrl?: string | null;
  canonical_url?: string | null;
  canonicalUrl?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_key: string | null;
  featured_image_url: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: { id: string; name: string; slug: string } | null;
  tags: Array<{ id: string; name: string; slug: string }>;
  seo?: SeoMetadata | null;
  author: {
    id: string;
    full_name: string | null;
    profile_photo_url: string | null;
  };
}

export const api = new ApiService();
export default api;
