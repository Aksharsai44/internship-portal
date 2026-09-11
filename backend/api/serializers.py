from rest_framework import serializers
import time
from .models import (
    Batch, Student, Score, LearnHubModule, LearnHubStudentProgress,
    LiveQuestion, LiveQAResponse, Assignment, AssignmentSubmission,
    CertificateTemplate, AdminUser, AppSettingsModel, ScheduledMeeting,
    ClientUser, InterviewRequest,
    InternEvaluationRound, BatchEvaluationRound, ProjectAssignment, ProjectSubmission,
    ShiftPattern, InternRosterAssignment, AttendanceRecord, PunchLogEntry,
    LeaveRequest, HolidayEvent, DailyActivityLog, AppNotification, InternResource
)


class BatchSerializer(serializers.ModelSerializer):
    studentCount = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = '__all__'

    def get_studentCount(self, obj):
        return obj.students.count()


class ScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Score
        fields = ['quizScore', 'codingScore', 'liveQAScore', 'assignmentScore', 'overallAccuracy']


class StudentSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    scores = ScoreSerializer(required=False)
    batchName = serializers.CharField(source='batch.name', read_only=True)
    batchId = serializers.CharField(source='batch.id', read_only=True, required=False, allow_null=True)
    batch = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), required=False, allow_null=True)
    avatar = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Student
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if not ret.get('scores'):
            ret['scores'] = {
                'quizScore': 0,
                'codingScore': 0,
                'liveQAScore': 0,
                'assignmentScore': 0,
                'overallAccuracy': 0.0
            }
        if not ret.get('resumeData'):
            ret['resumeData'] = {}
        return ret

    def validate(self, attrs):
        if not self.instance:
            batch = attrs.get('batch')
            batch_id = self.initial_data.get('batchId') or self.initial_data.get('batch')
            if not batch and batch_id:
                try:
                    batch = Batch.objects.get(id=batch_id)
                except Batch.DoesNotExist:
                    pass
            if batch and getattr(batch, 'isLocked', False):
                raise serializers.ValidationError({"error": f"Registration for cohort '{batch.name}' has been closed."})
        return attrs

    def create(self, validated_data):
        scores_data = validated_data.pop('scores', None)
        student_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"stu_{int(time.time()*1000)}"
        email = validated_data.get('email')

        batch_id = self.initial_data.get('batchId') or self.initial_data.get('batch')
        if batch_id and 'batch' not in validated_data:
            try:
                validated_data['batch'] = Batch.objects.get(id=batch_id)
            except Batch.DoesNotExist:
                validated_data['batch'] = Batch.objects.create(
                    id=batch_id,
                    name=self.initial_data.get('batchName', 'Internship Cohort'),
                    type='internship_3m',
                    programType='internship',
                    durationMonths=3,
                    durationLabel='3 Months',
                    college=self.initial_data.get('college', ''),
                    startDate='2026-09-01',
                    endDate='2026-12-01',
                    status='active',
                )

        student, created = Student.objects.update_or_create(
            email=email,
            defaults={
                'id': student_id,
                **validated_data
            }
        )

        if scores_data:
            Score.objects.update_or_create(student=student, defaults=scores_data)
        else:
            Score.objects.get_or_create(student=student)

        return student

    def update(self, instance, validated_data):
        scores_data = validated_data.pop('scores', None)
        batch_id = self.initial_data.get('batchId') or self.initial_data.get('batch')
        if batch_id and 'batch' not in validated_data:
            try:
                validated_data['batch'] = Batch.objects.get(id=batch_id)
            except Batch.DoesNotExist:
                pass

        # Update student fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update nested scores
        if scores_data and hasattr(instance, 'scores'):
            for attr, value in scores_data.items():
                setattr(instance.scores, attr, value)
            instance.scores.save()

        return instance


class LearnHubModuleSerializer(serializers.ModelSerializer):
    batchId = serializers.CharField(source='batch.id', read_only=True)
    batch = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), required=False, allow_null=True)

    class Meta:
        model = LearnHubModule
        fields = '__all__'

    def create(self, validated_data):
        # Support batchId passed in request data
        batch_id = self.initial_data.get('batchId') or self.initial_data.get('batch')
        if batch_id and 'batch' not in validated_data:
            try:
                validated_data['batch'] = Batch.objects.get(id=batch_id)
            except Batch.DoesNotExist:
                pass
        return super().create(validated_data)

    def update(self, instance, validated_data):
        batch_id = self.initial_data.get('batchId') or self.initial_data.get('batch')
        if batch_id:
            try:
                validated_data['batch'] = Batch.objects.get(id=batch_id)
            except Batch.DoesNotExist:
                pass
        return super().update(instance, validated_data)


class LearnHubStudentProgressSerializer(serializers.ModelSerializer):
    studentId = serializers.CharField(source='student.id', read_only=True)
    moduleId = serializers.CharField(source='module.id', read_only=True)

    class Meta:
        model = LearnHubStudentProgress
        fields = '__all__'

    def create(self, validated_data):
        student_id = self.initial_data.get('studentId') or self.initial_data.get('student')
        module_id = self.initial_data.get('moduleId') or self.initial_data.get('module')
        if student_id and 'student' not in validated_data:
            try:
                validated_data['student'] = Student.objects.get(id=student_id)
            except Student.DoesNotExist:
                pass
        if module_id and 'module' not in validated_data:
            try:
                validated_data['module'] = LearnHubModule.objects.get(id=module_id)
            except LearnHubModule.DoesNotExist:
                pass

        if 'student' in validated_data and 'module' in validated_data:
            instance, _ = LearnHubStudentProgress.objects.update_or_create(
                student=validated_data['student'],
                module=validated_data['module'],
                defaults={
                    'completedSlides': validated_data.get('completedSlides', []),
                    'masteredTags': validated_data.get('masteredTags', []),
                    'quizScores': validated_data.get('quizScores', {}),
                }
            )
            return instance
        return super().create(validated_data)


class LiveQAResponseSerializer(serializers.ModelSerializer):
    studentId = serializers.CharField(source='student.id', read_only=True)
    questionId = serializers.CharField(source='question.id', read_only=True)

    class Meta:
        model = LiveQAResponse
        fields = ['id', 'questionId', 'studentId', 'studentName', 'avatar', 'answer', 'isCorrect', 'responseTimeMs', 'submittedAt']


class LiveQuestionSerializer(serializers.ModelSerializer):
    batchId = serializers.CharField(source='batch.id', read_only=True)
    batch = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), required=False, allow_null=True)
    responses = LiveQAResponseSerializer(many=True, read_only=True)
    askedByStudentId = serializers.CharField(source='askedByStudent.id', read_only=True, required=False, allow_null=True)

    class Meta:
        model = LiveQuestion
        fields = '__all__'

    def create(self, validated_data):
        batch_id = self.initial_data.get('batchId') or self.initial_data.get('batch')
        if batch_id and 'batch' not in validated_data:
            try:
                validated_data['batch'] = Batch.objects.get(id=batch_id)
            except Batch.DoesNotExist:
                pass

        student_id = self.initial_data.get('askedByStudentId') or self.initial_data.get('askedByStudent')
        if student_id and 'askedByStudent' not in validated_data:
            try:
                validated_data['askedByStudent'] = Student.objects.get(id=student_id)
            except Student.DoesNotExist:
                pass

        return super().create(validated_data)

    def update(self, instance, validated_data):
        batch_id = self.initial_data.get('batchId') or self.initial_data.get('batch')
        if batch_id:
            try:
                validated_data['batch'] = Batch.objects.get(id=batch_id)
            except Batch.DoesNotExist:
                pass

        return super().update(instance, validated_data)


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    assignmentId = serializers.CharField(source='assignment.id', read_only=True)
    studentId = serializers.CharField(source='student.id', read_only=True)
    assignment = serializers.PrimaryKeyRelatedField(queryset=Assignment.objects.all(), required=False, allow_null=True)
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), required=False, allow_null=True)

    class Meta:
        model = AssignmentSubmission
        fields = '__all__'

    def to_internal_value(self, data):
        data_copy = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'assignmentId' in data_copy and 'assignment' not in data_copy:
            data_copy['assignment'] = data_copy['assignmentId']
        if 'studentId' in data_copy and 'student' not in data_copy:
            data_copy['student'] = data_copy['studentId']
        return super().to_internal_value(data_copy)

    def create(self, validated_data):
        assignment_obj = validated_data.get('assignment')
        student_obj = validated_data.get('student')

        if assignment_obj and student_obj:
            sub_id = validated_data.get('id') or f"sub_{assignment_obj.id}_{student_obj.id}"
            instance, _ = AssignmentSubmission.objects.update_or_create(
                assignment=assignment_obj,
                student=student_obj,
                defaults={
                    'id': sub_id,
                    'studentName': validated_data.get('studentName') or student_obj.name,
                    'status': validated_data.get('status', 'submitted'),
                    'timeLeftSeconds': validated_data.get('timeLeftSeconds', 0),
                    'answers': validated_data.get('answers', {}),
                    'codeSubmissions': validated_data.get('codeSubmissions', {}),
                    'questionScores': validated_data.get('questionScores', {}),
                    'score': validated_data.get('score', 0),
                    'maxScore': validated_data.get('maxScore', 0),
                    'feedback': validated_data.get('feedback', ''),
                    'autoGraded': validated_data.get('autoGraded', True),
                }
            )
            return instance

        return super().create(validated_data)


class AssignmentSerializer(serializers.ModelSerializer):
    batchId = serializers.CharField(source='batch.id', read_only=True)
    batch = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), required=False, allow_null=True)
    submissionsCount = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = '__all__'

    def to_internal_value(self, data):
        data_copy = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'batchId' in data_copy and 'batch' not in data_copy:
            data_copy['batch'] = data_copy['batchId']
        return super().to_internal_value(data_copy)

    def get_submissionsCount(self, obj):
        return obj.submissions.count()

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class CertificateTemplateSerializer(serializers.ModelSerializer):
    batchId = serializers.CharField(source='batch.id', read_only=True)
    batch = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), required=False, allow_null=True)

    class Meta:
        model = CertificateTemplate
        fields = '__all__'

    def create(self, validated_data):
        batch_id = self.initial_data.get('batchId') or self.initial_data.get('batch')
        template_id = self.initial_data.get('id') or f"cert_{batch_id}"

        if batch_id and 'batch' not in validated_data:
            try:
                validated_data['batch'] = Batch.objects.get(id=batch_id)
            except Batch.DoesNotExist:
                pass

        validated_data['id'] = template_id

        # Use update_or_create to prevent duplicates per batch
        if 'batch' in validated_data and validated_data['batch']:
            instance, _ = CertificateTemplate.objects.update_or_create(
                batch=validated_data['batch'],
                defaults={
                    'id': template_id,
                    'title': validated_data.get('title', 'CERTIFICATE OF EXCELLENCE'),
                    'subtitle': validated_data.get('subtitle', 'MIND2I ARTIFICIAL INTELLIGENCE INSTITUTE'),
                    'issuerName': validated_data.get('issuerName', 'MIND2I ARTIFICIAL INTELLIGENCE INSTITUTE'),
                    'signatories': validated_data.get('signatories', []),
                    'descriptionText': validated_data.get('descriptionText', ''),
                    'isUnlocked': validated_data.get('isUnlocked', True),
                    'templateStyle': validated_data.get('templateStyle', 'modern'),
                }
            )
            return instance

        return super().create(validated_data)

    def update(self, instance, validated_data):
        batch_id = self.initial_data.get('batchId') or self.initial_data.get('batch')
        if batch_id:
            try:
                validated_data['batch'] = Batch.objects.get(id=batch_id)
            except Batch.DoesNotExist:
                pass
        return super().update(instance, validated_data)


class AdminUserSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)

    class Meta:
        model = AdminUser
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def create(self, validated_data):
        user_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"adm_{int(time.time()*1000)}"
        email = validated_data.get('email')

        instance, _ = AdminUser.objects.update_or_create(
            email=email,
            defaults={
                'id': user_id,
                **validated_data
            }
        )
        return instance


class ClientUserSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)

    class Meta:
        model = ClientUser
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def create(self, validated_data):
        user_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"cli_{int(time.time()*1000)}"
        email = validated_data.get('email')

        instance, _ = ClientUser.objects.update_or_create(
            email=email,
            defaults={
                'id': user_id,
                **validated_data
            }
        )
        return instance


class InterviewRequestSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    clientId = serializers.CharField(source='client.id', read_only=True)
    internId = serializers.CharField(source='intern.id', read_only=True)
    batchId = serializers.CharField(source='batch.id', read_only=True)
    client = serializers.PrimaryKeyRelatedField(queryset=ClientUser.objects.all(), required=False, allow_null=True)
    intern = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), required=False, allow_null=True)
    batch = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), required=False, allow_null=True)

    # Read-only enriched fields
    clientName = serializers.CharField(source='client.companyName', read_only=True)
    internName = serializers.CharField(source='intern.name', read_only=True)
    batchName = serializers.CharField(source='batch.name', read_only=True)

    class Meta:
        model = InterviewRequest
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def to_internal_value(self, data):
        data_copy = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'clientId' in data_copy and 'client' not in data_copy:
            data_copy['client'] = data_copy['clientId']
        if 'internId' in data_copy and 'intern' not in data_copy:
            data_copy['intern'] = data_copy['internId']
        if 'batchId' in data_copy and 'batch' not in data_copy:
            data_copy['batch'] = data_copy['batchId']
        return super().to_internal_value(data_copy)

    def create(self, validated_data):
        req_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"intv_{int(time.time()*1000)}"
        validated_data['id'] = req_id
        return super().create(validated_data)


class AppSettingsSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, default="global")
    batchId = serializers.CharField(source='batch.id', read_only=True, required=False, allow_null=True)
    batch = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), required=False, allow_null=True)

    class Meta:
        model = AppSettingsModel
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def create(self, validated_data):
        batch_id = self.initial_data.get('batchId') or self.initial_data.get('batch')
        setting_id = validated_data.pop('id', None) or self.initial_data.get('id') or (f"batch_{batch_id}" if batch_id else "global")

        if batch_id and 'batch' not in validated_data:
            try:
                validated_data['batch'] = Batch.objects.get(id=batch_id)
            except Batch.DoesNotExist:
                pass

        instance, _ = AppSettingsModel.objects.update_or_create(
            id=setting_id,
            defaults=validated_data
        )
        return instance

    def update(self, instance, validated_data):
        batch_id = self.initial_data.get('batchId') or self.initial_data.get('batch')
        if batch_id:
            try:
                validated_data['batch'] = Batch.objects.get(id=batch_id)
            except Batch.DoesNotExist:
                pass
        return super().update(instance, validated_data)


class ScheduledMeetingSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    batchId = serializers.CharField(source='batch.id', read_only=True, required=False, allow_null=True)
    batch = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), required=False, allow_null=True)

    class Meta:
        model = ScheduledMeeting
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def create(self, validated_data):
        meet_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"meet_{int(time.time()*1000)}"
        batch_val = validated_data.get('batch') or self.initial_data.get('batch') or self.initial_data.get('batchId')

        if batch_val and not isinstance(batch_val, Batch):
            try:
                validated_data['batch'] = Batch.objects.get(id=str(batch_val))
            except Exception:
                pass

        instance, _ = ScheduledMeeting.objects.update_or_create(
            id=meet_id,
            defaults=validated_data
        )
        return instance

    def update(self, instance, validated_data):
        batch_val = validated_data.get('batch') or self.initial_data.get('batch') or self.initial_data.get('batchId')
        if batch_val and not isinstance(batch_val, Batch):
            try:
                validated_data['batch'] = Batch.objects.get(id=str(batch_val))
            except Exception:
                pass
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.batch:
            data['batchId'] = instance.batch.id
            data['batchName'] = instance.batch.name
        else:
            data['batchId'] = None
        return data


class InternEvaluationRoundSerializer(serializers.ModelSerializer):
    studentId = serializers.CharField(source='student.id', read_only=True)
    studentName = serializers.CharField(source='student.name', read_only=True)
    batchId = serializers.CharField(source='batch.id', read_only=True, allow_null=True)

    class Meta:
        model = InternEvaluationRound
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def create(self, validated_data):
        round_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"eval_{int(time.time()*1000)}"
        student_val = validated_data.get('student') or self.initial_data.get('student') or self.initial_data.get('studentId')
        batch_val = validated_data.get('batch') or self.initial_data.get('batch') or self.initial_data.get('batchId')

        if student_val and not isinstance(student_val, Student):
            try:
                validated_data['student'] = Student.objects.get(id=str(student_val))
            except Exception:
                pass
        if batch_val and not isinstance(batch_val, Batch):
            try:
                validated_data['batch'] = Batch.objects.get(id=str(batch_val))
            except Exception:
                pass

        instance, _ = InternEvaluationRound.objects.update_or_create(
            id=round_id,
            defaults=validated_data
        )
        return instance


class BatchEvaluationRoundSerializer(serializers.ModelSerializer):
    batchId = serializers.CharField(source='batch.id', read_only=True)
    batch = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), required=False)

    class Meta:
        model = BatchEvaluationRound
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': [], 'required': False},
        }

    def to_internal_value(self, data):
        data_copy = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'batchId' in data_copy and 'batch' not in data_copy:
            data_copy['batch'] = data_copy['batchId']
        if not data_copy.get('id'):
            data_copy['id'] = f"bround_{int(time.time()*1000)}"
        return super().to_internal_value(data_copy)

    def create(self, validated_data):
        r_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"round_{int(time.time()*1000)}"
        batch_val = validated_data.get('batch') or self.initial_data.get('batch') or self.initial_data.get('batchId')
        if batch_val and not isinstance(batch_val, Batch):
            try:
                validated_data['batch'] = Batch.objects.get(id=str(batch_val))
            except Exception:
                pass
        instance, _ = BatchEvaluationRound.objects.update_or_create(
            id=r_id,
            defaults=validated_data
        )
        return instance


class ProjectAssignmentSerializer(serializers.ModelSerializer):
    batchId = serializers.CharField(source='batch.id', read_only=True, allow_null=True)

    class Meta:
        model = ProjectAssignment
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if not ret.get('technicalCategory'):
            ret['technicalCategory'] = ret.get('category') or "AI Engineering"
        if not ret.get('category'):
            ret['category'] = ret.get('technicalCategory') or "AI Engineering"
        if not ret.get('executiveSummary'):
            ret['executiveSummary'] = ret.get('description') or ""
        if not ret.get('description'):
            ret['description'] = ret.get('executiveSummary') or ""
        if not ret.get('leaderboardPoints'):
            ret['leaderboardPoints'] = ret.get('points') or 100
        if not ret.get('points'):
            ret['points'] = ret.get('leaderboardPoints') or 100
        if not ret.get('batchId') and instance.batch_id:
            ret['batchId'] = instance.batch_id
        return ret

    def create(self, validated_data):
        p_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"proj_{int(time.time()*1000)}"
        batch_val = validated_data.get('batch') or self.initial_data.get('batch') or self.initial_data.get('batchId')
        if batch_val and not isinstance(batch_val, Batch):
            try:
                validated_data['batch'] = Batch.objects.get(id=str(batch_val))
            except Exception:
                pass
        for field in ['technicalCategory', 'executiveSummary', 'detailedInstructions', 'priority', 'resources', 'mentorObservationBenchmark', 'leaderboardPoints', 'batchName']:
            if field in self.initial_data and field not in validated_data:
                validated_data[field] = self.initial_data[field]
        if 'technicalCategory' in validated_data and not validated_data.get('category'):
            validated_data['category'] = validated_data['technicalCategory']
        elif 'category' in validated_data and not validated_data.get('technicalCategory'):
            validated_data['technicalCategory'] = validated_data['category']
        if 'executiveSummary' in validated_data and not validated_data.get('description'):
            validated_data['description'] = validated_data['executiveSummary']
        elif 'description' in validated_data and not validated_data.get('executiveSummary'):
            validated_data['executiveSummary'] = validated_data['description']
        if 'leaderboardPoints' in validated_data and not validated_data.get('points'):
            validated_data['points'] = validated_data['leaderboardPoints']
        elif 'points' in validated_data and not validated_data.get('leaderboardPoints'):
            validated_data['leaderboardPoints'] = validated_data['points']

        instance, _ = ProjectAssignment.objects.update_or_create(
            id=p_id,
            defaults=validated_data
        )
        return instance


class ProjectSubmissionSerializer(serializers.ModelSerializer):
    studentId = serializers.CharField(source='student.id', read_only=True, allow_null=True)

    class Meta:
        model = ProjectSubmission
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if not ret.get('githubRepoUrl'):
            ret['githubRepoUrl'] = ret.get('githubUrl') or ""
        if not ret.get('githubUrl'):
            ret['githubUrl'] = ret.get('githubRepoUrl') or ""
        if not ret.get('submissionNotes'):
            ret['submissionNotes'] = ret.get('notes') or ""
        if not ret.get('notes'):
            ret['notes'] = ret.get('submissionNotes') or ""
        if not ret.get('mentorFeedback'):
            ret['mentorFeedback'] = ret.get('feedback') or ""
        if not ret.get('feedback'):
            ret['feedback'] = ret.get('mentorFeedback') or ""
        if not ret.get('studentId') and instance.student_id:
            ret['studentId'] = instance.student_id
        return ret

    def create(self, validated_data):
        sub_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"sub_{int(time.time()*1000)}"
        student_val = validated_data.get('student') or self.initial_data.get('student') or self.initial_data.get('studentId')
        if student_val and not isinstance(student_val, Student):
            try:
                validated_data['student'] = Student.objects.get(id=str(student_val))
            except Exception:
                pass
        for field in ['githubRepoUrl', 'fileName', 'fileSize', 'demoVideoUrl', 'demoVideoName', 'submissionNotes', 'gradePoints', 'mentorFeedback']:
            if field in self.initial_data and field not in validated_data:
                validated_data[field] = self.initial_data[field]
        if 'githubRepoUrl' in validated_data and not validated_data.get('githubUrl'):
            validated_data['githubUrl'] = validated_data['githubRepoUrl']
        elif 'githubUrl' in validated_data and not validated_data.get('githubRepoUrl'):
            validated_data['githubRepoUrl'] = validated_data['githubUrl']
        if 'submissionNotes' in validated_data and not validated_data.get('notes'):
            validated_data['notes'] = validated_data['submissionNotes']
        elif 'notes' in validated_data and not validated_data.get('submissionNotes'):
            validated_data['submissionNotes'] = validated_data['notes']
        if 'mentorFeedback' in validated_data and not validated_data.get('feedback'):
            validated_data['feedback'] = validated_data['mentorFeedback']
        elif 'feedback' in validated_data and not validated_data.get('mentorFeedback'):
            validated_data['mentorFeedback'] = validated_data['feedback']

        instance, _ = ProjectSubmission.objects.update_or_create(
            id=sub_id,
            defaults=validated_data
        )
        return instance


class ShiftPatternSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftPattern
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def create(self, validated_data):
        s_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"shift_{int(time.time()*1000)}"
        instance, _ = ShiftPattern.objects.update_or_create(
            id=s_id,
            defaults=validated_data
        )
        return instance


class InternRosterAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternRosterAssignment
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def create(self, validated_data):
        r_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"roster_{int(time.time()*1000)}"
        instance, _ = InternRosterAssignment.objects.update_or_create(
            id=r_id,
            defaults=validated_data
        )
        return instance


class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def create(self, validated_data):
        att_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"att_{int(time.time()*1000)}"
        instance, _ = AttendanceRecord.objects.update_or_create(
            id=att_id,
            defaults=validated_data
        )
        return instance


class PunchLogEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = PunchLogEntry
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def create(self, validated_data):
        p_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"punch_{int(time.time()*1000)}"
        instance, _ = PunchLogEntry.objects.update_or_create(
            id=p_id,
            defaults=validated_data
        )
        return instance


class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': [], 'required': False},
        }

    def create(self, validated_data):
        l_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"leave_{int(time.time()*1000)}"
        instance, _ = LeaveRequest.objects.update_or_create(
            id=l_id,
            defaults=validated_data
        )
        return instance


class HolidayEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = HolidayEvent
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': [], 'required': False},
        }

    def create(self, validated_data):
        h_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"hol_{int(time.time()*1000)}"
        instance, _ = HolidayEvent.objects.update_or_create(
            id=h_id,
            defaults=validated_data
        )
        return instance


class DailyActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyActivityLog
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': [], 'required': False},
        }

    def create(self, validated_data):
        d_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"log_{int(time.time()*1000)}"
        instance, _ = DailyActivityLog.objects.update_or_create(
            id=d_id,
            defaults=validated_data
        )
        return instance


class AppNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppNotification
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def create(self, validated_data):
        n_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"notif_{int(time.time()*1000)}"
        instance, _ = AppNotification.objects.update_or_create(
            id=n_id,
            defaults=validated_data
        )
        return instance


class InternResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternResource
        fields = '__all__'
        extra_kwargs = {
            'id': {'validators': []},
        }

    def create(self, validated_data):
        r_id = validated_data.pop('id', None) or self.initial_data.get('id') or f"res_{int(time.time()*1000)}"
        instance, _ = InternResource.objects.update_or_create(
            id=r_id,
            defaults=validated_data
        )
        return instance

