"use server";

export async function logAcountdAccess(userId: string) {
  console.log(
    `User ${userId} accessed the account at ${new Date().toISOString()}`
  );
}
