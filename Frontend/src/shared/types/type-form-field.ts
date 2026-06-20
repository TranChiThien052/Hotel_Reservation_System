export const FormFieldTypes = {
  TEXT: "text",
  NUMBER: "number",
    SELECT: "select",
    TEXTAREA: "textarea",
    INPUT: "input",
    INPUT_NUMBER: "input_number",
    DATE: "date",
    TIME: "time",
    TIME_PICKER: "time_picker",
    DATE_PICKER: "date_picker",
    CHECKBOX: "checkbox",
    RADIO: "radio",
    SWITCH: "switch",
    IMAGE_UPLOAD: "image_upload",
    FILE_UPLOAD: "file_upload",
    PASSWORD: "password",
    SELECT_FETCH: "select_fetch",
    ARRAY_INPUT: "array_input",
    EMAIL: "email",
} as const;

export type FormFieldType = typeof FormFieldTypes[keyof typeof FormFieldTypes];