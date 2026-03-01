import { NextResponse } from 'next/server';
import snowflake from 'snowflake-sdk';

export async function GET() {
  // 1. Create the connection object
  const connection = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT || '',
    username: process.env.SNOWFLAKE_USERNAME || '',
    password: process.env.SNOWFLAKE_PASSWORD || '',
    database: 'PRACTICE_DB',
    schema: 'PUBLIC',
    warehouse: 'COMPUTE_WH'
  });

  // 2. Wrap the whole process in a Promise so Next.js waits for Snowflake
  return new Promise((resolve) => {
    connection.connect(async (err) => {
      if (err) {
        console.error('Snowflake Connection Error:', err);
        return resolve(NextResponse.json({ error: 'Database connection failed' }, { status: 500 }));
      }

      // Helper function for Promises
      const query = (sql: string): Promise<any[]> => {
        return new Promise((res, rej) => {
          connection.execute({
            sqlText: sql,
            complete: (err, stmt, rows) => (err ? rej(err) : res(rows || [])),
          });
        });
      };

      try {
        // 3. Fetch data STRICTLY from UPCOMING_EVENTS
        const eventsRows = await query("SELECT * FROM UPCOMING_EVENTS ORDER BY EVENT_DATE ASC");

        // 4. Send the events back to the frontend
        resolve(NextResponse.json({
          success: true,
          events: eventsRows
        }));

      } catch (queryError) {
        console.error('Query Error:', queryError);
        resolve(NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 }));
      } finally {
        connection.destroy();
      }
    });
  });
}