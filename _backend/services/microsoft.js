/* backend/services/microsoft.js */

export const getMeetings = async () => {
    // Mock Data: In the future, Python pushes real Outlook events here
    return [
        { time: "10:00 AM", title: "Daily Standup", type: "Teams Meeting", color: "blue" },
        { time: "2:00 PM", title: "Client Req Review", type: "Contoso Project", color: "purple" }
    ];
};

export const getCommsPulse = async () => {
    return [
        { type: 'Outlook', from: 'Sarah Mgr', subject: 'Budget Approval Needed', time: '10m', color: 'pulse-outlook' },
        { type: 'Teams', from: 'Dev Group', subject: 'Deployment failed in UAT', time: '32m', color: 'pulse-teams' },
        { type: 'Outlook', from: 'Jira Alert', subject: 'Ticket #492 Assigned', time: '1h', color: 'pulse-outlook' }
    ];
};

export const logWorkHours = async (logData) => {
    console.log("📝 [Service] Logging Hours to Dataverse:", logData);
    // Simulate processing time
    return { success: true, message: "Time entry created in Dynamics 365", id: Math.floor(Math.random() * 1000) };
};

export const createDispatch = async (dispatchData) => {
    console.log("📦 [Service] Creating Dispatch:", dispatchData);
    return { success: true, status: "Queued for Deployment" };
};