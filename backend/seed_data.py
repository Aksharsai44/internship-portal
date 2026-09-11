import os
import django
import time
from datetime import date, datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import (
    Batch, Student, Score, ClientUser, InterviewRequest, Assignment, ScheduledMeeting,
    InternEvaluationRound, BatchEvaluationRound, ProjectAssignment, ProjectSubmission,
    ShiftPattern, InternRosterAssignment, AttendanceRecord, PunchLogEntry,
    LeaveRequest, HolidayEvent, DailyActivityLog, AppNotification, InternResource
)

print("Seeding rich mock internship data...")

# 1. Update/Create Batches
batch1 = Batch.objects.filter(name__icontains='python').first()
if not batch1:
    batch1 = Batch.objects.create(
        id=f"batch_{int(time.time()*1000)}_1",
        name="Python Full-Stack & Cloud Architecture",
        type="internship_6m",
        programType="internship",
        durationMonths=6,
        durationLabel="6 Months",
        college="BVRIT / JNTU Hyderabad",
        organization="MIND2I Technical Initiative",
        startDate=date.today() - timedelta(days=60),
        endDate=date.today() + timedelta(days=120),
        status="active",
        description="Comprehensive 6-month full-stack internship covering FastAPI, React 19, PostgreSQL, Docker, and distributed microservices.",
        technologies=["Python", "FastAPI", "React", "PostgreSQL", "Docker", "TailwindCSS"],
        mentor="Vijaya Kumar Mekala"
    )
else:
    batch1.name = "Python Full-Stack & Cloud Architecture"
    batch1.durationLabel = "6 Months"
    batch1.durationMonths = 6
    batch1.technologies = ["Python", "FastAPI", "React", "PostgreSQL", "Docker", "TailwindCSS"]
    batch1.mentor = "Vijaya Kumar Mekala"
    batch1.college = "BVRIT / JNTU Hyderabad"
    batch1.save()

batch2, _ = Batch.objects.get_or_create(
    id="batch_ai_agents_6m",
    defaults={
        "name": "Generative AI & Autonomous Agents Fellowship",
        "type": "internship_6m",
        "programType": "internship",
        "durationMonths": 6,
        "durationLabel": "6 Months",
        "college": "IIIT Hyderabad / Tech Campus",
        "organization": "MIND2I AI Research Lab",
        "startDate": date.today() - timedelta(days=45),
        "endDate": date.today() + timedelta(days=135),
        "status": "active",
        "description": "Advanced research and practical implementation of Autonomous LLM Agents, Multi-Agent Swarms, RAG, and Vector Retrieval Systems.",
        "technologies": ["Python", "PyTorch", "LangChain", "Gemini 3.7", "Qdrant", "FastAPI"],
        "mentor": "Prof. Ananya Varma (AI Research Fellow)"
    }
)

batch3, _ = Batch.objects.get_or_create(
    id="batch_cloud_devops_3m",
    defaults={
        "name": "Cloud Native & DevOps Engineering",
        "type": "internship_3m",
        "programType": "internship",
        "durationMonths": 3,
        "durationLabel": "3 Months",
        "college": "Osmania University College of Engineering",
        "organization": "MIND2I Infrastructure Track",
        "startDate": date.today() - timedelta(days=20),
        "endDate": date.today() + timedelta(days=70),
        "status": "active",
        "description": "Hands-on cloud orchestration, Kubernetes cluster management, CI/CD automation pipelines, and AWS Terraform deployments.",
        "technologies": ["Go", "Kubernetes", "AWS", "Terraform", "GitHub Actions", "Docker"],
        "mentor": "Vikram Seth (Principal DevOps Engineer)"
    }
)

batches = [batch1, batch2, batch3]

# 2. Seed Interns
interns_data = [
    # Batch 1 (Python Full Stack)
    {
        "id": "intern_01",
        "name": "Aarav Sharma",
        "email": "aarav.sharma@mind2i.edu",
        "mobile": "+91 98765 12340",
        "batch": batch1,
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "college": "BVRIT Hyderabad",
        "branch": "Computer Science & Engineering",
        "city": "Hyderabad",
        "state": "Telangana",
        "skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker", "Redis"],
        "bio": "Full-stack engineer specialized in high-concurrency async APIs and responsive web apps. Built 4 production-grade projects.",
        "githubUrl": "https://github.com/aarav-sharma-dev",
        "linkedinUrl": "https://linkedin.com/in/aarav-sharma-ai",
        "mentor": batch1.mentor,
        "totalPoints": 3480,
        "activeStreakDays": 38,
        "fastestResponseMs": 950,
        "scores": {
            "quizScore": 96.0,
            "codingScore": 98.5,
            "liveQAScore": 92.0,
            "assignmentScore": 97.0,
            "overallAccuracy": 95.8
        }
    },
    {
        "id": "intern_02",
        "name": "Pooja Reddy",
        "email": "pooja.reddy@mind2i.edu",
        "mobile": "+91 98765 12341",
        "batch": batch1,
        "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        "college": "JNTU Hyderabad",
        "branch": "Information Technology",
        "city": "Hyderabad",
        "state": "Telangana",
        "skills": ["React 19", "TypeScript", "TailwindCSS", "Next.js", "Python", "GraphQL"],
        "bio": "Frontend architect passionate about polished design systems, micro-animations, and performance optimization. 99.2% Lighthouse scores.",
        "githubUrl": "https://github.com/pooja-reddy-ui",
        "linkedinUrl": "https://linkedin.com/in/pooja-reddy-dev",
        "mentor": batch1.mentor,
        "totalPoints": 3250,
        "activeStreakDays": 29,
        "fastestResponseMs": 1100,
        "scores": {
            "quizScore": 92.0,
            "codingScore": 95.0,
            "liveQAScore": 90.0,
            "assignmentScore": 96.0,
            "overallAccuracy": 93.5
        }
    },
    {
        "id": "intern_03",
        "name": "Karthik Varma",
        "email": "karthik.varma@mind2i.edu",
        "mobile": "+91 98765 12342",
        "batch": batch1,
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "college": "CBIT Hyderabad",
        "branch": "Computer Science",
        "city": "Hyderabad",
        "state": "Telangana",
        "skills": ["Python", "Django", "PostgreSQL", "Celery", "Docker", "AWS S3"],
        "bio": "Backend specialist with deep experience in database indexing, caching strategies, and RESTful API engineering.",
        "githubUrl": "https://github.com/karthik-varma-backend",
        "linkedinUrl": "https://linkedin.com/in/karthik-varma",
        "mentor": batch1.mentor,
        "totalPoints": 2980,
        "activeStreakDays": 22,
        "fastestResponseMs": 1350,
        "scores": {
            "quizScore": 88.0,
            "codingScore": 94.0,
            "liveQAScore": 85.0,
            "assignmentScore": 92.0,
            "overallAccuracy": 89.8
        }
    },
    {
        "id": "intern_04",
        "name": "Sneha Kulkarni",
        "email": "sneha.kulkarni@mind2i.edu",
        "mobile": "+91 98765 12343",
        "batch": batch1,
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        "college": "VNR VJIET",
        "branch": "Data Science",
        "city": "Hyderabad",
        "state": "Telangana",
        "skills": ["Python", "Pandas", "FastAPI", "SQL", "Tableau", "React"],
        "bio": "Data-driven full-stack developer who enjoys building analytical dashboards and business intelligence tools.",
        "githubUrl": "https://github.com/sneha-kulkarni",
        "linkedinUrl": "https://linkedin.com/in/sneha-kulkarni-ds",
        "mentor": batch1.mentor,
        "totalPoints": 2740,
        "activeStreakDays": 19,
        "fastestResponseMs": 1400,
        "scores": {
            "quizScore": 91.0,
            "codingScore": 88.0,
            "liveQAScore": 86.0,
            "assignmentScore": 90.0,
            "overallAccuracy": 88.7
        }
    },

    # Batch 2 (AI Agents Fellowship)
    {
        "id": "intern_05",
        "name": "Rohan Deshmukh",
        "email": "rohan.deshmukh@mind2i.edu",
        "mobile": "+91 98765 12344",
        "batch": batch2,
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "college": "IIIT Hyderabad",
        "branch": "Artificial Intelligence & ML",
        "city": "Hyderabad",
        "state": "Telangana",
        "skills": ["PyTorch", "LangChain", "Gemini API", "Vector DBs", "FastAPI", "Python"],
        "bio": "AI Researcher and Agent developer. Created autonomous multi-agent code analysis pipeline with automated unit testing.",
        "githubUrl": "https://github.com/rohan-ai-dev",
        "linkedinUrl": "https://linkedin.com/in/rohan-deshmukh-ai",
        "mentor": batch2.mentor,
        "totalPoints": 3820,
        "activeStreakDays": 42,
        "fastestResponseMs": 820,
        "scores": {
            "quizScore": 98.0,
            "codingScore": 99.0,
            "liveQAScore": 95.0,
            "assignmentScore": 98.5,
            "overallAccuracy": 97.6
        }
    },
    {
        "id": "intern_06",
        "name": "Ananya Sen",
        "email": "ananya.sen@mind2i.edu",
        "mobile": "+91 98765 12345",
        "batch": batch2,
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "college": "IIT Kharagpur / MIND2I Fellow",
        "branch": "Computer Science",
        "city": "Bengaluru",
        "state": "Karnataka",
        "skills": ["RAG Architecture", "Qdrant", "HuggingFace", "Python", "Docker", "TypeScript"],
        "bio": "Specialized in agentic RAG and hybrid keyword/dense embedding search over terabyte-scale enterprise documents.",
        "githubUrl": "https://github.com/ananya-sen-ai",
        "linkedinUrl": "https://linkedin.com/in/ananya-sen",
        "mentor": batch2.mentor,
        "totalPoints": 3540,
        "activeStreakDays": 36,
        "fastestResponseMs": 910,
        "scores": {
            "quizScore": 95.0,
            "codingScore": 96.0,
            "liveQAScore": 94.0,
            "assignmentScore": 97.0,
            "overallAccuracy": 95.5
        }
    },
    {
        "id": "intern_07",
        "name": "Devansh Patel",
        "email": "devansh.patel@mind2i.edu",
        "mobile": "+91 98765 12346",
        "batch": batch2,
        "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
        "college": "BITS Pilani",
        "branch": "Electrical & Computer Engineering",
        "city": "Hyderabad",
        "state": "Telangana",
        "skills": ["Python", "FastAPI", "Prompt Architecture", "Ollama", "ChromaDB", "React"],
        "bio": "Local LLM inference optimization, quantization (GGUF), and multi-turn conversational agents with structured memory.",
        "githubUrl": "https://github.com/devansh-patel-ai",
        "linkedinUrl": "https://linkedin.com/in/devansh-patel",
        "mentor": batch2.mentor,
        "totalPoints": 3120,
        "activeStreakDays": 27,
        "fastestResponseMs": 1150,
        "scores": {
            "quizScore": 90.0,
            "codingScore": 92.0,
            "liveQAScore": 88.0,
            "assignmentScore": 94.0,
            "overallAccuracy": 91.0
        }
    },

    # Batch 3 (Cloud DevOps)
    {
        "id": "intern_08",
        "name": "Nikhil Rao",
        "email": "nikhil.rao@mind2i.edu",
        "mobile": "+91 98765 12347",
        "batch": batch3,
        "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
        "college": "Osmania University",
        "branch": "Computer Science",
        "city": "Hyderabad",
        "state": "Telangana",
        "skills": ["Kubernetes", "Docker", "AWS EKS", "Terraform", "Go", "Prometheus"],
        "bio": "Cloud infrastructure enthusiast. Built automated zero-downtime blue/green deployment workflows with Helm and ArgoCD.",
        "githubUrl": "https://github.com/nikhil-rao-devops",
        "linkedinUrl": "https://linkedin.com/in/nikhil-rao-cloud",
        "mentor": batch3.mentor,
        "totalPoints": 3410,
        "activeStreakDays": 33,
        "fastestResponseMs": 1050,
        "scores": {
            "quizScore": 94.0,
            "codingScore": 97.0,
            "liveQAScore": 91.0,
            "assignmentScore": 95.0,
            "overallAccuracy": 94.2
        }
    },
    {
        "id": "intern_09",
        "name": "Meera Joshi",
        "email": "meera.joshi@mind2i.edu",
        "mobile": "+91 98765 12348",
        "batch": batch3,
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        "college": "Vasavi College of Engineering",
        "branch": "Information Technology",
        "city": "Hyderabad",
        "state": "Telangana",
        "skills": ["Go", "Linux Internals", "Docker", "GitHub Actions", "Grafana", "Bash"],
        "bio": "DevSecOps advocate focused on container security scanning, automated compliance auditing, and CI/CD hardening.",
        "githubUrl": "https://github.com/meera-joshi-ops",
        "linkedinUrl": "https://linkedin.com/in/meera-joshi",
        "mentor": batch3.mentor,
        "totalPoints": 3050,
        "activeStreakDays": 25,
        "fastestResponseMs": 1200,
        "scores": {
            "quizScore": 89.0,
            "codingScore": 93.0,
            "liveQAScore": 88.0,
            "assignmentScore": 92.0,
            "overallAccuracy": 90.5
        }
    },
]

created_students = []
for data in interns_data:
    scores_data = data.pop("scores")
    student, _ = Student.objects.update_or_create(
        email=data["email"],
        defaults=data
    )
    Score.objects.update_or_create(
        student=student,
        defaults=scores_data
    )
    created_students.append(student)

print(f"Created/updated {len(created_students)} interns.")

# 3. Ensure Client Aipoch Technology Pvt Ltd is assigned all batches
client = ClientUser.objects.filter(email="miryalaaksharsai4@gmail.com").first()
if not client:
    client = ClientUser.objects.create(
        id=f"cli_{int(time.time()*1000)}",
        companyName="Aipoch Technology Pvt Ltd",
        contactPerson="miryala akshar sai",
        email="miryalaaksharsai4@gmail.com",
        password="Akshar@1502",
        phone="+919908502469",
        industry="AI & Cloud Solutions",
        assignedBatches=["all"],
        isActive=True
    )
else:
    client.companyName = "Aipoch Technology Pvt Ltd"
    client.contactPerson = "miryala akshar sai"
    client.assignedBatches = ["all"]
    client.industry = "AI & Cloud Solutions"
    client.save()

print(f"Verified client: {client.companyName}")

# 4. Seed Interview Requests for the client
aarav = Student.objects.get(email="aarav.sharma@mind2i.edu")
rohan = Student.objects.get(email="rohan.deshmukh@mind2i.edu")
pooja = Student.objects.get(email="pooja.reddy@mind2i.edu")
nikhil = Student.objects.get(email="nikhil.rao@mind2i.edu")

# Clean existing interview requests
InterviewRequest.objects.filter(client=client).delete()

# Scheduled interview
InterviewRequest.objects.create(
    id=f"intv_scheduled_1",
    client=client,
    intern=rohan,
    batch=batch2,
    status="scheduled",
    requestedDate=date.today() - timedelta(days=2),
    scheduledDate=date.today() + timedelta(days=3),
    interviewType="virtual",
    meetingLink="https://meet.google.com/aipoch-rohan-intv",
    notes="Candidate scored 99% in autonomous agent design. Would like to discuss their multi-agent swarm architecture.",
    adminNotes="Confirmed by candidate. Lead Architect from Aipoch will be presiding."
)

# Approved interview
InterviewRequest.objects.create(
    id=f"intv_approved_2",
    client=client,
    intern=aarav,
    batch=batch1,
    status="approved",
    requestedDate=date.today() - timedelta(days=1),
    interviewType="virtual",
    notes="Strong performance in FastAPI and async systems. Looking to evaluate for Junior Cloud Engineer role.",
    adminNotes="Approved by Program Director. Ready for client slot scheduling."
)

# Pending request
InterviewRequest.objects.create(
    id=f"intv_pending_3",
    client=client,
    intern=pooja,
    batch=batch1,
    status="pending",
    requestedDate=date.today(),
    interviewType="virtual",
    notes="Impressed by the 99.2% Lighthouse web application portfolio. Requesting technical round."
)

# Completed interview
InterviewRequest.objects.get_or_create(
    id=f"intv_completed_4",
    defaults={
        "client": client,
        "intern": nikhil,
        "batch": batch3,
        "status": "completed",
        "requestedDate": date.today() - timedelta(days=10),
        "scheduledDate": date.today() - timedelta(days=4),
        "interviewType": "virtual",
        "notes": "Evaluating for Cloud DevOps deployment pipeline team.",
        "adminNotes": "Interview conducted successfully. Offer in progress."
    }
)

# 6. Seed Shift Patterns
shifts_data = [
    {"id": "shift_morning", "name": "Morning Engineering Sprint", "code": "MS-01", "startTime": "08:00 AM", "endTime": "04:30 PM", "color": "emerald", "description": "Core development sprint shift with standup at 08:30 AM.", "requiredHours": 8.0, "isDefault": False},
    {"id": "shift_general", "name": "General Innovation Shift", "code": "GS-01", "startTime": "09:30 AM", "endTime": "06:30 PM", "color": "indigo", "description": "Standard working shift for all intern cohorts with midday mentor review.", "requiredHours": 8.0, "isDefault": True},
    {"id": "shift_deep_work", "name": "Deep Work & Architecture", "code": "DW-01", "startTime": "11:00 AM", "endTime": "08:00 PM", "color": "violet", "description": "Focused coding and systems defense round preparations.", "requiredHours": 8.0, "isDefault": False},
    {"id": "shift_night", "name": "Night Global Collaboration", "code": "NS-01", "startTime": "05:00 PM", "endTime": "01:30 AM", "color": "amber", "description": "Sync with global mentor teams and open-source releases.", "requiredHours": 8.0, "isDefault": False},
]
for s in shifts_data:
    ShiftPattern.objects.update_or_create(id=s["id"], defaults=s)

print("Seeded Shift Patterns.")

# 7. Seed Holidays
holidays = [
    {"id": "hol_1", "name": "Republic Day", "date": "2026-01-26", "type": "holiday"},
    {"id": "hol_2", "name": "Holi Festival", "date": "2026-03-14", "type": "holiday"},
    {"id": "hol_3", "name": "May Day", "date": "2026-05-01", "type": "holiday"},
    {"id": "hol_4", "name": "Independence Day", "date": "2026-08-15", "type": "holiday"},
    {"id": "hol_5", "name": "Gandhi Jayanti", "date": "2026-10-02", "type": "holiday"},
    {"id": "hol_6", "name": "Diwali Festival", "date": "2026-11-08", "type": "holiday"},
]
for h in holidays:
    HolidayEvent.objects.update_or_create(id=h["id"], defaults=h)

# Ensure Varshini Reddy is seeded
varshini = Student.objects.filter(email="varshini.reddy@mind2i.edu").first()
if not varshini:
    varshini, _ = Student.objects.get_or_create(
        id="intern_00_varshini",
        defaults={
            "name": "Varshini Reddy",
            "email": "varshini.reddy@mind2i.edu",
            "mobile": "+91 98765 99999",
            "batch": batch1,
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            "college": "BVRIT Hyderabad",
            "branch": "Computer Science & Engineering",
            "city": "Hyderabad",
            "state": "Telangana",
            "skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker", "Redis"],
            "bio": "Lead intern in systems architecture defense. Built distributed microservices and caching.",
            "mentor": batch1.mentor,
            "totalPoints": 3950,
            "activeStreakDays": 45,
            "fastestResponseMs": 780
        }
    )
    Score.objects.update_or_create(
        student=varshini,
        defaults={
            "quizScore": 98.0,
            "codingScore": 99.0,
            "liveQAScore": 95.0,
            "assignmentScore": 98.0,
            "overallAccuracy": 97.5
        }
    )

# 8. Seed Roster, Attendance, and Punch Logs
for idx, stu in enumerate([varshini, aarav, pooja, rohan, nikhil]):
    # Roster
    shift = shifts_data[idx % len(shifts_data)]
    InternRosterAssignment.objects.update_or_create(
        id=f"roster_{stu.id}",
        defaults={
            "internId": stu.id,
            "internName": stu.name,
            "batchId": stu.batch.id,
            "batchName": stu.batch.name,
            "shiftId": shift["id"],
            "shiftName": shift["name"],
            "role": "Intern",
            "department": "Engineering",
            "requiredHours": 8.0,
            "customWeekends": [0, 6],
        }
    )

    # Attendance Records (Past 5 days)
    for day_offset in range(5):
        rec_date = (date.today() - timedelta(days=day_offset)).strftime("%Y-%m-%d")
        status = "present" if (idx + day_offset) % 4 != 0 else "late"
        AttendanceRecord.objects.update_or_create(
            id=f"att_{stu.id}_{rec_date}",
            defaults={
                "internId": stu.id,
                "internName": stu.name,
                "date": rec_date,
                "status": status,
                "clockInTime": "09:28 AM" if status == "present" else "09:54 AM",
                "clockOutTime": "06:32 PM",
                "hoursWorked": 8.5 if status == "present" else 7.8,
                "requiredHours": 8.0,
                "shiftId": shift["id"],
                "shiftName": shift["name"],
                "isLate": (status == "late"),
                "notes": "Good progress on assigned modules."
            }
        )

    # Today's Punch Logs
    today_str = date.today().strftime("%Y-%m-%d")
    PunchLogEntry.objects.update_or_create(
        id=f"punch_{stu.id}_in",
        defaults={
            "internId": stu.id,
            "internName": stu.name,
            "date": today_str,
            "type": "clock_in",
            "timestamp": f"{today_str}T09:30:15Z",
            "formattedTime": f"09:30:15 AM - {today_str}",
            "totalWorkedFormatted": "In Progress",
            "totalWorkedSeconds": 14400,
            "isPunchError": False
        }
    )

print("Seeded Roster, Attendance & Punch Logs.")

# 9. Seed Daily Activity Logs
daily_logs = [
    {
        "id": "log_varshini_1",
        "internId": varshini.id,
        "internName": varshini.name,
        "batchId": varshini.batch.id,
        "batchName": varshini.batch.name,
        "logType": "Daily Achievement",
        "description": "Implemented JWT authentication and role-based permissions in FastAPI backend. Conducted load testing on redis caching layer.",
        "date": date.today().strftime("%Y-%m-%d"),
        "createdAt": datetime.now().isoformat(),
        "hasBlockers": False,
        "blockerDescription": "",
        "status": "reviewed",
        "adminFeedback": "Excellent async implementation. Proper rate limiting headers added.",
        "adminRating": 5.0,
        "adminReviewedAt": "Today, 02:30 PM",
        "adminReviewerName": "Vijaya Kumar Mekala",
        "aiReview": {
            "rating": 4.9,
            "summary": "Outstanding technical velocity on auth tokens and microservices defense.",
            "velocityAssessment": "Outstanding",
            "technicalHighlights": ["JWT Blacklisting", "Async Session Pooling", "Docker Containerization"],
            "actionableSuggestions": ["Add refresh token rotation test cases"],
            "reviewedAt": datetime.now().isoformat()
        }
    },
    {
        "id": "log_aarav_1",
        "internId": aarav.id,
        "internName": aarav.name,
        "batchId": aarav.batch.id,
        "batchName": aarav.batch.name,
        "logType": "Daily Achievement",
        "description": "Configured Prometheus telemetry monitoring and Grafana dashboards for Kubernetes cluster node health.",
        "date": date.today().strftime("%Y-%m-%d"),
        "createdAt": datetime.now().isoformat(),
        "hasBlockers": True,
        "blockerDescription": "Encountered RBAC permissions error on ingress controller namespace.",
        "status": "pending",
        "adminFeedback": "",
        "aiReview": {
            "rating": 4.5,
            "summary": "Solid infrastructure monitoring setup. Blocker can be resolved by updating ClusterRoleBinding.",
            "velocityAssessment": "On Track",
            "technicalHighlights": ["Prometheus Metrics Exporter", "Helm Chart Template"],
            "actionableSuggestions": ["Review cluster admin role bindings"],
            "reviewedAt": datetime.now().isoformat()
        }
    },
    {
        "id": "log_pooja_1",
        "internId": pooja.id,
        "internName": pooja.name,
        "batchId": pooja.batch.id,
        "batchName": pooja.batch.name,
        "logType": "Daily Achievement",
        "description": "Refactored React design system tokens for high-contrast accessibility compliance. Verified Lighthouse score at 99.2%.",
        "date": date.today().strftime("%Y-%m-%d"),
        "createdAt": datetime.now().isoformat(),
        "hasBlockers": False,
        "status": "reviewed",
        "adminFeedback": "Design polish is world-class. Approved for production merge.",
        "adminRating": 5.0,
        "adminReviewedAt": "Yesterday, 05:00 PM",
        "adminReviewerName": "Dr. S. Rajesh"
    }
]
for dl in daily_logs:
    DailyActivityLog.objects.update_or_create(id=dl["id"], defaults=dl)

print("Seeded Daily Activity Logs.")

# 10. Seed Demo Project Assignments & Submissions (Preserved for Demo Batches)
projects = [
    {
        "id": "proj_01",
        "batch": batch1,
        "batchName": batch1.name,
        "title": "Interactive Data Visualization & Analytics Engine",
        "description": "Create an accessible, responsive dashboard view featuring real-time data streaming simulation, filter controls, and CSS charts.",
        "executiveSummary": "Create an accessible, responsive dashboard view featuring real-time data streaming simulation, filter controls, and CSS charts.",
        "detailedInstructions": "Implement interactive SVG charts, data export engine, and Lighthouse 95+ audit score.",
        "category": "Frontend (React, Tailwind, State)",
        "technicalCategory": "Frontend (React, Tailwind, State)",
        "tier": "intermediate",
        "priority": "Medium",
        "status": "in_progress",
        "assignedStudentIds": [varshini.id, pooja.id],
        "technologies": ["React 19", "TailwindCSS", "Recharts", "TypeScript"],
        "deliverables": ["Interactive Chart Component", "Data Export Engine", "Lighthouse 95+ Audit"],
        "startDate": (date.today() - timedelta(days=5)).strftime("%Y-%m-%d"),
        "startTime": "09:00",
        "deadline": (date.today() + timedelta(days=7)).strftime("%Y-%m-%d"),
        "deadlineTime": "23:59",
        "githubRepo": "https://github.com/mind2i-interns/data-viz-engine",
        "figmaUrl": "https://figma.com/@mind2i/data-viz",
        "points": 100,
        "leaderboardPoints": 100
    },
    {
        "id": "proj_02",
        "batch": batch2,
        "batchName": batch2.name,
        "title": "Multi-Agent Swarm for Automated Code Reviews",
        "description": "Construct a decentralized LLM agent swarm using LangChain and Gemini 3.7 to perform automated AST parsing, security audits, and pull request reviews.",
        "executiveSummary": "Construct a decentralized LLM agent swarm using LangChain and Gemini 3.7 to perform automated AST parsing, security audits, and pull request reviews.",
        "detailedInstructions": "Build Agent Orchestrator, Security Linter Plugin, and Benchmark Report.",
        "category": "AI Engineering",
        "technicalCategory": "AI & Algorithms (LLM/Gemini)",
        "tier": "advanced",
        "priority": "High",
        "status": "in_progress",
        "assignedStudentIds": [rohan.id, aarav.id],
        "technologies": ["Python", "Gemini 3.7", "LangChain", "FastAPI", "VectorDB"],
        "deliverables": ["Agent Orchestrator", "Security Linter Plugin", "Benchmark Report"],
        "startDate": (date.today() - timedelta(days=10)).strftime("%Y-%m-%d"),
        "startTime": "10:00",
        "deadline": (date.today() + timedelta(days=10)).strftime("%Y-%m-%d"),
        "deadlineTime": "23:59",
        "githubRepo": "https://github.com/mind2i-interns/agent-swarm-reviewer",
        "points": 150,
        "leaderboardPoints": 150
    },
    {
        "id": "proj_03",
        "batch": batch3,
        "batchName": batch3.name,
        "title": "Zero-Downtime Kubernetes Blue/Green Deployment Pipeline",
        "description": "Architect a production-grade CI/CD pipeline with GitHub Actions, Terraform, and ArgoCD for blue/green rolling deployments on AWS EKS.",
        "executiveSummary": "Architect a production-grade CI/CD pipeline with GitHub Actions, Terraform, and ArgoCD for blue/green rolling deployments on AWS EKS.",
        "detailedInstructions": "Deliver Terraform Scripts, ArgoCD Helm Manifests, and Load Balancing Strategy.",
        "category": "DevOps & Cloud Architecture",
        "technicalCategory": "DevOps & Containerization",
        "tier": "advanced",
        "priority": "High",
        "status": "in_progress",
        "assignedStudentIds": [nikhil.id],
        "technologies": ["Kubernetes", "AWS EKS", "ArgoCD", "Terraform", "Docker"],
        "deliverables": ["Terraform Scripts", "ArgoCD Helm Manifests", "Load Balancing Strategy"],
        "startDate": (date.today() - timedelta(days=12)).strftime("%Y-%m-%d"),
        "startTime": "09:00",
        "deadline": (date.today() + timedelta(days=5)).strftime("%Y-%m-%d"),
        "deadlineTime": "18:00",
        "githubRepo": "https://github.com/mind2i-interns/k8s-bluegreen-pipeline",
        "points": 120,
        "leaderboardPoints": 120
    }
]
for p in projects:
    ProjectAssignment.objects.update_or_create(id=p["id"], defaults=p)

# Submissions for Demo Batches
submissions = [
    {
        "id": "sub_varshini_proj_01",
        "projectId": "proj_01",
        "student": varshini,
        "studentName": varshini.name,
        "batchId": batch1.id,
        "githubUrl": "https://github.com/varshini-reddy/mind2i-dataviz",
        "githubRepoUrl": "https://github.com/varshini-reddy/mind2i-dataviz",
        "liveDemoUrl": "https://varshini-dataviz.mind2i.app",
        "documentationUrl": "https://varshini-dataviz.mind2i.app/docs",
        "notes": "Implemented custom SVG time-series graphs with full dark-mode and memoized responsive containers.",
        "submissionNotes": "Implemented custom SVG time-series graphs with full dark-mode and memoized responsive containers.",
        "status": "passed",
        "grade": "A+",
        "gradePoints": 98,
        "feedback": "Outstanding engineering. Exceeded requirements with zero console warnings and 100% WCAG compliance.",
        "mentorFeedback": "Outstanding engineering. Exceeded requirements with zero console warnings and 100% WCAG compliance.",
        "reviewedBy": "Vijaya Kumar Mekala",
        "submittedAt": (date.today() - timedelta(days=1)).strftime("%Y-%m-%d")
    },
    {
        "id": "sub_rohan_proj_02",
        "projectId": "proj_02",
        "student": rohan,
        "studentName": rohan.name,
        "batchId": batch2.id,
        "githubUrl": "https://github.com/rohan-verma/agentic-swarm",
        "githubRepoUrl": "https://github.com/rohan-verma/agentic-swarm",
        "liveDemoUrl": "https://agent-swarm.mind2i.app",
        "notes": "Created 3 specialized agents: Security Auditor, Performance Profiler, and Syntax Optimizer.",
        "submissionNotes": "Created 3 specialized agents: Security Auditor, Performance Profiler, and Syntax Optimizer.",
        "status": "in_review",
        "grade": "",
        "gradePoints": 0,
        "feedback": "Under evaluation by Lead Architect.",
        "mentorFeedback": "Under evaluation by Lead Architect.",
        "reviewedBy": "Prof. Ananya Varma",
        "submittedAt": date.today().strftime("%Y-%m-%d")
    }
]
for sub in submissions:
    ProjectSubmission.objects.update_or_create(id=sub["id"], defaults=sub)

print("Seeded Project Assignments and Submissions for Demo Batches.")

# 11. Seed Profile Evaluation Rounds & Consensus Reviews
standard_rounds = [
    "System Architecture & System Defense",
    "Core Technical & Code Quality Review",
    "Industry Placement & Behavioral Readiness"
]
for b in batches:
    for r_name in standard_rounds:
        BatchEvaluationRound.objects.update_or_create(
            id=f"round_{b.id}_{abs(hash(r_name)) % 1000000}",
            defaults={
                "batch": b,
                "roundName": r_name,
                "isDeleted": False
            }
        )

# Seed Varshini's Completed Evaluations across all rounds
varshini_evals_data = [
    {
        "id": "eval_vk_varshini",
        "studentId": varshini.id,
        "batchId": batch1.id,
        "reviewerName": "Vijaya Kumar Mekala",
        "reviewerRole": "Lead Evaluator & Program Director",
        "evaluationName": "System Architecture & System Defense",
        "roundName": "System Architecture & System Defense",
        "roundNumber": 1,
        "evaluatorAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=VijayaKumar",
        "evaluatedAt": "2026-09-08T10:00:00.000Z",
        "communicationScore": 92,
        "communicationNotes": "Extremely articulate defense of microservices partition tolerance and CAP theorem tradeoffs.",
        "grammarScore": 95,
        "grammarNotes": "Flawless technical vocabulary and clear documentation syntax.",
        "fluencyScore": 90,
        "fluencyNotes": "Confident delivery under probing questions on DB sharding.",
        "projectScore": 94,
        "projectNotes": "Production-ready backend with automated pytest suite and containerization.",
        "customNotes": "One of the top candidates in this cohort. Strongly recommended for high-impact software engineering roles.",
        "overallRating": 93,
        "aiVerdict": "Distinction Ready",
        "aiSummary": "Demonstrates exceptional technical maturity, clean architectural design patterns, and robust communication skills.",
        "aiStrengths": ["Distributed Systems Defense", "Async FastAPI & SQLAlchemy", "Docker Optimization"],
        "aiGrowthAreas": ["Deep dive into Kubernetes multi-region ingress"],
        "isAIGenerated": False
    },
    {
        "id": "eval_sr_varshini",
        "studentId": varshini.id,
        "batchId": batch1.id,
        "reviewerName": "Dr. S. Rajesh",
        "reviewerRole": "Principal Software Architect & Tech Faculty",
        "evaluationName": "System Architecture & System Defense",
        "roundName": "System Architecture & System Defense",
        "roundNumber": 1,
        "evaluatorAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=RajeshFaculty",
        "evaluatedAt": "2026-09-08T11:30:00.000Z",
        "communicationScore": 88,
        "communicationNotes": "Clear architectural diagrams and thorough understanding of Redis caching strategies.",
        "grammarScore": 90,
        "grammarNotes": "Professional and well-organized responses.",
        "fluencyScore": 86,
        "fluencyNotes": "Engaged with interviewer prompts thoughtfully.",
        "projectScore": 92,
        "projectNotes": "Clean codebase with comprehensive unit tests and CI/CD config.",
        "customNotes": "Solid technical grasp of asynchronous programming.",
        "overallRating": 89,
        "isAIGenerated": False
    }
]
InternEvaluationRound.objects.update_or_create(
    student=varshini,
    roundName="System Architecture & System Defense",
    defaults={
        "id": f"eval_{varshini.id}_sys_arch",
        "batch": batch1,
        "evaluationsData": varshini_evals_data,
        "consensusScore": 91.0
    }
)

# Seed Pooja's Evaluations
pooja_evals_data = [
    {
        "id": "eval_sr_pooja",
        "studentId": pooja.id,
        "batchId": batch1.id,
        "reviewerName": "Dr. S. Rajesh",
        "reviewerRole": "Principal Software Architect & Tech Faculty",
        "evaluationName": "System Architecture & System Defense",
        "roundName": "System Architecture & System Defense",
        "roundNumber": 1,
        "evaluatorAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=RajeshFaculty",
        "evaluatedAt": "2026-09-07T14:00:00.000Z",
        "communicationScore": 86,
        "communicationNotes": "Very clear walkthrough of UI/UX accessibility patterns and color contrast algorithms.",
        "grammarScore": 92,
        "grammarNotes": "Well written specifications and design doc.",
        "fluencyScore": 88,
        "fluencyNotes": "Polished presentation demeanor.",
        "projectScore": 90,
        "projectNotes": "Impressive Figma to React token translation engine.",
        "customNotes": "Strong candidate for full-stack product engineering.",
        "overallRating": 89,
        "isAIGenerated": False
    }
]
InternEvaluationRound.objects.update_or_create(
    student=pooja,
    roundName="System Architecture & System Defense",
    defaults={
        "id": f"eval_{pooja.id}_sys_arch",
        "batch": batch1,
        "evaluationsData": pooja_evals_data,
        "consensusScore": 89.0
    }
)

# Seed Notifications
notifications = [
    {
        "id": "notif_01",
        "recipientRole": "admin",
        "title": "New Interview Request Logged",
        "message": "Aipoch Systems requested an interview with Varshini Reddy.",
        "type": "interview",
        "actionTab": "interviews",
        "timestamp": datetime.now().isoformat(),
        "isRead": False
    },
    {
        "id": "notif_02",
        "recipientRole": "all",
        "title": "System Update: PostgreSQL Backend Connected",
        "message": "Real-time synchronization for evaluations, shifts, attendance, and projects is now online.",
        "type": "system",
        "actionTab": "dashboard",
        "timestamp": datetime.now().isoformat(),
        "isRead": False
    }
]
for n in notifications:
    AppNotification.objects.update_or_create(id=n["id"], defaults=n)

print("Seeded Faculty Evaluation Rounds and Notifications.")
print("All rich mock and real-time backend data seeded successfully into PostgreSQL!")
