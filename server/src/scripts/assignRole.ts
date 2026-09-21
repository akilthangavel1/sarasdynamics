import { userRepository } from "../repositories/user.repository.js";
import { roleRepository } from "../repositories/role.repository.js";
import { getDb, closeDatabase } from "../db/index.js";

/**
 * CLI utility to assign a role to a user by email.
 * Usage: npx tsx server/src/scripts/assignRole.ts <email> <role_name>
 * Example: npx tsx server/src/scripts/assignRole.ts admin@example.com SUPER_ADMIN
 */
async function main() {
  const args = process.argv.slice(2);
  const email = args[0]?.toLowerCase().trim();
  const roleName = args[1]?.toUpperCase().trim() || "SUPER_ADMIN";

  if (!email) {
    console.error("Usage: npx tsx server/src/scripts/assignRole.ts <email> [ROLE_NAME]");
    console.error("Available roles: ADMIN, SUPER_ADMIN, RECRUITER, CONTENT_WRITER");
    process.exit(1);
  }

  try {
    getDb();
    const user = await userRepository.findByEmail(email);
    if (!user) {
      console.error(`User with email '${email}' not found in database.`);
      console.error("Please sign in or sync the user first, then run this command again.");
      process.exit(1);
    }

    const roles = await roleRepository.findAll();
    const targetRole = roles.find((r) => r.name === roleName);
    if (!targetRole) {
      console.error(`Role '${roleName}' does not exist.`);
      console.error("Valid system roles:", roles.map((r) => r.name).join(", "));
      process.exit(1);
    }

    await userRepository.assignRoleByName(user.id, roleName);
    console.log(`✓ Successfully assigned role '${roleName}' to user '${email}' (ID: ${user.id}).`);

    const updatedRoles = await userRepository.getUserRoleNames(user.id);
    console.log(`Current assigned roles for ${email}:`, updatedRoles.join(", "));
  } catch (err) {
    console.error("Error assigning role:", err);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

main();
