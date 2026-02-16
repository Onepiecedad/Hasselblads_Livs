import type { Context } from "@netlify/functions";
import https from "node:https";

/**
 * Temporary utility function to update WooCommerce shipping costs.
 * Calls WooCommerce REST API directly on the WordPress backend.
 * 
 * Usage: GET /.netlify/functions/wc-update-shipping?action=list
 *        GET /.netlify/functions/wc-update-shipping?action=update&cost=49
 */

const WORDPRESS_BACKEND_IP = "199.16.172.188";
const WORDPRESS_HOST = "hasselbladslivs.se";
const WC_KEY = "ck_bba1d81875ca83bb69963027dca068ec1b498067";
const WC_SECRET = "cs_81b7472660a5e4e2ee9e7058a51803e6efbce4fd";

function makeWCRequest(path: string, method: string = "GET", body?: string): Promise<{ status: number; data: any }> {
    return new Promise((resolve, reject) => {
        // Use query-string auth (works with self-signed SSL)
        const separator = path.includes("?") ? "&" : "?";
        const authPath = `${path}${separator}consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}`;

        const options: https.RequestOptions = {
            hostname: WORDPRESS_BACKEND_IP,
            port: 443,
            path: authPath,
            method: method,
            rejectUnauthorized: false,
            headers: {
                "Host": WORDPRESS_HOST,
                "Content-Type": "application/json",
                "User-Agent": "HasselbladsLivs/ShippingUpdater",
            },
        };

        if (body) {
            options.headers!["Content-Length"] = Buffer.byteLength(body).toString();
        }

        const req = https.request(options, (res) => {
            const chunks: Buffer[] = [];
            res.on("data", (chunk) => chunks.push(chunk));
            res.on("end", () => {
                const responseBody = Buffer.concat(chunks).toString("utf-8");
                try {
                    resolve({ status: res.statusCode || 500, data: JSON.parse(responseBody) });
                } catch {
                    resolve({ status: res.statusCode || 500, data: responseBody });
                }
            });
        });

        req.on("error", (err) => reject(err));
        if (body) req.write(body);
        req.end();
    });
}

export default async (request: Request, context: Context): Promise<Response> => {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "list";
    const headers = { "Content-Type": "application/json" };

    try {
        if (action === "list") {
            // List all shipping zones
            const zones = await makeWCRequest("/wp-json/wc/v3/shipping/zones");

            // For each zone, get its methods
            const results: any[] = [];
            if (Array.isArray(zones.data)) {
                for (const zone of zones.data) {
                    const methods = await makeWCRequest(`/wp-json/wc/v3/shipping/zones/${zone.id}/methods`);
                    results.push({
                        zone_id: zone.id,
                        zone_name: zone.name,
                        methods: methods.data,
                    });
                }
            }

            return new Response(JSON.stringify({ zones: results }, null, 2), { status: 200, headers });

        } else if (action === "update") {
            const newCost = url.searchParams.get("cost") || "49";
            const zoneId = url.searchParams.get("zone") || "";
            const methodId = url.searchParams.get("method") || "";

            if (!zoneId || !methodId) {
                return new Response(JSON.stringify({
                    error: "Missing zone and method IDs. First use ?action=list to find them, then use ?action=update&zone=ID&method=ID&cost=49"
                }), { status: 400, headers });
            }

            // Update the shipping method cost
            const result = await makeWCRequest(
                `/wp-json/wc/v3/shipping/zones/${zoneId}/methods/${methodId}`,
                "PUT",
                JSON.stringify({ settings: { cost: { value: newCost } } })
            );

            return new Response(JSON.stringify({
                message: `Updated shipping cost to ${newCost}`,
                result: result.data,
            }, null, 2), { status: 200, headers });

        } else if (action === "tax") {
            // Get tax settings
            const taxSettings = await makeWCRequest("/wp-json/wc/v3/settings/tax");
            const generalSettings = await makeWCRequest("/wp-json/wc/v3/settings/general");

            // Filter for relevant settings
            const taxRelated = Array.isArray(generalSettings.data)
                ? generalSettings.data.filter((s: any) => s.id?.includes("tax") || s.id?.includes("price"))
                : generalSettings.data;

            return new Response(JSON.stringify({
                tax_settings: taxSettings.data,
                general_tax_settings: taxRelated,
            }, null, 2), { status: 200, headers });
        }

        return new Response(JSON.stringify({ error: "Unknown action. Use: list, update, or tax" }), { status: 400, headers });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
};
