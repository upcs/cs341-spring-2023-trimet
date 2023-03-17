const dom = require("./dom.js");
const co = require("./common.js");

const windowPromise = dom.loadScripts(co.testUrls);

test("Query URLs are created correctly", async () => {
	const window = await windowPromise;

	// Monkey-patch in our own app ID for testing.
	window.APP_ID = "FUNKEY";

	let url = window.makeAppUrl("https://www.example.com/");
	expect(url).toEqual("https://www.example.com/?appID=FUNKEY");

	url = window.makeAppUrl("localFile.json", {key: "value"});
	expect(url).toEqual("localFile.json?appID=FUNKEY&key=value");
});

test("fetchData() can access data and handle errors", async () => {
	const window = await windowPromise;
	expect.assertions(4);

	let text = await window.fetchText("tests/data/testFile.txt");
	expect(typeof(text)).toBe("string");
	expect(text[0]).toBe("X");

	await window.fetchText("tests/data/nonExistent.txt")
		.catch(err => expect(err).toBeDefined());

	await window.fetchText("https://www.example.com")
		.catch(err => expect(err).toBeDefined());
});

test("fetchJson() loads JSON correctly", async () => {
	const window = await windowPromise;
	expect.assertions(4);

	let json = await window.fetchJson("tests/data/testJson.json");
	expect(typeof(json)).toBe("object");
	expect(json.string).toBe("hello world");
	expect(json.object.key).toBe("value")

	await window.fetchJson("tests/data/testFile.txt")
		.catch(err => expect(err).toBeDefined());
});

test("fetchXml() loads XML correctly", async () => {
	const window = await windowPromise;
	expect.assertions(4);

	let xml = await window.fetchXml("tests/data/testXml.xml");
	expect(xml instanceof window.Document).toBe(true);
	expect(xml.documentElement.children.length).toBe(2);
	expect(xml.documentElement.children[0].getAttribute("attr")).toBe("value");

	await window.fetchJson("tests/data/testFile.txt")
		.catch(err => expect(err).toBeDefined());
});
