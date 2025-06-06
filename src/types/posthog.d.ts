declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void;
      identify: (distinctId: string, properties?: Record<string, any>) => void;
      reset: () => void;
      isFeatureEnabled: (flag: string) => boolean;
      onFeatureFlags: (callback: (flags: string[]) => void) => void;
      get_distinct_id: () => string;
      people: {
        set: (properties: Record<string, any>) => void;
      };
      sessionRecording?: {
        sessionId: string;
        windowId: string;
      };
    };
  }
}

export {};
