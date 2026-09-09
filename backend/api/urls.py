from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BatchViewSet, StudentViewSet, login_view,
    LearnHubModuleViewSet, LearnHubStudentProgressViewSet,
    LiveQuestionViewSet, learnhub_file_upload_view,
    AssignmentViewSet, AssignmentSubmissionViewSet,
    CertificateTemplateViewSet, AdminUserViewSet, AppSettingsViewSet,
    ScheduledMeetingViewSet,
    ClientUserViewSet, InterviewRequestViewSet,
    InternEvaluationRoundViewSet, BatchEvaluationRoundViewSet,
    ProjectAssignmentViewSet, ProjectSubmissionViewSet,
    ShiftPatternViewSet, InternRosterAssignmentViewSet,
    AttendanceRecordViewSet, PunchLogEntryViewSet,
    LeaveRequestViewSet, HolidayEventViewSet,
    DailyActivityLogViewSet, AppNotificationViewSet, InternResourceViewSet
)

router = DefaultRouter()
router.register(r'batches', BatchViewSet)
router.register(r'students', StudentViewSet)
router.register(r'learnhub-modules', LearnHubModuleViewSet)
router.register(r'learnhub-progress', LearnHubStudentProgressViewSet)
router.register(r'live-questions', LiveQuestionViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'assignment-submissions', AssignmentSubmissionViewSet)
router.register(r'certificate-templates', CertificateTemplateViewSet)
router.register(r'admin-users', AdminUserViewSet)
router.register(r'settings', AppSettingsViewSet)
router.register(r'scheduled-meetings', ScheduledMeetingViewSet)
router.register(r'clients', ClientUserViewSet)
router.register(r'interview-requests', InterviewRequestViewSet)

# Newly connected modules:
router.register(r'evaluations', InternEvaluationRoundViewSet)
router.register(r'evaluation-rounds', BatchEvaluationRoundViewSet)
router.register(r'project-assignments', ProjectAssignmentViewSet)
router.register(r'project-submissions', ProjectSubmissionViewSet)
router.register(r'shift-patterns', ShiftPatternViewSet)
router.register(r'roster-assignments', InternRosterAssignmentViewSet)
router.register(r'attendance-records', AttendanceRecordViewSet)
router.register(r'punch-logs', PunchLogEntryViewSet)
router.register(r'leave-requests', LeaveRequestViewSet)
router.register(r'holidays', HolidayEventViewSet)
router.register(r'daily-activity-logs', DailyActivityLogViewSet)
router.register(r'notifications', AppNotificationViewSet)
router.register(r'intern-resources', InternResourceViewSet)

urlpatterns = [
    path('login/', login_view, name='login'),
    path('learnhub/upload/', learnhub_file_upload_view, name='learnhub_file_upload'),
    path('', include(router.urls)),
]
