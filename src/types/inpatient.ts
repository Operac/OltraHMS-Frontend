
export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    mrn: string; // Medical Record Number
}

export interface Prescription {
    id: string;
    medicationName: string;
    dosage: string;
    frequency: string; // e.g., "TID", "Q4H"
    route: string; // "ORAL", "IV"
    status: string;
    instructions?: string;
    medicalRecord: {
        doctor: {
            user: {
                name: string;
            };
        };
    };
}

export interface MedicationAdministration {
    id: string;
    prescriptionId: string;
    patientId: string;
    scheduledTime: string; // ISO Date
    administeredTime?: string;
    status: 'PENDING' | 'GIVEN' | 'MISSED' | 'REFUSED' | 'HELD';
    notes?: string;
    administeredBy?: {
        user: {
            name: string;
        };
    };
}

export interface FluidBalance {
    id: string;
    patientId: string;
    type: 'INTAKE' | 'OUTPUT';
    fluidType: string; // "Normal Saline", "Urine"
    amount: number; // ml
    recordedAt: string;
    recordedBy?: {
        id: string;
    };
}


export interface WardRound {
    id: string;
    admissionId: string;
    notes: string;
    roundTime: string;
    conductedBy: {
        user: {
            name: string;
        };
    };
}

export interface InpatientData {
    prescriptions: Prescription[];
    administrations: MedicationAdministration[];
    rounds?: WardRound[];
}
