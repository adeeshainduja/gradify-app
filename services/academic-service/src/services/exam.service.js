const prisma = require("../config/prisma");

// ── CRUD ──────────────────────────────────────────────────────────────────────

/**
 * Create an exam, scoped to the authenticated user.
 * Verifies the target subject belongs to this user.
 */
exports.createExam = async (data, userId) => {
    // Ownership check – prevent cross-user data injection
    const subject = await prisma.subject.findFirst({
        where: { id: Number(data.subjectId), userId }
    });
    if (!subject) {
        throw new Error("Subject not found or does not belong to you");
    }

    return await prisma.exam.create({
        data: {
            title:         data.title,
            examType:      data.examType      ?? "FINAL",
            examDate:      new Date(data.examDate),
            startTime:     data.startTime     ?? "09:00",
            duration:      Number(data.duration) || 120,
            venue:         data.venue          ?? null,
            totalMarks:    Number(data.totalMarks) || 100,
            obtainedMarks: data.obtainedMarks !== undefined ? Number(data.obtainedMarks) : null,
            grade:         data.grade          ?? null,
            feedback:      data.feedback       ?? null,
            notes:         data.notes          ?? null,
            weight:        Number(data.weight) || 0,
            status:        data.status         ?? "UPCOMING",
            subjectId:     Number(data.subjectId),
            userId,
        },
        include: {
            subject: { include: { semester: true } }
        }
    });
};

/**
 * Get all exams for the user, ordered by exam date ascending.
 * Supports optional ?subjectId and ?status query filters.
 */
exports.getExams = async (userId, filters = {}) => {
    const where = { userId };
    if (filters.subjectId) where.subjectId = Number(filters.subjectId);
    if (filters.status)    where.status    = filters.status;

    return await prisma.exam.findMany({
        where,
        include: {
            subject: { include: { semester: true } }
        },
        orderBy: { examDate: "asc" }
    });
};

/**
 * Get a single exam by ID — only if it belongs to this user.
 */
exports.getExamById = async (id, userId) => {
    return await prisma.exam.findFirst({
        where: { id: Number(id), userId },
        include: {
            subject: { include: { semester: true } }
        }
    });
};

/**
 * Partially update an exam — only updates fields present in the payload.
 * Verifies ownership and optionally verifies a new subjectId also belongs to the user.
 */
exports.updateExam = async (id, data, userId) => {
    const existing = await prisma.exam.findFirst({
        where: { id: Number(id), userId }
    });
    if (!existing) return null;

    const updateData = {};
    if (data.title         !== undefined) updateData.title         = data.title;
    if (data.examType      !== undefined) updateData.examType      = data.examType;
    if (data.examDate      !== undefined) updateData.examDate      = new Date(data.examDate);
    if (data.startTime     !== undefined) updateData.startTime     = data.startTime;
    if (data.duration      !== undefined) updateData.duration      = Number(data.duration);
    if (data.venue         !== undefined) updateData.venue         = data.venue;
    if (data.totalMarks    !== undefined) updateData.totalMarks    = Number(data.totalMarks);
    if (data.obtainedMarks !== undefined) updateData.obtainedMarks = data.obtainedMarks !== null ? Number(data.obtainedMarks) : null;
    if (data.grade         !== undefined) updateData.grade         = data.grade;
    if (data.feedback      !== undefined) updateData.feedback      = data.feedback;
    if (data.notes         !== undefined) updateData.notes         = data.notes;
    if (data.weight        !== undefined) updateData.weight        = Number(data.weight);
    if (data.status        !== undefined) updateData.status        = data.status;
    if (data.subjectId     !== undefined) {
        const subject = await prisma.subject.findFirst({
            where: { id: Number(data.subjectId), userId }
        });
        if (!subject) throw new Error("Target subject not found or does not belong to you");
        updateData.subjectId = Number(data.subjectId);
    }

    return await prisma.exam.update({
        where:   { id: Number(id) },
        data:    updateData,
        include: { subject: { include: { semester: true } } }
    });
};

/**
 * Delete an exam — verifies ownership first.
 */
exports.deleteExam = async (id, userId) => {
    const existing = await prisma.exam.findFirst({
        where: { id: Number(id), userId }
    });
    if (!existing) return null;

    return await prisma.exam.delete({ where: { id: Number(id) } });
};
