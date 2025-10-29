export interface Firm {
  name: string;
  gstin?: string;
  address: string;
  mobile: string;
}

export interface AttachmentFile {
  filename: string;
  mimeType: string;
  data: string; // base64 encoded string (without the data:mime/type;base64, prefix)
}
