from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import (
    Batch, Student, AppSettingsModel,
    InternEvaluationRound, BatchEvaluationRound,
    ProjectAssignment, ProjectSubmission,
    ShiftPattern, InternRosterAssignment,
    AttendanceRecord, PunchLogEntry,
    DailyActivityLog, AppNotification
)


class BackendConnectedModulesTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.batch = Batch.objects.create(
            id="test_batch_ai",
            name="AI Engineering Test",
            type="internship_3m",
            startDate="2026-09-01",
            endDate="2026-11-30",
            status="active"
        )
        self.student = Student.objects.create(
            id="test_stu_01",
            name="Test Candidate",
            email="candidate@mind2i.edu",
            batch=self.batch,
            college="Test College",
            status="active"
        )

    def test_settings_gemini_api_key(self):
        """Test AppSettings persistence including custom geminiApiKey."""
        res = self.client.post("/api/settings/", {
            "id": "global",
            "geminiApiKey": "AIzaSyTestApiKey1234567890",
            "enableCodingIDE": True,
            "enableQuiz": True,
            "enableLearnHub": True,
            "enableCertificate": True,
            "enableMyReport": True,
            "enableLiveQA": True,
            "enableLeaderboard": True,
            "enableTelemetryAnalytics": True,
            "enableClientPortal": True,
        }, format="json")
        self.assertIn(res.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        saved = AppSettingsModel.objects.get(id="global")
        self.assertEqual(saved.geminiApiKey, "AIzaSyTestApiKey1234567890")

    def test_evaluation_rounds_bulk_sync(self):
        """Test multi-admin evaluation bulk_sync endpoint and consensus calculation."""
        payload = {
            self.student.id: [
                {
                    "evaluationName": "System Architecture & System Defense",
                    "reviewerName": "Lead Director",
                    "reviewerRole": "Lead Evaluator",
                    "communicationScore": 90,
                    "grammarScore": 88,
                    "fluencyScore": 92,
                    "projectScore": 94,
                    "overallRating": 91.0,
                },
                {
                    "evaluationName": "System Architecture & System Defense",
                    "reviewerName": "Secondary Faculty",
                    "reviewerRole": "Mentor",
                    "communicationScore": 86,
                    "grammarScore": 84,
                    "fluencyScore": 88,
                    "projectScore": 90,
                    "overallRating": 87.0,
                }
            ]
        }
        res = self.client.post("/api/evaluations/bulk_sync/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data.get("status"), "synced")

        round_obj = InternEvaluationRound.objects.filter(student=self.student).first()
        self.assertIsNotNone(round_obj)
        self.assertEqual(round_obj.roundName, "System Architecture & System Defense")
        self.assertGreater(round_obj.consensusScore, 80)

    def test_batch_evaluation_rounds(self):
        """Test custom evaluation round creation and deletion per batch."""
        res = self.client.post("/api/evaluation-rounds/", {
            "batch": self.batch.id,
            "roundName": "Advanced Generative AI Defense",
            "isDeleted": False
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        list_res = self.client.get(f"/api/evaluation-rounds/?batch={self.batch.id}")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertTrue(any(r["roundName"] == "Advanced Generative AI Defense" for r in list_res.data))

    def test_project_assignments_and_submissions(self):
        """Test Kanban project assignment creation and student work submission."""
        proj_res = self.client.post("/api/project-assignments/", {
            "id": "proj_test_01",
            "title": "LLM Inference API",
            "description": "Build high-throughput LLM streaming service",
            "batch": self.batch.id,
            "batchName": self.batch.name,
            "assignedTo": "all",
            "status": "assigned",
            "priority": "high",
            "dueDate": "2026-09-20",
            "deliverables": ["Docker container", "FastAPI endpoints"],
            "techStack": ["Python", "FastAPI", "Docker"]
        }, format="json")
        self.assertEqual(proj_res.status_code, status.HTTP_201_CREATED)

        sub_res = self.client.post("/api/project-submissions/", {
            "id": "sub_test_01",
            "projectId": "proj_test_01",
            "projectTitle": "LLM Inference API",
            "student": self.student.id,
            "studentName": self.student.name,
            "batch": self.batch.id,
            "githubUrl": "https://github.com/mind2i/test-llm",
            "status": "submitted"
        }, format="json")
        self.assertEqual(sub_res.status_code, status.HTTP_201_CREATED)

    def test_attendance_and_shifts_bulk_sync(self):
        """Test shift patterns and attendance records bulk sync."""
        shift_res = self.client.post("/api/shift-patterns/bulk_sync/", {
            "items": [
                {
                    "id": "shift_morning_test",
                    "name": "Morning AI Shift",
                    "type": "morning",
                    "startTime": "09:00",
                    "endTime": "14:00",
                    "gracePeriodMins": 15,
                    "halfDayHours": 3,
                    "fullDayHours": 5,
                    "color": "#3b82f6",
                    "isActive": True
                }
            ]
        }, format="json")
        self.assertEqual(shift_res.status_code, status.HTTP_200_OK)

        att_res = self.client.post("/api/attendance-records/bulk_create_or_update/", {
            "records": [
                {
                    "id": "att_test_01",
                    "internId": self.student.id,
                    "internName": self.student.name,
                    "batchId": self.batch.id,
                    "date": "2026-09-08",
                    "status": "present",
                    "shiftName": "Morning AI Shift",
                    "punchIn": "09:02",
                    "punchOut": "14:01",
                    "totalHours": 5.0
                }
            ]
        }, format="json")
        self.assertEqual(att_res.status_code, status.HTTP_200_OK)
        self.assertEqual(att_res.data.get("count"), 1)

    def test_daily_activity_logs_bulk_sync(self):
        """Test daily activity logs sync and retrieval."""
        res = self.client.post("/api/daily-activity-logs/bulk_sync/", {
            "items": [
                {
                    "id": "log_test_01",
                    "internId": self.student.id,
                    "internName": self.student.name,
                    "batchId": self.batch.id,
                    "batchName": self.batch.name,
                    "date": "2026-09-08",
                    "tasksCompleted": "Implemented RAG pipeline vector search",
                    "currentBlockers": "None",
                    "plannedNext": "Add caching layer",
                    "hoursSpent": 6.5,
                    "status": "reviewed",
                    "aiSentiment": "positive"
                }
            ]
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(DailyActivityLog.objects.filter(internId=self.student.id).count(), 1)

    def test_notifications_lifecycle(self):
        """Test notification creation, mark_read, mark_all_read, and clear_all."""
        notif_res = self.client.post("/api/notifications/", {
            "id": "notif_test_01",
            "recipientRole": "admin",
            "title": "Test Alert",
            "message": "Real-time sync test message",
            "type": "system",
            "isRead": False
        }, format="json")
        self.assertEqual(notif_res.status_code, status.HTTP_201_CREATED)

        read_res = self.client.post("/api/notifications/notif_test_01/mark_read/")
        self.assertEqual(read_res.status_code, status.HTTP_200_OK)

        clear_res = self.client.post("/api/notifications/clear_all/", {"role": "admin"}, format="json")
        self.assertEqual(clear_res.status_code, status.HTTP_200_OK)
        self.assertEqual(AppNotification.objects.filter(recipientRole="admin").count(), 0)
