CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_semesters_user
ON semesters(user_id);

CREATE INDEX idx_subjects_semester
ON subjects(semester_id);

CREATE INDEX idx_assignments_subject
ON assignments(subject_id);

CREATE INDEX idx_exams_subject
ON exams(subject_id);

CREATE INDEX idx_notifications_user
ON notifications(user_id);