const axios = require('axios');

async function test() {
  try {
    // 1. login to get token
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'testuser@stanford.edu', // Wait, what is the default user?
      password: 'Password123!'
    }).catch(() => null);

    let token = loginRes?.data?.token;

    if (!token) {
      // Create user if not exists
      const regRes = await axios.post('http://localhost:5001/api/auth/register', {
        firstName: 'Test', lastName: 'User',
        email: 'test3@example.com',
        password: 'Password123!'
      });
      token = regRes.data.token;
    }

    // 2. Create subject
    const subRes = await axios.post('http://localhost:5002/api/academic/subjects', {
        firstName: 'Test', lastName: 'User', code: 'T1', credits: 3, color: 'blue', semesterId: 1
    }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { id: 1 }}));
    
    // 3. Create assignment
    const assignRes = await axios.post('http://localhost:5002/api/academic/assignments', {
        title: "Test",
        subjectId: 1,
        dueDate: "2026-09-12",
        priority: "MEDIUM",
        status: "PENDING",
        description: "",
        marks: null,
        maxMarks: 100,
        weight: 10,
        progress: 0
    }, { headers: { Authorization: `Bearer ${token}` } });

    console.log("Success!", assignRes.data);
  } catch (err) {
    console.log("Error:", err.response?.data || err.message);
  }
}
test();
