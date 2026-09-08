from rest_framework import serializers
import time
from .models import (
    Batch, Student, Score, LearnHubModule, LearnHubStudentProgress,
    LiveQuestion, LiveQAResponse, Assignment, AssignmentSubmission,
    CertificateTemplate, AdminUser, AppSettingsModel, ScheduledMeeting,
    ClientUser, InterviewRequest
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
            data['batchName'] = "All Batches"
        return data
