const prisma = require("../config/prisma");

/**
 * Create a new semester for a user
 */
exports.createSemester = async (data, userId) => {
    return await prisma.semester.create({
        data: {
            name:         data.name,
            academicYear: data.academicYear,
            startDate:    new Date(data.startDate),
            endDate:      new Date(data.endDate),
            status:       data.status,
            userId:       userId,
        }
    });
};

/**
 * Get all semesters belonging to a user, newest first
 */
exports.getAllSemesters = async (userId) => {
    return await prisma.semester.findMany({
        where:   { userId },
        orderBy: { createdAt: "desc" }
    });
};

/**
 * Get a single semester by id — only if it belongs to the user
 */
exports.getSemesterById = async (id, userId) => {
    return await prisma.semester.findFirst({
        where: {
            id:     Number(id),
            userId: userId
        }
    });
};

/**
 * Update semester fields — verifies ownership first
 */
exports.updateSemester = async (id, data, userId) => {
    // Only update fields that were provided
    const updateData = {};

    if (data.name         !== undefined) updateData.name         = data.name;
    if (data.academicYear !== undefined) updateData.academicYear = data.academicYear;
    if (data.startDate    !== undefined) updateData.startDate    = new Date(data.startDate);
    if (data.endDate      !== undefined) updateData.endDate      = new Date(data.endDate);
    if (data.status       !== undefined) updateData.status       = data.status;

    // Ownership check: ensure the semester belongs to this user
    const existing = await prisma.semester.findFirst({
        where: { id: Number(id), userId }
    });

    if (!existing) return null;

    return await prisma.semester.update({
        where: { id: Number(id) },
        data:  updateData
    });
};

/**
 * Delete semester — verifies ownership first
 */
exports.deleteSemester = async (id, userId) => {
    // Ownership check
    const existing = await prisma.semester.findFirst({
        where: { id: Number(id), userId }
    });

    if (!existing) return null;

    return await prisma.semester.delete({
        where: { id: Number(id) }
    });
};
