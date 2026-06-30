const ACADEMIC_SERVICE_URL = process.env.ACADEMIC_SERVICE_URL || "http://localhost:5002";

/**
 * Fetch subjects for a semester from academic service
 */
exports.getSemesterSubjects = async (semesterId, token) => {
  const url = `${ACADEMIC_SERVICE_URL}/api/academic/subjects?semesterId=${semesterId}`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 404) return [];
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch subjects from Academic Service: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Fetch all semesters from academic service
 */
exports.getSemesters = async (token) => {
  const url = `${ACADEMIC_SERVICE_URL}/api/academic/semesters`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch semesters from Academic Service: ${response.statusText}`);
  }

  return await response.json();
};
