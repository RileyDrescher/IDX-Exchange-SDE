import { parsePhotos } from "./photos";

test("parses a JSON string of URLs", () => {
    expect(parsePhotos('["a.jpg","b.jpg"]')).toEqual(["a.jpg", "b.jpg"]);
});

test("accepts an already-parsed array", () => {
    expect(parsePhotos(["a.jpg"])).toEqual(["a.jpg"]);
});

test("drops empty and non-string entries", () => {
    expect(parsePhotos(["a.jpg", "", "  ", null, 5])).toEqual(["a.jpg"]);
});

test.each([[null], [undefined], [""], ["not json"], ['{"a":1}']])(
    "returns [] for invalid input %p",
    (input) => {
        expect(parsePhotos(input)).toEqual([]);
    }
);
