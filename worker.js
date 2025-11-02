
// Worker code reads the secret DISCORD_WEBHOOK_URL from the environment

const TARGET_PATH = '/submit_image';

export default {
    async fetch(request, env) {
        // 1. Check Method and URL Path
        if (request.method !== 'POST') {
            return new Response('Method Not Allowed. Only POST requests are permitted.', { status: 405 });
        }

        const url = new URL(request.url);

        // Check if the path matches the intended endpoint
        if (url.pathname !== TARGET_PATH) {
            return new Response('Not Found. Invalid API endpoint.', { status: 404 });
        }

        // 2. Access Secret Webhook URL
        const WEBHOOK_URL = env.DISCORD_WEBHOOK_URL;
        if (!WEBHOOK_URL) {
            return new Response('Server configuration error. Webhook URL is missing.', { status: 500 });
        }

        try {
            // 3. Parse Incoming Metadata
            const submissionData = await request.json();
            
            // 4. Construct the Discord Webhook Payload (Message)
            const discordPayload = constructDiscordPayload(submissionData);

            // 5. Forward the Request to Discord
            const webhookRequest = new Request(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(discordPayload)
            });

            const response = await fetch(webhookRequest);

            // 6. Return Sanitzed Response with CORS Header
            return new Response(response.body, {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*', // Enable CORS for your GitHub Pages site
                },
            });

        } catch (e) {
            console.error(e);
            return new Response(`Error processing request: ${e.message}`, { status: 500 });
        }
    }
};

/**
 * Constructs a Discord webhook body (JSON) from the client's metadata.
 * @param {object} data - The submission metadata object from the client.
 * @returns {object} A Discord-compatible webhook payload.
 */
function constructDiscordPayload(data) {
    const categoriesList = (data.categories || []).map(c => `\`${c}\``).join(', ');
    
    // Create an Embed for a clean, structured Discord message
    const embed = {
        title: `🖼️ New Image Submission: ${data.name || 'Untitled'}`,
        color: 3066993, // A nice blue color
        fields: [
            {
                name: '📁 File Name',
                value: `**${data.file || 'N/A'}**`,
                inline: true,
            },
            {
                name: '📍 Coordinates',
                value: `\`${data.coord ? data.coord.join(', ') : 'N/A'}\``,
                inline: true,
            },
            {
                name: '🏷️ Categories',
                value: categoriesList || 'None',
                inline: false,
            },
            {
                name: '📝 Description',
                value: data.description || '*No description provided.*',
                inline: false,
            }
        ],
        timestamp: new Date().toISOString(), // Adds the submission time
    };

    return {
        // Optionally, you can include a main 'content' message here
        // content: "A new image was submitted!", 
        embeds: [embed],
        username: "Submission Bot" // Customize the webhook name
    };
}
