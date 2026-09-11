from django.db import models
import uuid


class Batch(models.Model):
    id = models.CharField(primary_key=True, max_length=100)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50, default='internship_3m')  # 'internship_3m' | 'internship_6m' | 'internship_12m' | 'custom'
    programType = models.CharField(max_length=50, default='internship')
    durationMonths = models.IntegerField(default=3)
    durationLabel = models.CharField(max_length=100, default='3 Months')
    college = models.CharField(max_length=255, blank=True, default='')
    organization = models.CharField(max_length=255, blank=True, default='')
    startDate = models.DateField()
    endDate = models.DateField()
    status = models.CharField(max_length=50)  # 'upcoming' | 'active' | 'completed'
    description = models.TextField(blank=True, null=True)
    technologies = models.JSONField(default=list, blank=True)  # list of tech/skill tags for this cohort
    mentor = models.CharField(max_length=255, blank=True, default='')
    isLocked = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Student(models.Model):
    """Represents an Intern in the system."""
    id = models.CharField(primary_key=True, max_length=100)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    mobile = models.CharField(max_length=20)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='students')
    avatar = models.TextField(blank=True, null=True)
    college = models.CharField(max_length=255, blank=True, null=True)
    branch = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    password = models.CharField(max_length=255, blank=True, null=True)
    enrolledAt = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default="active")  # "active" | "completed" | "inactive"

    # Performance metrics
    totalPoints = models.IntegerField(default=0)
    activeStreakDays = models.IntegerField(default=0)
    fastestResponseMs = models.IntegerField(default=0)
    attendedSessions = models.IntegerField(default=0)
    totalSessions = models.IntegerField(default=0)
    notes = models.TextField(blank=True, null=True)

    # Intern-specific fields
    skills = models.JSONField(default=list, blank=True)  # list of skill tags e.g. ["Python", "React", "Django"]
    bio = models.TextField(blank=True, default='')
    githubUrl = models.CharField(max_length=500, blank=True, default='')
    linkedinUrl = models.CharField(max_length=500, blank=True, default='')
    resumeUrl = models.CharField(max_length=500, blank=True, default='')
    resumeData = models.JSONField(default=dict, blank=True)
    mentor = models.CharField(max_length=255, blank=True, default='')
    internshipStartDate = models.DateField(null=True, blank=True)
    internshipEndDate = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name


class Score(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='scores')
    quizScore = models.FloatField(default=0)
    codingScore = models.FloatField(default=0)
    liveQAScore = models.FloatField(default=0)
    assignmentScore = models.FloatField(default=0)
    overallAccuracy = models.FloatField(default=0)

    def __str__(self):
        return f"{self.student.name} Scores"


class LearnHubModule(models.Model):
    id = models.CharField(primary_key=True, max_length=100)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='learnhub_modules', null=True, blank=True)
    badge = models.CharField(max_length=100, default="INTERACTIVE AI GUIDE")
    title = models.CharField(max_length=255)
    subtitle = models.TextField(blank=True, default="")
    sourceFile = models.JSONField(default=dict, blank=True, null=True)
    sourceFiles = models.JSONField(default=list, blank=True)
    slides = models.JSONField(default=list, blank=True)
    paragraphs = models.JSONField(default=list, blank=True)
    bottomTags = models.JSONField(default=list, blank=True)
    isPublished = models.BooleanField(default=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.batch.name if self.batch else 'Global'})"


class LearnHubStudentProgress(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='learnhub_progress')
    module = models.ForeignKey(LearnHubModule, on_delete=models.CASCADE, related_name='student_progress')
    completedSlides = models.JSONField(default=list, blank=True)
    masteredTags = models.JSONField(default=list, blank=True)
    quizScores = models.JSONField(default=dict, blank=True)
    lastAccessedAt = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'module')

    def __str__(self):
        return f"{self.student.name} - {self.module.title}"


class LiveQuestion(models.Model):
    id = models.CharField(primary_key=True, max_length=100)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='live_questions')
    question = models.TextField()
    type = models.CharField(max_length=50, default='mcq')  # 'mcq' | 'poll' | 'true_false' | 'open'
    options = models.JSONField(default=list, blank=True)
    correctAnswer = models.TextField(blank=True, null=True)
    isActive = models.BooleanField(default=True)
    isClosed = models.BooleanField(default=False)
    isLocked = models.BooleanField(default=False)
    timeLimitSeconds = models.IntegerField(default=30)
    points = models.IntegerField(default=100)
    explanation = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    quizTitle = models.CharField(max_length=255, blank=True, null=True)

    # For student doubts / questions asked by students in live chat
    askedByStudent = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True, related_name='asked_questions')
    askedByStudentName = models.CharField(max_length=255, blank=True, null=True)
    upvotes = models.IntegerField(default=0)
    upvotedStudentIds = models.JSONField(default=list, blank=True)
    answerByInstructor = models.TextField(blank=True, null=True)
    isAnswered = models.BooleanField(default=False)

    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-createdAt']

    def __str__(self):
        return f"{self.question[:50]} ({self.batch.name if self.batch else 'No Batch'})"


class LiveQAResponse(models.Model):
    id = models.AutoField(primary_key=True)
    question = models.ForeignKey(LiveQuestion, on_delete=models.CASCADE, related_name='responses')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='live_responses')
    studentName = models.CharField(max_length=255)
    avatar = models.URLField(blank=True, null=True)
    answer = models.TextField()
    isCorrect = models.BooleanField(null=True, blank=True)
    responseTimeMs = models.IntegerField(default=0)
    submittedAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('question', 'student')
        ordering = ['submittedAt']

    def __str__(self):
        return f"{self.studentName} -> {self.question.id} ({self.answer})"


class Assignment(models.Model):
    id = models.CharField(primary_key=True, max_length=100)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    type = models.CharField(max_length=50, default="mixed")  # 'quiz' | 'coding' | 'mixed' | 'poll_survey'
    durationMinutes = models.IntegerField(default=30)
    totalPoints = models.IntegerField(default=100)
    isPublished = models.BooleanField(default=True)
    isLocked = models.BooleanField(default=False)
    deadline = models.DateTimeField(null=True, blank=True)
    questions = models.JSONField(default=list, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-createdAt']

    def __str__(self):
        return f"{self.title} ({self.batch.name if self.batch else 'No Batch'})"


class AssignmentSubmission(models.Model):
    id = models.CharField(primary_key=True, max_length=100)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='assignment_submissions')
    studentName = models.CharField(max_length=255)
    submittedAt = models.DateTimeField(auto_now=True)
    startedAt = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default="submitted")  # 'in_progress' | 'submitted' | 'graded'
    timeLeftSeconds = models.IntegerField(default=0)
    answers = models.JSONField(default=dict, blank=True)  # questionId -> answer
    codeSubmissions = models.JSONField(default=dict, blank=True)  # questionId -> { code, testResults, language }
    questionScores = models.JSONField(default=dict, blank=True)  # questionId -> { earned, max, isCorrect }
    score = models.FloatField(default=0)
    maxScore = models.FloatField(default=0)
    feedback = models.TextField(blank=True, null=True)
    autoGraded = models.BooleanField(default=True)

    class Meta:
        unique_together = ('assignment', 'student')
        ordering = ['-submittedAt']

    def __str__(self):
        return f"{self.studentName} -> {self.assignment.title} ({self.score}/{self.maxScore})"


class CertificateTemplate(models.Model):
    id = models.CharField(primary_key=True, max_length=100)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='certificate_templates')
    title = models.CharField(max_length=255, default="CERTIFICATE OF EXCELLENCE")
    subtitle = models.CharField(max_length=255, default="MIND2I ARTIFICIAL INTELLIGENCE INSTITUTE")
    issuerName = models.CharField(max_length=255, default="MIND2I ARTIFICIAL INTELLIGENCE INSTITUTE")
    signatories = models.JSONField(default=list, blank=True)
    descriptionText = models.TextField(blank=True, default="")
    isUnlocked = models.BooleanField(default=True)
    templateStyle = models.CharField(max_length=50, default="modern")
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updatedAt']

    def __str__(self):
        return f"{self.title} ({self.batch.name if self.batch else 'Global'})"


class AdminUser(models.Model):
    id = models.CharField(primary_key=True, max_length=100)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255, default="mind2i@admin")
    role = models.CharField(max_length=50, default="instructor")  # 'super_admin' | 'instructor' | 'ta'
    assignedBatches = models.JSONField(default=list, blank=True)  # list of batch IDs e.g. ["b1", "b2"]
    permissions = models.JSONField(default=list, blank=True)  # ["all"] or specific tabs
    isActive = models.BooleanField(default=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-createdAt']

    def __str__(self):
        return f"{self.name} ({self.role}) - {self.email}"


class ClientUser(models.Model):
    """Represents a Client/Company who can view intern leaderboards and request interviews."""
    id = models.CharField(primary_key=True, max_length=100)
    companyName = models.CharField(max_length=255)
    contactPerson = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255, default="client@mind2i")
    phone = models.CharField(max_length=20, blank=True, default='')
    industry = models.CharField(max_length=100, blank=True, default='')
    logo = models.URLField(blank=True, default='')
    assignedBatches = models.JSONField(default=list, blank=True)  # list of batch IDs
    isActive = models.BooleanField(default=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-createdAt']

    def __str__(self):
        return f"{self.companyName} ({self.contactPerson}) - {self.email}"


class InterviewRequest(models.Model):
    """Tracks interview requests from clients for specific interns."""
    id = models.CharField(primary_key=True, max_length=100)
    client = models.ForeignKey(ClientUser, on_delete=models.CASCADE, related_name='interview_requests')
    intern = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='interview_requests')
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='interview_requests')
    status = models.CharField(max_length=50, default='pending')  # 'pending' | 'approved' | 'scheduled' | 'completed' | 'rejected'
    requestedDate = models.DateTimeField(null=True, blank=True)
    scheduledDate = models.DateTimeField(null=True, blank=True)
    interviewType = models.CharField(max_length=50, default='virtual')  # 'virtual' | 'in_person' | 'phone'
    notes = models.TextField(blank=True, default='')
    adminNotes = models.TextField(blank=True, default='')
    meetingLink = models.CharField(max_length=500, blank=True, default='')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-createdAt']

    def __str__(self):
        return f"{self.client.companyName} -> {self.intern.name} ({self.status})"


class AppSettingsModel(models.Model):
    id = models.CharField(primary_key=True, max_length=100, default="global")
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='feature_settings', null=True, blank=True)
    enableCodingIDE = models.BooleanField(default=True)
    enableQuiz = models.BooleanField(default=True)
    enableLearnHub = models.BooleanField(default=True)
    enableCertificate = models.BooleanField(default=True)
    enableMyReport = models.BooleanField(default=True)
    enableLiveQA = models.BooleanField(default=True)
    enableLeaderboard = models.BooleanField(default=True)
    enablePeerReview = models.BooleanField(default=False)
    enableTelemetryAnalytics = models.BooleanField(default=True)
    enableClientPortal = models.BooleanField(default=True)
    defaultStudentPassword = models.CharField(max_length=255, default="intern123")
    defaultClientPassword = models.CharField(max_length=255, default="client@mind2i")
    geminiApiKey = models.CharField(max_length=500, blank=True, default="")
    updatedAt = models.DateTimeField(auto_now=True)


class ScheduledMeeting(models.Model):
    id = models.CharField(primary_key=True, max_length=100)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='scheduled_meetings', null=True, blank=True)
    title = models.CharField(max_length=255)
    agenda = models.TextField(blank=True, default="")
    instructorName = models.CharField(max_length=255, blank=True, default="")
    scheduledDate = models.CharField(max_length=100, blank=True, default="Today")
    scheduledTime = models.CharField(max_length=100, blank=True, default="10:00 AM - 01:00 PM")
    meetingLink = models.CharField(max_length=500, blank=True, default="")
    meetingId = models.CharField(max_length=100, blank=True, default="")
    passcode = models.CharField(max_length=100, blank=True, default="")
    status = models.CharField(max_length=50, default="scheduled")  # 'scheduled' | 'live' | 'ended'
    recordingUrl = models.CharField(max_length=500, blank=True, default="")
    isRecordingUnlocked = models.BooleanField(default=True)
    isPublished = models.BooleanField(default=True)
    orderIndex = models.IntegerField(default=0)
    summary = models.JSONField(default=dict, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['orderIndex', 'createdAt']

    def __str__(self):
        return f"{self.title} ({self.status}) - {self.batch.name if self.batch else 'Global'}"


class InternEvaluationRound(models.Model):
    """Stores full faculty reviews, rubric scores, remarks and consensus score per student per round."""
    id = models.CharField(primary_key=True, max_length=100)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='evaluation_rounds')
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, null=True, blank=True, related_name='evaluation_rounds')
    roundName = models.CharField(max_length=255)
    evaluationsData = models.JSONField(default=list, blank=True)
    consensusScore = models.FloatField(default=0)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'roundName')
        ordering = ['-updatedAt']

    def __str__(self):
        return f"{self.student.name} - {self.roundName} ({self.consensusScore}%)"


class BatchEvaluationRound(models.Model):
    """Super Admin custom evaluation rounds created or deleted per batch."""
    id = models.CharField(primary_key=True, max_length=100)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='custom_rounds')
    roundName = models.CharField(max_length=255)
    isDeleted = models.BooleanField(default=False)
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['createdAt']

    def __str__(self):
        return f"{self.batch.name}: {self.roundName} (deleted={self.isDeleted})"


class ProjectAssignment(models.Model):
    """Kanban board project assignments."""
    id = models.CharField(primary_key=True, max_length=100)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, null=True, blank=True, related_name='project_assignments')
    batchName = models.CharField(max_length=255, blank=True, default="")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    executiveSummary = models.TextField(blank=True, default="")
    detailedInstructions = models.TextField(blank=True, default="")
    category = models.CharField(max_length=100, default="AI Engineering")
    technicalCategory = models.CharField(max_length=100, blank=True, default="AI Engineering")
    tier = models.CharField(max_length=50, default="intermediate")
    priority = models.CharField(max_length=50, default="Medium")
    status = models.CharField(max_length=50, default="in_progress")
    assignedStudentIds = models.JSONField(default=list, blank=True)
    technologies = models.JSONField(default=list, blank=True)
    deliverables = models.JSONField(default=list, blank=True)
    resources = models.JSONField(default=list, blank=True)
    mentorObservationBenchmark = models.TextField(blank=True, default="")
    startDate = models.CharField(max_length=100, blank=True, default="")
    startTime = models.CharField(max_length=50, blank=True, default="09:00")
    deadline = models.CharField(max_length=100, blank=True, default="")
    deadlineTime = models.CharField(max_length=50, blank=True, default="23:59")
    githubRepo = models.CharField(max_length=500, blank=True, default="")
    figmaUrl = models.CharField(max_length=500, blank=True, default="")
    points = models.IntegerField(default=100)
    leaderboardPoints = models.IntegerField(default=100)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-createdAt']

    def __str__(self):
        return f"{self.title} ({self.status})"


class ProjectSubmission(models.Model):
    """Intern submissions for project assignments."""
    id = models.CharField(primary_key=True, max_length=100)
    projectId = models.CharField(max_length=100)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='project_submissions', null=True, blank=True)
    studentName = models.CharField(max_length=255, blank=True, default="")
    batchId = models.CharField(max_length=100, blank=True, default="")
    githubUrl = models.CharField(max_length=500, blank=True, default="")
    githubRepoUrl = models.CharField(max_length=500, blank=True, default="")
    liveDemoUrl = models.CharField(max_length=500, blank=True, default="")
    documentationUrl = models.CharField(max_length=500, blank=True, default="")
    fileName = models.CharField(max_length=255, blank=True, default="")
    fileSize = models.CharField(max_length=100, blank=True, default="")
    demoVideoUrl = models.CharField(max_length=500, blank=True, default="")
    demoVideoName = models.CharField(max_length=255, blank=True, default="")
    notes = models.TextField(blank=True, default="")
    submissionNotes = models.TextField(blank=True, default="")
    status = models.CharField(max_length=50, default="pending")  # 'pending' | 'in_progress' | 'in_review' | 'passed' | 'revision_requested'
    grade = models.CharField(max_length=50, blank=True, default="")
    gradePoints = models.IntegerField(default=0, blank=True, null=True)
    feedback = models.TextField(blank=True, default="")
    mentorFeedback = models.TextField(blank=True, default="")
    reviewedBy = models.CharField(max_length=255, blank=True, default="")
    submittedAt = models.CharField(max_length=100, blank=True, default="")
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updatedAt']

    def __str__(self):
        return f"{self.studentName} -> {self.projectId} ({self.status})"


class ShiftPattern(models.Model):
    """Configurable shift patterns for intern roster."""
    id = models.CharField(primary_key=True, max_length=100)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    startTime = models.CharField(max_length=50)
    endTime = models.CharField(max_length=50)
    color = models.CharField(max_length=50, default="blue")
    description = models.TextField(blank=True, default="")
    requiredHours = models.FloatField(default=8.0)
    isDefault = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.startTime} - {self.endTime})"


class InternRosterAssignment(models.Model):
    """Intern roster mapping to specific shift pattern."""
    id = models.CharField(primary_key=True, max_length=100)
    internId = models.CharField(max_length=100)
    internName = models.CharField(max_length=255)
    batchId = models.CharField(max_length=100, blank=True, default="")
    batchName = models.CharField(max_length=255, blank=True, default="")
    shiftId = models.CharField(max_length=100)
    shiftName = models.CharField(max_length=255, blank=True, default="")
    role = models.CharField(max_length=100, blank=True, default="Intern")
    department = models.CharField(max_length=100, blank=True, default="Engineering")
    requiredHours = models.FloatField(default=8.0)
    customWeekends = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.internName} -> {self.shiftName}"


class AttendanceRecord(models.Model):
    """Daily attendance records for interns."""
    id = models.CharField(primary_key=True, max_length=100)
    internId = models.CharField(max_length=100)
    internName = models.CharField(max_length=255, blank=True, default="")
    date = models.CharField(max_length=50)
    status = models.CharField(max_length=50, default="present")
    clockInTime = models.CharField(max_length=50, blank=True, default="")
    clockOutTime = models.CharField(max_length=50, blank=True, default="")
    hoursWorked = models.FloatField(default=0.0)
    requiredHours = models.FloatField(default=8.0)
    shiftId = models.CharField(max_length=100, blank=True, default="")
    shiftName = models.CharField(max_length=255, blank=True, default="")
    isLate = models.BooleanField(default=False)
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.internName} on {self.date}: {self.status}"


class PunchLogEntry(models.Model):
    """Time clock punches (Clock In / Clock Out) with timestamps."""
    id = models.CharField(primary_key=True, max_length=100)
    internId = models.CharField(max_length=100)
    internName = models.CharField(max_length=255, blank=True, default="")
    date = models.CharField(max_length=50)
    type = models.CharField(max_length=50)  # 'clock_in' | 'clock_out'
    timestamp = models.CharField(max_length=100)
    formattedTime = models.CharField(max_length=100, blank=True, default="")
    totalWorkedFormatted = models.CharField(max_length=100, blank=True, default="")
    totalWorkedSeconds = models.IntegerField(default=0)
    isPunchError = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.internName} {self.type} at {self.formattedTime}"


class LeaveRequest(models.Model):
    """Intern leave applications and supervisor approval."""
    id = models.CharField(primary_key=True, max_length=100)
    internId = models.CharField(max_length=100)
    internName = models.CharField(max_length=255)
    batchId = models.CharField(max_length=100, blank=True, default="")
    startDate = models.CharField(max_length=50)
    endDate = models.CharField(max_length=50)
    reason = models.TextField()
    type = models.CharField(max_length=50, default="casual")
    status = models.CharField(max_length=50, default="pending")  # 'pending' | 'approved' | 'rejected'
    appliedAt = models.CharField(max_length=100, blank=True, default="")
    reviewedBy = models.CharField(max_length=255, blank=True, default="")
    reviewerNotes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ['-appliedAt']

    def __str__(self):
        return f"{self.internName} Leave ({self.startDate} - {self.endDate}): {self.status}"


class HolidayEvent(models.Model):
    """Company / Academic calendar holidays."""
    id = models.CharField(primary_key=True, max_length=100)
    name = models.CharField(max_length=255)
    date = models.CharField(max_length=50)
    type = models.CharField(max_length=50, default="holiday")

    class Meta:
        ordering = ['date']

    def __str__(self):
        return f"{self.name} ({self.date})"


class DailyActivityLog(models.Model):
    """Intern daily standup work logs and supervisor review."""
    id = models.CharField(primary_key=True, max_length=100)
    internId = models.CharField(max_length=100)
    internName = models.CharField(max_length=255)
    batchId = models.CharField(max_length=100, blank=True, default="")
    batchName = models.CharField(max_length=255, blank=True, default="")
    logType = models.CharField(max_length=100, default="Daily Achievement")
    description = models.TextField(blank=True, default="")
    date = models.CharField(max_length=50)
    createdAt = models.CharField(max_length=100, blank=True, default="")
    hasBlockers = models.BooleanField(default=False)
    blockerDescription = models.TextField(blank=True, default="")
    status = models.CharField(max_length=50, default="pending")
    adminFeedback = models.TextField(blank=True, default="")
    adminRating = models.FloatField(null=True, blank=True)
    adminReviewedAt = models.CharField(max_length=100, blank=True, default="")
    adminReviewerName = models.CharField(max_length=255, blank=True, default="")
    aiReview = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-createdAt']

    def __str__(self):
        return f"{self.internName} Log on {self.date} ({self.status})"


class AppNotification(models.Model):
    """Interconnected notification feed for users."""
    id = models.CharField(primary_key=True, max_length=100)
    recipientRole = models.CharField(max_length=50, default="all")
    recipientId = models.CharField(max_length=100, blank=True, default="")
    recipientName = models.CharField(max_length=255, blank=True, default="")
    recipientEmail = models.CharField(max_length=255, blank=True, default="")
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=50, default="system")
    actionTab = models.CharField(max_length=100, blank=True, default="")
    timestamp = models.CharField(max_length=100, blank=True, default="")
    isRead = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.recipientRole}] {self.title}: {self.message[:40]}"


class InternResource(models.Model):
    """Candidate document vault items."""
    id = models.CharField(primary_key=True, max_length=100)
    studentId = models.CharField(max_length=100)
    batchId = models.CharField(max_length=100, blank=True, default="")
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=50, default="document")
    fileUrl = models.CharField(max_length=500)
    fileName = models.CharField(max_length=255)
    fileSize = models.CharField(max_length=50, blank=True, default="")
    uploadedAt = models.CharField(max_length=100, blank=True, default="")
    description = models.TextField(blank=True, default="")
    aiRating = models.FloatField(default=90.0)
    aiAuditSummary = models.TextField(blank=True, default="")
    aiRigorNotes = models.TextField(blank=True, default="")
    tags = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['-uploadedAt']

    def __str__(self):
        return f"{self.title} ({self.studentId})"

