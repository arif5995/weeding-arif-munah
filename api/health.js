export function GET() {
    return Response.json({
        success: true,
        service: "vercel-function",
        timestamp: new Date().toISOString(),
    });
}