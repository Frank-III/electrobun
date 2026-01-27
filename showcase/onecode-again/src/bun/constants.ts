export const IS_DEV = process.env.NODE_ENV !== "production";
export const AUTH_SERVER_PORT = IS_DEV ? 21322 : 21321;
