export type VoiceCommand = {
  command: string;
  matcher: RegExp;
  successMessage: string;
  args?: string | number;
};
