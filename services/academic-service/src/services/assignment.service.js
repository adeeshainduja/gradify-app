const prisma = require("../config/prisma");

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Auto-mark overdue: any PENDING or SUBMITTED assignment whose dueDate is in
 * the past is flipped to OVERDUE. Called before every fetch so the board stays
 * accurate without requiring manual status changes.
 */
const autoMarkOverdue = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // compare against start-of-day

    await prisma.assignment.updateMany({
        where: {
            userId,
            dueDate: { lt: today },
            status:  { in: ["PENDING", "SUBMITTED"] }
        },
        data: { status: "OVERDUE" }
    });
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

/**
 * Create a new assignment scoped to the authenticated user.
 * The subject ownership is verified so users cannot create assignments under
 * another user's subjects.
 */
exports.createAssignment = async (data, userId) => {
    // Verify subject belongs to this user
    const subject = await prisma.subject.findFirst({
        where: { id: Number(data.subjectId), userId }
    });

    if (!subject) {
        throw new Error("Subject not found or does not belong to you");
    }

    return await prisma.assignment.create({
        data: {
            title:       data.title,
            description: data.description       ?? null,
            dueDate:     new Date(data.dueDate),
            priority:    data.priority           ?? "MEDIUM",
            status:      data.status             ?? "PENDING",
            progress:    Number(data.progress)   || 0,
            marks:       data.marks !== undefined  ? Number(data.marks)    : null,
            maxMarks:    data.maxMarks !== undefined ? Number(data.maxMarks) : 100,
            weight:      data.weight !== undefined   ? Number(data.weight)   : 0,
            isGroup:     data.isGroup              ?? false,
            subjectId:   Number(data.subjectId),
            userId,
        },
        include: {
            subject: {
                include: { semester: true }
            }
        }
    });
};

/**
 * Get all assignments for the user.
 * Optionally filter by subjectId or status via query params.
 * Auto-marks overdue assignments before returning.
 */
exports.getAssignments = async (userId, filters = {}) => {
    await autoMarkOverdue(userId);

    const where = { userId };
    if (filters.subjectId) where.subjectId = Number(filters.subjectId);
    if (filters.status)    where.status    = filters.status;

    return await prisma.assignment.findMany({
        where,
        include: {
            subject: {
                include: { semester: true }
            }
        },
        orderBy: { dueDate: "asc" }
    });
};

/**
 * Get a single assignment by ID — only if it belongs to this user.
 */
exports.getAssignmentById = async (id, userId) => {
    return await prisma.assignment.findFirst({
        where: { id: Number(id), userId },
        include: {
            subject: {
                include: { semester: true }
            }
        }
    });
};

/**
 * Update an assignment — verifies ownership first.
 * Only updates fields that are present in the payload.
 */
exports.updateAssignment = async (id, data, userId) => {
    const existing = await prisma.assignment.findFirst({
        where: { id: Number(id), userId }
    });
    if (!existing) return null;

    const updateData = {};
    if (data.title       !== undefined) updateData.title       = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate     !== undefined) updateData.dueDate     = new Date(data.dueDate);
    if (data.priority    !== undefined) updateData.priority    = data.priority;
    if (data.status      !== undefined) updateData.status      = data.status;
    if (data.progress    !== undefined) updateData.progress    = Number(data.progress);
    if (data.marks       !== undefined) updateData.marks       = data.marks !== null ? Number(data.marks) : null;
    if (data.maxMarks    !== undefined) updateData.maxMarks    = Number(data.maxMarks);
    if (data.weight      !== undefined) updateData.weight      = Number(data.weight);
    if (data.isGroup     !== undefined) updateData.isGroup     = Boolean(data.isGroup);
    if (data.subjectId   !== undefined) {
        // Verify new subject also belongs to this user
        const subject = await prisma.subject.findFirst({
            where: { id: Number(data.subjectId), userId }
        });
        if (!subject) throw new Error("Target subject not found or does not belong to you");
        updateData.subjectId = Number(data.subjectId);
    }

    return await prisma.assignment.update({
        where:   { id: Number(id) },
        data:    updateData,
        include: {
            subject: {
                include: { semester: true }
            }
        }
    });
};

/**
 * Delete an assignment — verifies ownership first.
 */
exports.deleteAssignment = async (id, userId) => {
    const existing = await prisma.assignment.findFirst({
        where: { id: Number(id), userId }
    });
    if (!existing) return null;

    return await prisma.assignment.delete({
        where: { id: Number(id) }
    });
};
