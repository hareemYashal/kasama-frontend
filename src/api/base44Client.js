import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
// export const base44 = createClient({
//   appId: "68818fb814325f78263f830d", 
//   requiresAuth: true // Ensure authentication is required for all operations
// });
export const base44 = {
    entities: {
        Trip: {},
        Expense: {},
        Itinerary: {},
        Contribution: {},
        ChatMessage: {},
        TripActivity: {},
        Feedback: {}
    },
    auth: {},
    functions: {
        tripInvitePreview: async () => { },
        chat: async () => { },
        cancelTrip: async () => { },
        getAuthToken: async () => { }
    },
    integrations: {
        Core: {
            InvokeLLM: async () => { },
            SendEmail: async () => { },
            UploadFile: async () => { },
            GenerateImage: async () => { },
            ExtractDataFromUploadedFile: async () => { }
        }
    }
};