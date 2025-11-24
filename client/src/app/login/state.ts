export type AuthFormState =
  | { status: "idle"; message: null }
  | { status: "error"; message: string };

export const initialAuthState: AuthFormState = {
  status: "idle",
  message: null,
};

