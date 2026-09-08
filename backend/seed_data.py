import os
import django
import time
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Batch, Student, Score, ClientUser, InterviewRequest, Assignment, ScheduledMeeting

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
InterviewRequest.objects.create(
    id=f"intv_completed_4",
    client=client,
    intern=nikhil,
    batch=batch3,
    status="completed",
    requestedDate=date.today() - timedelta(days=10),
    scheduledDate=date.today() - timedelta(days=4),
    interviewType="virtual",
    notes="Evaluating for Cloud DevOps deployment pipeline team.",
    adminNotes="Interview conducted successfully. Offer in progress."
)

print("Created 4 sample interview requests.")
print("Seed finished successfully!")
