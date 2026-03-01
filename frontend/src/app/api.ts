export const API_URL = 'http://localhost:8000/api';

export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        // If there's no token, redirect to login unless already there
        if (window.location.pathname !== '/') {
            window.location.href = '/';
        }
    }
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const handleAuthError = (response: Response) => {
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/') {
            window.location.href = '/';
        }
    }
};

export const loginUser = async (credentials: any) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!response.ok) {
        throw new Error('Login failed');
    }
    return response.json();
};

export const fetchCurrentUser = async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
        headers: getAuthHeaders(),
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error('Failed to fetch current user');
    }
    return response.json();
};

export const fetchEmailDraftForMeeting = async (meetingId: string) => {
    const response = await fetch(`${API_URL}/emails/meeting/${meetingId}`, {
        headers: getAuthHeaders(),
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to fetch email draft');
    return response.json();
};

export const sendEmailDraft = async (draftId: string) => {
    const response = await fetch(`${API_URL}/emails/${draftId}/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to send email');
    return response.json();
};

export const fetchProjects = async () => {
    const response = await fetch(`${API_URL}/projects`, {
        headers: getAuthHeaders(),
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error('Failed to fetch projects');
    }
    return response.json();
};

export const fetchProjectMeetings = async (projectId: string) => {
    const url = new URL(`${API_URL}/meetings`);
    url.searchParams.set('project_id', projectId);
    const response = await fetch(url.toString(), {
        headers: getAuthHeaders(),
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error('Failed to fetch project meetings');
    }
    return response.json();
};

export const createProject = async (projectData: { name: string; description?: string; color: string }) => {
    const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData),
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error('Failed to create project');
    }
    return response.json();
};

export const createMeeting = async (meetingData: any) => {
    const response = await fetch(`${API_URL}/meetings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(meetingData),
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error('Failed to create meeting');
    }
    return response.json();
};

export const uploadMeetingAudio = async (meetingId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const headers: any = getAuthHeaders();
    delete headers['Content-Type'];

    const response = await fetch(`${API_URL}/meetings/${meetingId}/audio`, {
        method: 'POST',
        headers,
        body: formData,
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error('Failed to upload audio');
    }
    return response.json();
};

export const processMeeting = async (meetingId: string) => {
    const response = await fetch(`${API_URL}/meetings/${meetingId}/process`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    handleAuthError(response);
    if (!response.ok) {
        throw new Error('Failed to process meeting');
    }
    return response.json();
};

export const fetchPendingActions = async () => {
    const response = await fetch(`${API_URL}/actions/pending`, { headers: getAuthHeaders() });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to fetch pending actions');
    return response.json();
};

export const fetchFollowUps = async () => {
    const response = await fetch(`${API_URL}/actions/followups`, { headers: getAuthHeaders() });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to fetch follow-ups');
    return response.json();
};

export const approveAction = async (actionId: string) => {
    const response = await fetch(`${API_URL}/actions/${actionId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to approve action');
    return response.json();
};

export const rejectAction = async (actionId: string) => {
    const response = await fetch(`${API_URL}/actions/${actionId}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to reject action');
    return response.json();
};

export const completeAction = async (actionId: string) => {
    const response = await fetch(`${API_URL}/actions/${actionId}/complete`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to complete action');
    return response.json();
};

export const completeFollowUp = async (followUpId: string) => {
    const response = await fetch(`${API_URL}/actions/followups/${followUpId}/complete`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to complete follow up');
    return response.json();
};

export const fetchMeetings = async () => {
    const response = await fetch(`${API_URL}/meetings`, { headers: getAuthHeaders() });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to fetch meetings');
    return response.json();
};

export const fetchMeetingDetail = async (id: string) => {
    const response = await fetch(`${API_URL}/meetings/${id}`, { headers: getAuthHeaders() });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to fetch meeting detail');
    return response.json();
};

export const updateMeeting = async (meetingId: string, data: any) => {
    const response = await fetch(`${API_URL}/meetings/${meetingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to update meeting');
    return response.json();
};

export const deleteMeeting = async (meetingId: string) => {
    const response = await fetch(`${API_URL}/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to delete meeting');
    return true;
};

export const updateProject = async (projectId: string, data: any) => {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
};

export const deleteProject = async (projectId: string) => {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    handleAuthError(response);
    if (!response.ok) throw new Error('Failed to delete project');
    return true;
};
