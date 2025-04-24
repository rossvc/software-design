/**
 * Script to automatically update volunteer match statuses based on event dates
 * This would typically be run as a scheduled job (e.g., daily via cron)
 */

const db = require("../utils/db");

async function updateMatchStatuses() {
  try {
    console.log("Starting volunteer match status update...");

    // Get current date/time
    const now = new Date();

    // Find matches that need to be updated to Active status (event is happening now)
    const activateResult = await db.query(`
      UPDATE VolunteerMatching vm
      JOIN EventDetails ed ON vm.event_id = ed.id
      SET vm.status = 'Active', vm.updated_at = NOW()
      WHERE vm.status = 'Pending'
      AND ed.event_date <= NOW()
      AND DATE_ADD(ed.event_date, INTERVAL 1 DAY) > NOW()
    `);

    console.log(
      `Updated ${activateResult.affectedRows} matches to Active status`
    );

    // Find matches that need to be updated to Completed status (event is over)
    const completeResult = await db.query(`
      UPDATE VolunteerMatching vm
      JOIN EventDetails ed ON vm.event_id = ed.id
      SET vm.status = 'Completed', vm.updated_at = NOW()
      WHERE vm.status = 'Active'
      AND DATE_ADD(ed.event_date, INTERVAL 1 DAY) <= NOW()
    `);

    console.log(
      `Updated ${completeResult.affectedRows} matches to Completed status`
    );

    console.log("Volunteer match status update completed successfully");
    return {
      activated: activateResult.affectedRows,
      completed: completeResult.affectedRows,
    };
  } catch (error) {
    console.error("Error updating match statuses:", error);
    throw error;
  }
}

// If running this file directly
if (require.main === module) {
  updateMatchStatuses()
    .then((result) => {
      console.log(
        `Status update summary: ${result.activated} activated, ${result.completed} completed`
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
} else {
  // Export the function for use in other files
  module.exports = updateMatchStatuses;
}
