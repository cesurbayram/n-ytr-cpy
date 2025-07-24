export interface JobSelectRequest {
    type: string;
    data: {
        controllerId: string;
        shiftId: string;
        type:"getJobList";
        ipAddress: string;
    };
}

export interface JobSelectSocketData {
    type: "jobList";
    ip_address: string;
    controllerId: string;
    values: JobSelectValue[];
}

export interface JobSelectValue {
    id: string;
    name: string;
    filename: string;
    created_at: string;
}