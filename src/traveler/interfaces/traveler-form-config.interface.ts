export interface FieldConfig {
  key: string;
  label: string;
  required: boolean;
  enabled: boolean;
}

export interface SectionConfig {
  key: 'outbound_flight' | 'return_flight' | 'dietary' | 'professional';
  label: string;
  enabled: boolean;
  fields: FieldConfig[];
}

export interface TravelerFormConfigInterface {
  eventId: any;
  sections: SectionConfig[];
  whatsappGroupUrl: string;
}
