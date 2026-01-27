async function test() {
    try {
        console.log("Fetching...");
        const response = await fetch('http://localhost:8000/api/v1/tenants/by-slug/default');
        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Data:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
