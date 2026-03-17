import type { AuthenticatedViewer } from "@/application/engagement";

export type SignUpRequest = {
  email: string;
  displayName: string;
  password: string;
  role?: string;
};

export type SignUpResult =
  | {
      status: "invalid_request";
      message: string;
    }
  | {
      status: "conflict";
      message: string;
    }
  | {
      status: "success";
      sessionToken: string;
      viewer: AuthenticatedViewer;
    };

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResult =
  | {
      status: "invalid_request";
      message: string;
    }
  | {
      status: "unauthorized";
      message: string;
    }
  | {
      status: "success";
      sessionToken: string;
      viewer: AuthenticatedViewer;
    };

export type LogoutRequest = {
  sessionToken: string | null;
};

export type LogoutResult =
  | {
      status: "invalid_request";
      message: string;
    }
  | {
      status: "success";
      message: string;
    };

export type LookupSessionRequest = {
  sessionToken: string | null;
};

export type LookupSessionResult =
  | {
      status: "unauthorized";
      message: string;
    }
  | {
      status: "success";
      viewer: AuthenticatedViewer;
    };
