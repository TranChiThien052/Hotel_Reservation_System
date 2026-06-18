export const FormModalModes = {
    CREATE: "create",
    UPDATE: "update",
    VIEW: "view",
} as const;

export type FormModalMode = typeof FormModalModes[keyof typeof FormModalModes];