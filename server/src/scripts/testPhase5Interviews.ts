import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { createApp } from "../app.js";
import { userRepository } from "../repositories/user.repository.js";
import { jobRepository } from "../repositories/job.repository.js";
import { applicationRepository } from "../repositories/application.repository.js";
import { interviewRepository } from "../repositories/interview.repository.js";
import { seedDatabase } from "../db/seed.js";
import { runMigrations } from "../db/migrate.js";
import { getDb } from "../db/index.js";
import { sqliteSchema, pgSchema } from "../db/schema.js";
import config from "../config/index.js";
import type { Server } from "http";

async function runPhase5Tests() {
  console.log("==================================================");
  console.log("Starting Phase 5 Interviews & Feedback Tests");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // 1. Ensure migrations and seeds
  await runMigrations();
  await seedDatabase();

  const tables = config.database.provider === "postgresql" ? pgSchema : sqliteSchema;
  const db = getDb();

  // Clean existing interviews & feedback
  await (db as any).delete(tables.interviewFeedback);
  await (db as any).delete(tables.interviews);

  // Start test server on port 3098
  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(3098, "127.0.0.1", () => resolve(s));
  });

  const baseUrl = "http://127.0.0.1:3098";

  try {
    // 2. Setup test users and assign roles
    console.log("\n[Test Setup: Users and Roles]");
    const superAdminToken = "dev-test:p5-superadmin:p5admin@saras.com:Super Admin Sam";
    const recruiterToken = "dev-test:p5-recruiter:p5recruiter@saras.com:Recruiter Rachel";
    const interviewer1Token = "dev-test:p5-interviewer1:p5int1@saras.com:Interviewer Ian";
    const interviewer2Token = "dev-test:p5-interviewer2:p5int2@saras.com:Interviewer Ivy";
    const writerToken = "dev-test:p5-writer:p5writer@saras.com:Writer Wendy";
    const unprivToken = "dev-test:p5-unpriv:p5unpriv@saras.com:Unpriv Uma";

    for (const token of [
      superAdminToken,
      recruiterToken,
      interviewer1Token,
      interviewer2Token,
      writerToken,
      unprivToken,
    ]) {
      await fetch(`${baseUrl}/api/auth/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    const adminUser = await userRepository.findByEmail("p5admin@saras.com");
    const recruiterUser = await userRepository.findByEmail("p5recruiter@saras.com");
    const int1User = await userRepository.findByEmail("p5int1@saras.com");
    const int2User = await userRepository.findByEmail("p5int2@saras.com");
    const writerUser = await userRepository.findByEmail("p5writer@saras.com");
    const unprivUser = await userRepository.findByEmail("p5unpriv@saras.com");

    // Create custom INTERVIEWER role if not existing
    const existingInterviewerRole = await (db as any)
      .select()
      .from(tables.roles)
      .where(eq(tables.roles.name, "INTERVIEWER"))
      .limit(1);

    let interviewerRoleId = existingInterviewerRole[0]?.id;
    if (!interviewerRoleId) {
      interviewerRoleId = randomUUID();
      await (db as any).insert(tables.roles).values({
        id: interviewerRoleId,
        name: "INTERVIEWER",
        description: "Technical Interviewer Panel",
        is_system_role: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const readPerm = (
        await (db as any)
          .select()
          .from(tables.permissions)
          .where(eq(tables.permissions.name, "interviews.read"))
      )[0];
      const updatePerm = (
        await (db as any)
          .select()
          .from(tables.permissions)
          .where(eq(tables.permissions.name, "interviews.update"))
      )[0];

      await (db as any).insert(tables.rolePermissions).values([
        {
          id: randomUUID(),
          role_id: interviewerRoleId,
          permission_id: readPerm.id,
          created_at: new Date(),
        },
        {
          id: randomUUID(),
          role_id: interviewerRoleId,
          permission_id: updatePerm.id,
          created_at: new Date(),
        },
      ]);
    }

    // Assign roles
    await userRepository.assignRoleByName(adminUser!.id, "SUPER_ADMIN");
    await userRepository.assignRoleByName(recruiterUser!.id, "RECRUITER");
    await userRepository.assignRoleByName(int1User!.id, "INTERVIEWER");
    await userRepository.assignRoleByName(int2User!.id, "INTERVIEWER");
    await userRepository.assignRoleByName(writerUser!.id, "CONTENT_WRITER");

    // 3. Create a test job and test applications
    const testJob = await jobRepository.create({
      title: "Senior Cloud Architect",
      slug: `senior-cloud-architect-${Date.now()}`,
      description: "Leading cloud systems",
      requirements: "Kubernetes, AWS, Terraform",
      status: "PUBLISHED",
      workplace_type: "HYBRID",
      employment_type: "FULL_TIME",
      created_by: adminUser!.id,
    });

    const app1 = await applicationRepository.create({
      job_id: testJob.id,
      full_name: "Alice Candidate",
      email: "alice.candidate@example.com",
      phone: "+1-555-100-2001",
      current_location: "San Francisco, CA",
      status: "NEW",
      application_number: `SD-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    const app2Shortlisted = await applicationRepository.create({
      job_id: testJob.id,
      full_name: "Bob Shortlisted",
      email: "bob.shortlisted@example.com",
      phone: "+1-555-100-2002",
      current_location: "Seattle, WA",
      status: "SHORTLISTED",
      application_number: `SD-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    assert(Boolean(app1 && app2Shortlisted), "Test applications created successfully");

    // ==========================================
    // Test Suite 1: Interview Scheduling & Auto-Transition
    // ==========================================
    console.log("\n[Test Suite 1: Interview Scheduling & Auto-Transition]");

    const scheduledDate = new Date(Date.now() + 86400000 * 2).toISOString(); // 2 days in future
    const schedulePayload = {
      interview_type: "Technical Deep Dive",
      scheduled_at: scheduledDate,
      duration_minutes: 60,
      interviewer_id: int1User!.id,
      meeting_link: "https://meet.google.com/abc-defg-hij",
      location: "Room 401",
      notes: "Focus on distributed consensus and Raft algorithm",
    };

    // Recruiter schedules interview for app1
    const schedRes1 = await fetch(`${baseUrl}/api/admin/applications/${app1.id}/interviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(schedulePayload),
    });

    assert(schedRes1.status === 201, "Recruiter schedules interview with 201 Created");
    const schedData1 = await schedRes1.json();
    assert(schedData1.success === true, "Schedule response success is true");
    assert(schedData1.data?.interview_type === "Technical Deep Dive", "Interview type correctly recorded");
    assert(schedData1.data?.status === "SCHEDULED", "Initial interview status is SCHEDULED");
    assert(schedData1.data?.interviewer_id === int1User!.id, "Assigned interviewer is correctly stored");
    assert(schedData1.data?.meeting_link === schedulePayload.meeting_link, "Meeting link correctly stored");

    const interview1Id = schedData1.data.id;

    // Automatic application status transition:
    // When scheduling for a SHORTLISTED application, it must auto-transition to INTERVIEW!
    const schedRes2 = await fetch(`${baseUrl}/api/admin/applications/${app2Shortlisted.id}/interviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...schedulePayload,
        interview_type: "Initial Screening",
      }),
    });

    assert(schedRes2.status === 201, "Schedules interview for SHORTLISTED application (201)");
    const updatedApp2 = await applicationRepository.findById(app2Shortlisted.id);
    assert(
      updatedApp2?.status === "INTERVIEW",
      "SHORTLISTED application automatically transitions to 'INTERVIEW' status on scheduling"
    );

    // Validation checks on schedule
    const badDurationRes = await fetch(`${baseUrl}/api/admin/applications/${app1.id}/interviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...schedulePayload,
        duration_minutes: -10,
      }),
    });
    assert(badDurationRes.status === 400, "Negative duration rejected with 400");

    const missingTypeRes = await fetch(`${baseUrl}/api/admin/applications/${app1.id}/interviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...schedulePayload,
        interview_type: "",
      }),
    });
    assert(missingTypeRes.status === 400, "Empty interview_type rejected with 400");

    const nonExistentAppRes = await fetch(
      `${baseUrl}/api/admin/applications/00000000-0000-0000-0000-000000000000/interviews`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${recruiterToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(schedulePayload),
      }
    );
    assert(nonExistentAppRes.status === 404, "Scheduling on non-existent application returns 404");

    // ==========================================
    // Test Suite 2: Multiple Interviews Per Application
    // ==========================================
    console.log("\n[Test Suite 2: Multiple Interviews Per Application]");

    const round2Date = new Date(Date.now() + 86400000 * 3).toISOString();
    const round3Date = new Date(Date.now() + 86400000 * 4).toISOString();

    // Round 2 with interviewer 2
    const schedRound2Res = await fetch(`${baseUrl}/api/admin/applications/${app1.id}/interviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        interview_type: "System Design & Architecture",
        scheduled_at: round2Date,
        duration_minutes: 45,
        interviewer_id: int2User!.id,
        meeting_link: "https://meet.google.com/round-2-design",
      }),
    });
    assert(schedRound2Res.status === 201, "Schedules Round 2 with second interviewer (201)");
    const round2Data = await schedRound2Res.json();
    const interview2Id = round2Data.data.id;

    // Round 3 with admin
    const schedRound3Res = await fetch(`${baseUrl}/api/admin/applications/${app1.id}/interviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        interview_type: "Executive & Culture Fit",
        scheduled_at: round3Date,
        duration_minutes: 30,
        interviewer_id: adminUser!.id,
      }),
    });
    assert(schedRound3Res.status === 201, "Schedules Round 3 with executive interviewer (201)");
    const round3Data = await schedRound3Res.json();
    const interview3Id = round3Data.data.id;

    // Retrieve all interviews for app1
    const app1InterviewsRes = await fetch(`${baseUrl}/api/admin/applications/${app1.id}/interviews`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(app1InterviewsRes.status === 200, "GET /api/admin/applications/:id/interviews returns 200");
    const app1Interviews = await app1InterviewsRes.json();
    assert(app1Interviews.data?.length === 3, "Application has exactly 3 multiple scheduled interviews");
    assert(
      app1Interviews.data[0].interview_type === "Technical Deep Dive" &&
        app1Interviews.data[1].interview_type === "System Design & Architecture" &&
        app1Interviews.data[2].interview_type === "Executive & Culture Fit",
      "Interviews returned in chronological order"
    );

    // ==========================================
    // Test Suite 3: Active Interviewers Endpoint
    // ==========================================
    console.log("\n[Test Suite 3: Active Interviewers Endpoint]");

    const interviewersRes = await fetch(`${baseUrl}/api/admin/interviews/interviewers`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(interviewersRes.status === 200, "GET /api/admin/interviews/interviewers returns 200");
    const interviewersData = await interviewersRes.json();
    assert(Array.isArray(interviewersData.data), "Interviewers data is an array");
    const foundInt1 = interviewersData.data.some((i: any) => i.id === int1User!.id);
    const foundInt2 = interviewersData.data.some((i: any) => i.id === int2User!.id);
    assert(foundInt1 && foundInt2, "Active users list includes all available interviewers");

    // ==========================================
    // Test Suite 4: Interview Lifecycle & Status Transitions
    // ==========================================
    console.log("\n[Test Suite 4: Interview Lifecycle & Status Transitions]");

    // Update interview details
    const updateRes = await fetch(`${baseUrl}/api/admin/interviews/${interview1Id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notes: "Updated prep notes: candidate has strong open source background.",
        duration_minutes: 75,
      }),
    });
    assert(updateRes.status === 200, "Recruiter updates interview details (200)");
    const updateData = await updateRes.json();
    assert(updateData.data.duration_minutes === 75, "Duration updated to 75 minutes");
    assert(
      updateData.data.notes === "Updated prep notes: candidate has strong open source background.",
      "Notes updated successfully"
    );

    // Transition SCHEDULED -> COMPLETED
    const completeRes = await fetch(`${baseUrl}/api/admin/interviews/${interview1Id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    assert(completeRes.status === 200, "Transition SCHEDULED -> COMPLETED returns 200");
    const completeData = await completeRes.json();
    assert(completeData.data.status === "COMPLETED", "Status is COMPLETED");

    // Transition Round 2: SCHEDULED -> RESCHEDULED
    const reschedRes = await fetch(`${baseUrl}/api/admin/interviews/${interview2Id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "RESCHEDULED",
        scheduled_at: new Date(Date.now() + 86400000 * 5).toISOString(),
      }),
    });
    assert(reschedRes.status === 200, "Transition SCHEDULED -> RESCHEDULED returns 200");
    const reschedData = await reschedRes.json();
    assert(reschedData.data.status === "RESCHEDULED", "Status is RESCHEDULED");

    // Transition Round 3: SCHEDULED -> CANCELLED
    const cancelRes = await fetch(`${baseUrl}/api/admin/interviews/${interview3Id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    assert(cancelRes.status === 200, "Transition SCHEDULED -> CANCELLED returns 200");
    const cancelData = await cancelRes.json();
    assert(cancelData.data.status === "CANCELLED", "Status is CANCELLED");

    // Invalid transition: CANCELLED -> COMPLETED should be rejected
    const invalidTransRes = await fetch(`${baseUrl}/api/admin/interviews/${interview3Id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    assert(invalidTransRes.status === 400, "Cannot complete a CANCELLED interview (returns 400)");

    // Invalid status string
    const bogusStatusRes = await fetch(`${baseUrl}/api/admin/interviews/${interview1Id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "RANDOM_STATUS" }),
    });
    assert(bogusStatusRes.status === 400, "Invalid status enum rejected with 400");

    // ==========================================
    // Test Suite 5: Interview Feedback, Ratings & Recommendations
    // ==========================================
    console.log("\n[Test Suite 5: Interview Feedback, Ratings & Recommendations]");

    // Assigned interviewer (int1User) submits feedback for interview1
    const feedbackPayload1 = {
      rating: 5,
      recommendation: "HIRE",
      strengths: "Exceptional system design and problem solving skills. Clean code.",
      weaknesses: "Minimal experience with Azure, but deeply proficient in AWS.",
      feedback: "Strongly recommended for senior level. Excellent team communicator.",
    };

    const submitFbRes1 = await fetch(`${baseUrl}/api/admin/interviews/${interview1Id}/feedback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${interviewer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedbackPayload1),
    });

    assert(submitFbRes1.status === 201, "Assigned interviewer submits feedback with 201 Created");
    const fbData1 = await submitFbRes1.json();
    assert(fbData1?.success === true, "Feedback submission success is true");
    assert(fbData1.data?.rating === 5, "Rating recorded as 5");
    assert(fbData1.data?.recommendation === "HIRE", "Recommendation recorded as HIRE");
    assert(fbData1.data?.interviewer_id === int1User!.id, "Interviewer id accurately set to authenticated user");
    const feedback1Id = fbData1.data.id;

    // Duplicate feedback constraint: UNIQUE(interview_id, interviewer_id)
    const dupFbRes = await fetch(`${baseUrl}/api/admin/interviews/${interview1Id}/feedback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${interviewer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedbackPayload1),
    });
    assert(dupFbRes.status === 409, "Duplicate feedback by same interviewer rejected with 409 Conflict");
    const dupData = await dupFbRes.json();
    assert(
      dupData.message?.toLowerCase().includes("already"),
      "Duplicate error mentions feedback already submitted"
    );

    // Unassigned interviewer attempts to submit feedback for interview1
    // (int2User is assigned to interview2, not interview1)
    const unassignedFbRes = await fetch(`${baseUrl}/api/admin/interviews/${interview1Id}/feedback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${interviewer2Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: 3,
        recommendation: "FURTHER_INTERVIEW",
      }),
    });
    assert(unassignedFbRes.status === 403, "Unassigned interviewer cannot submit feedback for this interview (403)");

    // Rating validation: 0 rejected
    const badRatingZero = await fetch(`${baseUrl}/api/admin/interviews/${interview2Id}/feedback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${interviewer2Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: 0,
        recommendation: "HIRE",
      }),
    });
    assert(badRatingZero.status === 400, "Rating 0 rejected with 400");

    // Rating validation: 6 rejected
    const badRatingSix = await fetch(`${baseUrl}/api/admin/interviews/${interview2Id}/feedback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${interviewer2Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: 6,
        recommendation: "HIRE",
      }),
    });
    assert(badRatingSix.status === 400, "Rating 6 rejected with 400");

    // Rating validation: non-integer 3.5 rejected
    const badRatingFloat = await fetch(`${baseUrl}/api/admin/interviews/${interview2Id}/feedback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${interviewer2Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: 3.5,
        recommendation: "HIRE",
      }),
    });
    assert(badRatingFloat.status === 400, "Decimal rating (3.5) rejected with 400");

    // Recommendation validation: invalid string rejected
    const badRec = await fetch(`${baseUrl}/api/admin/interviews/${interview2Id}/feedback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${interviewer2Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: 4,
        recommendation: "MAYBE",
      }),
    });
    assert(badRec.status === 400, "Invalid recommendation enum rejected with 400");

    // Assigned interviewer (int2User) submits valid feedback for interview2
    const submitFbRes2 = await fetch(`${baseUrl}/api/admin/interviews/${interview2Id}/feedback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${interviewer2Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: 3,
        recommendation: "FURTHER_INTERVIEW",
        strengths: "Good grasp of fundamentals",
        weaknesses: "Hesitated on data partitioning strategies",
        feedback: "Recommend one more session with database specialist",
      }),
    });
    assert(submitFbRes2.status === 201, "Second interviewer submits feedback for Round 2 (201)");

    // Admin submits feedback for interview1 (as a second interviewer / panel review)
    const adminFbRes = await fetch(`${baseUrl}/api/admin/interviews/${interview1Id}/feedback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: 4,
        recommendation: "HIRE",
        feedback: "Reviewed recording, agree with Ian's assessment.",
      }),
    });
    assert(adminFbRes.status === 201, "Admin / Panel reviewer submits feedback (201)");

    // Update feedback: int1User updates their own feedback
    const updateFbRes = await fetch(
      `${baseUrl}/api/admin/interviews/${interview1Id}/feedback/${feedback1Id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${interviewer1Token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: 4,
          recommendation: "FURTHER_INTERVIEW",
          feedback: "Adjusting after reviewing test submission: need 1 follow-up on concurrency.",
        }),
      }
    );
    assert(updateFbRes.status === 200, "Interviewer updates their own feedback (200)");
    const updateFbData = await updateFbRes.json();
    assert(updateFbData.data.rating === 4, "Updated rating verified as 4");
    assert(updateFbData.data.recommendation === "FURTHER_INTERVIEW", "Updated recommendation verified");

    // IDOR protection: int2User cannot update int1User's feedback
    const idorFbUpdateRes = await fetch(
      `${baseUrl}/api/admin/interviews/${interview1Id}/feedback/${feedback1Id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${interviewer2Token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: 1 }),
      }
    );
    assert(idorFbUpdateRes.status === 403, "IDOR Protection: Interviewer cannot edit another interviewer's feedback (403)");

    // GET interview feedback list
    const getFbListRes = await fetch(`${baseUrl}/api/admin/interviews/${interview1Id}/feedback`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(getFbListRes.status === 200, "GET /api/admin/interviews/:id/feedback returns 200");
    const getFbListData = await getFbListRes.json();
    assert(getFbListData.data?.length === 2, "Interview 1 has exactly 2 feedback submissions");
    assert(
      getFbListData.data.some((f: any) => f.interviewer?.email === "p5int1@saras.com"),
      "Feedback response includes reviewer user details"
    );

    // ==========================================
    // Test Suite 6: RBAC & Permissions Enforcement
    // ==========================================
    console.log("\n[Test Suite 6: RBAC & Permissions Enforcement]");

    // Unauthenticated GET
    const unauthRes = await fetch(`${baseUrl}/api/admin/interviews`);
    assert(unauthRes.status === 401, "Unauthenticated access rejected with 401");

    // Unprivileged user GET (lacks interviews.read)
    const unprivGetRes = await fetch(`${baseUrl}/api/admin/interviews`, {
      headers: { Authorization: `Bearer ${unprivToken}` },
    });
    assert(unprivGetRes.status === 403, "Unprivileged user without interviews.read rejected with 403");

    // Content writer (has jobs permissions, but NOT interviews)
    const writerGetRes = await fetch(`${baseUrl}/api/admin/interviews`, {
      headers: { Authorization: `Bearer ${writerToken}` },
    });
    assert(writerGetRes.status === 403, "Content Writer lacking interviews.read rejected with 403");

    // Content writer cannot create interview
    const writerCreateRes = await fetch(`${baseUrl}/api/admin/applications/${app1.id}/interviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${writerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(schedulePayload),
    });
    assert(writerCreateRes.status === 403, "User lacking interviews.create cannot schedule interview (403)");

    // Interviewer (lacks interviews.create) cannot schedule interview
    const intCreateRes = await fetch(`${baseUrl}/api/admin/applications/${app1.id}/interviews`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${interviewer1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(schedulePayload),
    });
    assert(intCreateRes.status === 403, "INTERVIEWER role (lacking interviews.create) cannot schedule interview (403)");

    // Interviewer (has interviews.read, interviews.update, but lacks interviews.delete)
    const interviewerDeleteRes = await fetch(`${baseUrl}/api/admin/interviews/${interview3Id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${interviewer1Token}` },
    });
    assert(
      interviewerDeleteRes.status === 403,
      "Interviewer without interviews.delete cannot delete interview (403)"
    );

    // Super Admin (has interviews.delete) deletes interview3
    const adminDeleteRes = await fetch(`${baseUrl}/api/admin/interviews/${interview3Id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    assert(adminDeleteRes.status === 200, "Super Admin deletes interview successfully (200)");

    // Verify deleted interview is gone
    const verifyDeletedRes = await fetch(`${baseUrl}/api/admin/interviews/${interview3Id}`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(verifyDeletedRes.status === 404, "Deleted interview returns 404 Not Found");

    // ==========================================
    // Test Suite 7: Filtering, Listing & Pagination
    // ==========================================
    console.log("\n[Test Suite 7: Filtering, Listing & Pagination]");

    // List all interviews
    const listAllRes = await fetch(`${baseUrl}/api/admin/interviews`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert(listAllRes.status === 200, "GET /api/admin/interviews returns 200");
    const listAllData = await listAllRes.json();
    assert(listAllData.data?.length >= 2, "Interviews list returned successfully");
    assert(listAllData.data[0].application?.full_name, "Interview list items include populated application");

    // Filter by status=COMPLETED
    const filterCompletedRes = await fetch(
      `${baseUrl}/api/admin/interviews?status=COMPLETED`,
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    assert(filterCompletedRes.status === 200, "Filter status=COMPLETED returns 200");
    const completedData = await filterCompletedRes.json();
    assert(
      completedData.data.every((i: any) => i.status === "COMPLETED"),
      "All returned items have status COMPLETED"
    );

    // Filter by status=RESCHEDULED
    const filterReschedRes = await fetch(
      `${baseUrl}/api/admin/interviews?status=RESCHEDULED`,
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    assert(filterReschedRes.status === 200, "Filter status=RESCHEDULED returns 200");
    const reschedFilteredData = await filterReschedRes.json();
    assert(
      reschedFilteredData.data.every((i: any) => i.status === "RESCHEDULED"),
      "All returned items have status RESCHEDULED"
    );

    // Filter by interviewer_id
    const filterInterviewerRes = await fetch(
      `${baseUrl}/api/admin/interviews?interviewer_id=${int1User!.id}`,
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    assert(filterInterviewerRes.status === 200, "Filter by interviewer_id returns 200");
    const interviewerFilteredData = await filterInterviewerRes.json();
    assert(
      interviewerFilteredData.data.every((i: any) => i.interviewer_id === int1User!.id),
      "All returned items match interviewer_id"
    );

    // Pagination limit & page
    const pageLimitRes = await fetch(
      `${baseUrl}/api/admin/interviews?page=1&limit=1`,
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    assert(pageLimitRes.status === 200, "Pagination request returns 200");
    const pageLimitData = await pageLimitRes.json();
    assert(pageLimitData.data.length === 1, "Limit: 1 respected");
    assert(pageLimitData.meta?.total >= 2, "Meta total count present");

    // ==========================================
    // Test Suite 8: Privacy & Public Isolation
    // ==========================================
    console.log("\n[Test Suite 8: Privacy & Public Isolation]");

    // Public jobs route does not expose interviews
    const pubJobRes = await fetch(`${baseUrl}/api/jobs/${testJob.slug}`);
    assert(pubJobRes.status === 200, "Public job detail returns 200");
    const pubJobData = await pubJobRes.json();
    assert(pubJobData.data.interviews === undefined, "Public job detail never exposes interviews");
    assert(pubJobData.data.applications === undefined, "Public job detail never exposes applications");

    // Public list of jobs does not expose interviews
    const pubJobsListRes = await fetch(`${baseUrl}/api/jobs`);
    assert(pubJobsListRes.status === 200, "Public jobs list returns 200");
    const pubJobsListData = await pubJobsListRes.json();
    const anyExposesInterviews = pubJobsListData.data.some((j: any) => j.interviews !== undefined);
    assert(!anyExposesInterviews, "Public jobs list never leaks interview metadata");

    console.log("\n==================================================");
    console.log(`Phase 5 Tests Finished: ${passed} Passed, ${failed} Failed`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runPhase5Tests().catch((err) => {
  console.error("Fatal error during Phase 5 testing:", err);
  process.exit(1);
});
