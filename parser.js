const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("Paste the ski resort data below, then press ENTER and CTRL+D (or CMD+D on Mac) to submit:");

let rawData = "";

rl.on("line", (input) => {
    rawData += input + "\n";
});

rl.on("close", () => {
    const lines = rawData.split("\n").map(line => line.trim()).filter(line => line.length > 0);

    const resorts = [];
    for (let i = 0; i < lines.length; i++) {
        let name = lines[i];
        let ticketLine = lines[i + 6]; // Ticket price is always 6 lines after the name

        if (ticketLine && ticketLine.startsWith("US$")) {
            let ticketCost = parseFloat(ticketLine.match(/US\$\s*([\d,.]+)/)[1].replace(",", "").trim());

            resorts.push({
                "name": name,
                "ticket_cost": ticketCost
            });
        }
    }

    console.log("\nGenerated JSON:");
    console.log(JSON.stringify(resorts, null, 4));
});
